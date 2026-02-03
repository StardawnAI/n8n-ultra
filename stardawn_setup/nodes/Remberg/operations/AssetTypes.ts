import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeAssetTypes(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    // CHANGED: 'operation' -> 'assetTypesOperation'
    const operation = this.getNodeParameter('operation', i) as string;
    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'create':
            endpoint = '/v2/assets/types';
            method = 'POST';
            body = {
                // CHANGED: 'newLabel' -> 'assetTypeNewLabel'
                label: this.getNodeParameter('assetTypeNewLabel', i) as string,
            };
            break;

        case 'getById':
            // UNCHANGED: 'assetTypeId' was already unique
            const assetTypeId = this.getNodeParameter('assetTypeId', i) as string;
            endpoint = `/v2/assets/types/${assetTypeId}`;
            method = 'GET';
            break;

        case 'getByLabel':
            // UNCHANGED: 'assetTypeLabel' was already unique
            const labelForGet = this.getNodeParameter('assetTypeLabel', i) as string;
            endpoint = `/v2/assets/types/label/${encodeURIComponent(labelForGet)}`;
            method = 'GET';
            break;

        case 'updateById':
            // UNCHANGED: 'assetTypeId' was already unique
            const assetTypeIdUpdate = this.getNodeParameter('assetTypeId', i) as string;
            endpoint = `/v2/assets/types/${assetTypeIdUpdate}`;
            method = 'PATCH';
            body = {
                // CHANGED: 'newLabel' -> 'assetTypeNewLabel'
                label: this.getNodeParameter('assetTypeNewLabel', i) as string,
            };
            break;

        case 'updateByLabel':
            // UNCHANGED: 'assetTypeLabel' was already unique
            const labelForUpdate = this.getNodeParameter('assetTypeLabel', i) as string;
            endpoint = `/v2/assets/types/label/${encodeURIComponent(labelForUpdate)}`;
            method = 'PATCH';
            body = {
                // CHANGED: 'newLabel' -> 'assetTypeNewLabel'
                label: this.getNodeParameter('assetTypeNewLabel', i) as string,
            };
            break;

        case 'deleteById':
            // UNCHANGED: 'assetTypeId' was already unique
            const assetTypeIdDelete = this.getNodeParameter('assetTypeId', i) as string;
            endpoint = `/v2/assets/types/${assetTypeIdDelete}`;
            method = 'DELETE';
            break;

        case 'deleteByLabel':
            // UNCHANGED: 'assetTypeLabel' was already unique
            const labelForDelete = this.getNodeParameter('assetTypeLabel', i) as string;
            endpoint = `/v2/assets/types/label/${encodeURIComponent(labelForDelete)}`;
            method = 'DELETE';
            break;
    }

    return { method, endpoint, body };
}