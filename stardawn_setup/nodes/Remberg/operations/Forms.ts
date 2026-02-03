import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeForms(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    // CHANGED: 'operation' -> 'formsOperation'
    const operation = this.getNodeParameter('operation', i) as string;
    
    // CHANGED: 'additionalOptions' -> 'formsAdditionalOptions'
    const additionalOptions = this.getNodeParameter('formsAdditionalOptions', i, {}) as any;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    const body: any = {};

    switch (operation) {
        case 'getAll':
            endpoint = '/v1/forms';
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

        case 'getById':
            // UNCHANGED: 'formId' was already unique
            const formId = this.getNodeParameter('formId', i) as string;
            endpoint = `/v1/forms/${formId}`;
            method = 'GET';
            break;
    }

    return { method, endpoint, body };
}