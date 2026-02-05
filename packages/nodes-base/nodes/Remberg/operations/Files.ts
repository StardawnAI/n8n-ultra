import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
import { Readable } from 'stream';
// DAS IST DER KORREKTE IMPORT FÜR DIESE BIBLIOTHEK
import FormData = require('form-data');

export async function executeFiles(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
    encoding?: 'json' | 'multipart/form-data';
}> {
    const operation = this.getNodeParameter('operation', i) as string;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};
    let encoding: 'json' | 'multipart/form-data' = 'json';

    switch (operation) {
        case 'getAll':
            endpoint = '/v1/files';
            method = 'GET';
            
            const filesOptions = this.getNodeParameter('filesAdditionalOptions', i, {}) as any;
            const queryParams = new URLSearchParams();
            if (filesOptions.folderId) queryParams.append('folderId', filesOptions.folderId);
            if (filesOptions.isFolder !== undefined) queryParams.append('isFolder', filesOptions.isFolder.toString());
            if (filesOptions.sortDirection) queryParams.append('sortDirection', filesOptions.sortDirection);
            if (filesOptions.sortField) queryParams.append('sortField', filesOptions.sortField);
            if (filesOptions.page) queryParams.append('page', filesOptions.page.toString());
            if (filesOptions.limit) queryParams.append('limit', filesOptions.limit.toString());
            if (filesOptions.search) queryParams.append('search', filesOptions.search);
            
            if (queryParams.toString()) {
                endpoint += '?' + queryParams.toString();
            }
            break;

        case 'upload':
            endpoint = '/v1/files';
            method = 'POST';

            const item = this.getInputData(i)[0];
            const binaryPropertyName = 'data';

            if (item.binary === undefined || item.binary[binaryPropertyName] === undefined) {
                throw new Error('No binary data found on input item. Connect a node that outputs a file.');
            }

            const binaryData = item.binary[binaryPropertyName];
            const uploadData = this.getNodeParameter('fileData', i, {}) as any;

            const form = new FormData();
            
            // Use buffer directly instead of stream
            const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
            
            form.append('files', buffer, {
                filename: binaryData.fileName || 'uploaded_file',
                contentType: binaryData.mimeType || 'application/octet-stream',
            });

            // Add required fields with proper defaults
            form.append('isPublic', (uploadData.isPublic !== undefined ? uploadData.isPublic : false).toString());
            
            if (uploadData.description) form.append('description', uploadData.description);
            if (uploadData.parentId) form.append('parentId', uploadData.parentId);
            
            // Handle arrays properly
            if (uploadData.assetTypes) {
                const assetTypes = uploadData.assetTypes.split(',').map((s: string) => s.trim()).filter(Boolean);
                assetTypes.forEach((type: string) => form.append('assetTypes', type));
            }
            if (uploadData.assetNumbers) {
                const assetNumbers = uploadData.assetNumbers.split(',').map((s: string) => s.trim()).filter(Boolean);
                assetNumbers.forEach((number: string) => form.append('assetNumbers', number));
            }
            
            if (uploadData.isAddedToKnowledgeBase !== undefined) {
                form.append('isAddedToKnowledgeBase', uploadData.isAddedToKnowledgeBase.toString());
            }

            body = form;
            encoding = 'multipart/form-data';
            break;

        case 'getById':
            const fileIdGet = this.getNodeParameter('fileId', i) as string;
            endpoint = `/v1/files/${fileIdGet}`;
            method = 'GET';
            break;

        case 'updateById':
            const fileIdUpdate = this.getNodeParameter('fileId', i) as string;
            const updateData = this.getNodeParameter('fileData', i, {}) as any;
            endpoint = `/v1/files/${fileIdUpdate}`;
            method = 'PATCH';
            body = updateData;
            break;

        case 'deleteById':
            const fileIdDelete = this.getNodeParameter('fileId', i) as string;
            endpoint = `/v1/files/${fileIdDelete}`;
            method = 'DELETE';
            break;

        case 'downloadById':
            const fileIdDownload = this.getNodeParameter('fileId', i) as string;
            endpoint = `/v1/files/${fileIdDownload}/download`;
            method = 'GET';
            break;

        case 'createFolder':
            const folderData = this.getNodeParameter('fileData', i, {}) as any;
            endpoint = '/v1/files/folder';
            method = 'POST';
            
            // Validation for folder creation
            if (!folderData.name?.trim()) {
                throw new Error('Folder name is required for creating a folder');
            }
            if (folderData.isPublic === undefined) {
                folderData.isPublic = false; // Set default as required by API
            }
            
            body = folderData;
            break;

        case 'updateContent':
            const fileIdContent = this.getNodeParameter('fileId', i) as string;
            endpoint = `/v1/files/${fileIdContent}/content`;
            method = 'PATCH';
            
            const contentItem = this.getInputData(i)[0];
            const contentBinaryPropertyName = 'data';
            
            if (contentItem.binary === undefined || contentItem.binary[contentBinaryPropertyName] === undefined) {
                throw new Error('No binary data found on input item for content update.');
            }
            
            const contentBinaryData = contentItem.binary[contentBinaryPropertyName];
            const contentForm = new FormData();
            const contentBuffer = await this.helpers.getBinaryDataBuffer(i, contentBinaryPropertyName);
            const contentStream = Readable.from(contentBuffer);
            
            contentForm.append('file', contentStream, {
                filename: contentBinaryData.fileName,
                contentType: contentBinaryData.mimeType,
            });
            
            body = contentForm;
            encoding = 'multipart/form-data';
            break;
    }

    return { method, endpoint, body, encoding };
}