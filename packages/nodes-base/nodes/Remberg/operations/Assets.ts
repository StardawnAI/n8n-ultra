import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeAssets(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    // CHANGED: 'operation' -> 'assetsOperation'
    const operation = this.getNodeParameter('operation', i) as string;
    
    // CHANGED: 'additionalOptions' -> 'assetsAdditionalOptions' (for getAll operation)
    const additionalOptions = this.getNodeParameter('assetsAdditionalOptions', i, {}) as any;
    
    // UNCHANGED: 'assetData' was already unique
    const assetData = this.getNodeParameter('assetData', i, {}) as any;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'getAll':
            endpoint = '/v2/assets';
            method = 'GET';

            const queryParams = new URLSearchParams();
            if (additionalOptions.page) queryParams.append('page', additionalOptions.page.toString());
            if (additionalOptions.limit) queryParams.append('limit', additionalOptions.limit.toString());
            if (additionalOptions.organizationNumber) queryParams.append('organizationNumber', additionalOptions.organizationNumber);
            if (additionalOptions.parentAssetNumber) queryParams.append('parentAssetNumber', additionalOptions.parentAssetNumber);
            if (additionalOptions.assetTypeLabel) queryParams.append('assetTypeLabel', additionalOptions.assetTypeLabel);
            if (additionalOptions.sortDirection) queryParams.append('sortDirection', additionalOptions.sortDirection);
            if (additionalOptions.sortField) queryParams.append('sortField', additionalOptions.sortField);

            if (queryParams.toString()) {
                endpoint += '?' + queryParams.toString();
            }
            break;

        case 'create':
            // Validation for create operation
            if (!assetData.assetNumber?.trim()) {
                throw new Error('Asset Number is required for create operation');
            }
            if (!assetData.assetTypeId?.trim() && !assetData.assetTypeLabel?.trim()) {
                throw new Error('Either Asset Type ID or Asset Type Label is required for create operation');
            }

            endpoint = '/v2/assets';
            method = 'POST';
            body = assetData;
            break;

        case 'getById':
            // UNCHANGED: 'assetId' was already unique
            const assetIdGet = this.getNodeParameter('assetId', i) as string;
            endpoint = `/v2/assets/${assetIdGet}`;
            method = 'GET';

            // CHANGED: 'associations' -> 'assetsAssociations'
            const associations = this.getNodeParameter('assetsAssociations', i, []) as string[];
            if (associations.length > 0) {
                endpoint += '?associations=' + associations.join(',');
            }
            break;

        case 'getByNumber':
            // UNCHANGED: 'assetNumber' was already unique
            const assetNumberGet = this.getNodeParameter('assetNumber', i) as string;
            endpoint = `/v2/assets/number/${encodeURIComponent(assetNumberGet)}`;
            method = 'GET';

            // CHANGED: 'associations' -> 'assetsAssociations'
            const associationsNumber = this.getNodeParameter('assetsAssociations', i, []) as string[];
            if (associationsNumber.length > 0) {
                endpoint += '?associations=' + associationsNumber.join(',');
            }
            break;

        case 'updateById':
            // UNCHANGED: 'assetId' was already unique
            const assetIdUpdate = this.getNodeParameter('assetId', i) as string;
            endpoint = `/v2/assets/${assetIdUpdate}`;
            method = 'PATCH';
            body = assetData;
            break;

        case 'updateByNumber':
            // UNCHANGED: 'assetNumber' was already unique
            const assetNumberUpdate = this.getNodeParameter('assetNumber', i) as string;
            endpoint = `/v2/assets/number/${encodeURIComponent(assetNumberUpdate)}`;
            method = 'PATCH';
            body = assetData;
            break;

        case 'deleteById':
            // UNCHANGED: 'assetId' was already unique
            const assetIdDelete = this.getNodeParameter('assetId', i) as string;
            endpoint = `/v2/assets/${assetIdDelete}`;
            method = 'DELETE';
            break;

        case 'deleteByNumber':
            // UNCHANGED: 'assetNumber' was already unique
            const assetNumberDelete = this.getNodeParameter('assetNumber', i) as string;
            endpoint = `/v2/assets/number/${encodeURIComponent(assetNumberDelete)}`;
            method = 'DELETE';
            break;

        case 'getInventoriesById':
            // UNCHANGED: 'assetId' was already unique
            const assetIdInventories = this.getNodeParameter('assetId', i) as string;
            endpoint = `/v2/assets/${assetIdInventories}/inventories`;
            method = 'GET';

            // CHANGED: 'additionalOptions' -> 'assetsInventoryAdditionalOptions' (for inventory operations)
            const inventoryOptions = this.getNodeParameter('assetsInventoryAdditionalOptions', i, {}) as any;
            const inventoryParams = new URLSearchParams();
            if (inventoryOptions.page) inventoryParams.append('page', inventoryOptions.page.toString());
            if (inventoryOptions.limit) inventoryParams.append('limit', inventoryOptions.limit.toString());

            if (inventoryParams.toString()) {
                endpoint += '?' + inventoryParams.toString();
            }
            break;

        case 'getInventoriesByNumber':
            // UNCHANGED: 'assetNumber' was already unique
            const assetNumberInventories = this.getNodeParameter('assetNumber', i) as string;
            endpoint = `/v2/assets/number/${encodeURIComponent(assetNumberInventories)}/inventories`;
            method = 'GET';

            // CHANGED: 'additionalOptions' -> 'assetsInventoryAdditionalOptions' (for inventory operations)
            const inventoryNumberOptions = this.getNodeParameter('assetsInventoryAdditionalOptions', i, {}) as any;
            const inventoryNumberParams = new URLSearchParams();
            if (inventoryNumberOptions.page) inventoryNumberParams.append('page', inventoryNumberOptions.page.toString());
            if (inventoryNumberOptions.limit) inventoryNumberParams.append('limit', inventoryNumberOptions.limit.toString());

            if (inventoryNumberParams.toString()) {
                endpoint += '?' + inventoryNumberParams.toString();
            }
            break;
    }

    return { method, endpoint, body };
}