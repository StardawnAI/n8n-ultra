import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeWorkOrders(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    // CHANGED: 'operation' -> 'workOrdersOperation'
    const operation = this.getNodeParameter('operation', i) as string;
    
    // CHANGED: 'additionalOptions' -> 'workOrdersAdditionalOptions'
    const additionalOptions = this.getNodeParameter('workOrdersAdditionalOptions', i, {}) as any;
    
    // UNCHANGED: 'workOrderData' was already unique
    let workOrderData = this.getNodeParameter('workOrderData', i, {}) as any;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    // Convert comma-separated string to array for relatedAssetIds
    if (workOrderData.relatedAssetIds && typeof workOrderData.relatedAssetIds === 'string') {
        workOrderData.relatedAssetIds = workOrderData.relatedAssetIds.split(',').map((id: string) => id.trim());
    }

    switch (operation) {
        case 'getAll':
            endpoint = '/v2/work-orders';
            method = 'GET';

            const queryParams = new URLSearchParams();
            Object.keys(additionalOptions).forEach(key => {
                if (additionalOptions[key] !== undefined && additionalOptions[key] !== '' && additionalOptions[key] !== null) {
                    queryParams.append(key, additionalOptions[key].toString());
                }
            });

            if (queryParams.toString()) {
                endpoint += '?' + queryParams.toString();
            }
            break;

        case 'create':
            endpoint = '/v2/work-orders';
            method = 'POST';
            body = workOrderData;
            break;

        case 'getById':
            // UNCHANGED: 'workOrderId' was already unique
            const workOrderId = this.getNodeParameter('workOrderId', i) as string;
            endpoint = `/v2/work-orders/${workOrderId}`;
            method = 'GET';

            // CHANGED: 'associations' -> 'workOrdersAssociations'
            const associations = this.getNodeParameter('workOrdersAssociations', i, []) as string[];
            if (associations.length > 0) {
                endpoint += '?associations=' + associations.join(',');
            }
            break;

        case 'updateById':
            // UNCHANGED: 'workOrderId' was already unique
            const workOrderIdUpdate = this.getNodeParameter('workOrderId', i) as string;
            endpoint = `/v2/work-orders/${workOrderIdUpdate}`;
            method = 'PATCH';
            body = workOrderData;
            break;

        case 'deleteById':
            // UNCHANGED: 'workOrderId' was already unique
            const workOrderIdDelete = this.getNodeParameter('workOrderId', i) as string;
            endpoint = `/v2/work-orders/${workOrderIdDelete}`;
            method = 'DELETE';
            break;

        case 'getByExternalReference':
            // CHANGED: 'externalReference' -> 'workOrderExternalReference'
            const externalRefGet = this.getNodeParameter('workOrderExternalReference', i) as string;
            endpoint = `/v2/work-orders/erp/${encodeURIComponent(externalRefGet)}`;
            method = 'GET';

            // CHANGED: 'associations' -> 'workOrdersAssociations'
            const associationsExt = this.getNodeParameter('workOrdersAssociations', i, []) as string[];
            if (associationsExt.length > 0) {
                endpoint += '?associations=' + associationsExt.join(',');
            }
            break;

        case 'updateByExternalReference':
            // CHANGED: 'externalReference' -> 'workOrderExternalReference'
            const externalRefUpdate = this.getNodeParameter('workOrderExternalReference', i) as string;
            endpoint = `/v2/work-orders/erp/${encodeURIComponent(externalRefUpdate)}`;
            method = 'PATCH';
            body = workOrderData;
            break;

        case 'deleteByExternalReference':
            // CHANGED: 'externalReference' -> 'workOrderExternalReference'
            const externalRefDelete = this.getNodeParameter('workOrderExternalReference', i) as string;
            endpoint = `/v2/work-orders/erp/${encodeURIComponent(externalRefDelete)}`;
            method = 'DELETE';
            break;

        case 'getTimeEntries':
            // UNCHANGED: 'workOrderId' was already unique
            const workOrderIdTimes = this.getNodeParameter('workOrderId', i) as string;
            endpoint = `/v2/work-orders/${workOrderIdTimes}/times`;
            method = 'GET';
            break;
    }

    return { method, endpoint, body };
}