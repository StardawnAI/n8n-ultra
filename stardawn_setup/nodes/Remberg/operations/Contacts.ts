import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeContacts(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    const operation = this.getNodeParameter('operation', i) as string;
    const additionalOptions = this.getNodeParameter('contactsAdditionalOptions', i, {}) as any;
    const contactData = this.getNodeParameter('contactData', i, {}) as any;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'getAll':
            endpoint = '/v1/contacts';
            method = 'GET';

            const queryParams = new URLSearchParams();
            if (additionalOptions.page) queryParams.append('page', additionalOptions.page.toString());
            if (additionalOptions.limit) queryParams.append('limit', additionalOptions.limit.toString());
            if (additionalOptions.organizationNumber) queryParams.append('organizationNumber', additionalOptions.organizationNumber);
            if (additionalOptions.search) queryParams.append('search', additionalOptions.search);
            if (additionalOptions.sortDirection) queryParams.append('sortDirection', additionalOptions.sortDirection);
            if (additionalOptions.sortField) queryParams.append('sortField', additionalOptions.sortField);

            if (queryParams.toString()) {
                endpoint += '?' + queryParams.toString();
            }
            break;

        case 'create':
            endpoint = '/v1/contacts';
            method = 'POST';
            body = contactData;
            break;

        case 'getById':
            const contactIdGet = this.getNodeParameter('contactId', i) as string;
            endpoint = `/v1/contacts/${contactIdGet}`;
            method = 'GET';
            break;

        case 'updateById':
            const contactIdUpdate = this.getNodeParameter('contactId', i) as string;
            endpoint = `/v1/contacts/${contactIdUpdate}`;
            method = 'PATCH';
            body = contactData;
            break;

        case 'deleteById':
            const contactIdDelete = this.getNodeParameter('contactId', i) as string;
            endpoint = `/v1/contacts/${contactIdDelete}`;
            method = 'DELETE';
            break;
    }

    return { method, endpoint, body };
}