import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeParts(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    // CHANGED: 'operation' -> 'partsOperation'
    const operation = this.getNodeParameter('operation', i) as string;
    
    // CHANGED: 'additionalOptions' -> 'partsAdditionalOptions'
    const additionalOptions = this.getNodeParameter('partsAdditionalOptions', i, {}) as any;
    
    // UNCHANGED: 'partData' was already unique
    const partData = this.getNodeParameter('partData', i, {}) as any;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'getAll':
            endpoint = '/v1/parts';
            method = 'GET';

            const queryParams = new URLSearchParams();
            Object.keys(additionalOptions).forEach(key => {
                if (additionalOptions[key]) {
                    queryParams.append(key, additionalOptions[key].toString());
                }
            });

            if (queryParams.toString()) {
                endpoint += '?' + queryParams.toString();
            }
            break;

        case 'create':
            endpoint = '/v1/parts';
            method = 'POST';
            body = partData;
            break;

        case 'getById':
            // UNCHANGED: 'partId' was already unique
            const partIdGet = this.getNodeParameter('partId', i) as string;
            endpoint = `/v1/parts/${partIdGet}`;
            method = 'GET';
            
            // CHANGED: 'associations' -> 'partsAssociations'
            const associationsGet = this.getNodeParameter('partsAssociations', i, []) as string[];
            if (associationsGet.length > 0) {
                endpoint += '?associations=' + associationsGet.join(',');
            }
            break;

        case 'updateById':
            // UNCHANGED: 'partId' was already unique
            const partIdUpdate = this.getNodeParameter('partId', i) as string;
            endpoint = `/v1/parts/${partIdUpdate}`;
            method = 'PATCH';
            body = partData;
            break;

        case 'getByNumber':
            // UNCHANGED: 'partNumber' was already unique
            const partNumberGet = this.getNodeParameter('partNumber', i) as string;
            endpoint = `/v1/parts/number/${encodeURIComponent(partNumberGet)}`;
            method = 'GET';

            // CHANGED: 'associations' -> 'partsAssociations'
            const associationsGetNum = this.getNodeParameter('partsAssociations', i, []) as string[];
            if (associationsGetNum.length > 0) {
                endpoint += '?associations=' + associationsGetNum.join(',');
            }
            break;

        case 'updateByNumber':
            // UNCHANGED: 'partNumber' was already unique
            const partNumberUpdate = this.getNodeParameter('partNumber', i) as string;
            endpoint = `/v1/parts/number/${encodeURIComponent(partNumberUpdate)}`;
            method = 'PATCH';
            body = partData;
            break;
    }

    return { method, endpoint, body };
}