import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeOrganizations(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    // CHANGED: 'operation' -> 'organizationsOperation'
    const operation = this.getNodeParameter('operation', i) as string;
    
    // CHANGED: 'additionalOptions' -> 'organizationsAdditionalOptions' (for getAll operation)
    const additionalOptions = this.getNodeParameter('organizationsAdditionalOptions', i, {}) as any;
    
    // UNCHANGED: 'organizationData' was already unique
    const organizationData = this.getNodeParameter('organizationData', i, {}) as any;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'getAll':
            endpoint = '/v1/organizations';
            method = 'GET';

            const queryParams = new URLSearchParams();
            if (additionalOptions.page) queryParams.append('page', additionalOptions.page.toString());
            if (additionalOptions.limit) queryParams.append('limit', additionalOptions.limit.toString());
            if (additionalOptions.search) queryParams.append('search', additionalOptions.search);
            if (additionalOptions.sortDirection) queryParams.append('sortDirection', additionalOptions.sortDirection);
            if (additionalOptions.sortField) queryParams.append('sortField', additionalOptions.sortField);

            if (queryParams.toString()) {
                endpoint += '?' + queryParams.toString();
            }
            break;

        case 'create':
            endpoint = '/v1/organizations';
            method = 'POST';
            body = organizationData;
            break;

        case 'getById':
            // UNCHANGED: 'organizationId' was already unique
            const orgIdGet = this.getNodeParameter('organizationId', i) as string;
            endpoint = `/v1/organizations/${orgIdGet}`;
            method = 'GET';
            break;

        case 'updateById':
            // UNCHANGED: 'organizationId' was already unique
            const orgIdUpdate = this.getNodeParameter('organizationId', i) as string;
            endpoint = `/v1/organizations/${orgIdUpdate}`;
            method = 'PATCH';
            body = organizationData;
            break;

        case 'deleteById':
            // UNCHANGED: 'organizationId' was already unique
            const orgIdDelete = this.getNodeParameter('organizationId', i) as string;
            endpoint = `/v1/organizations/${orgIdDelete}`;
            method = 'DELETE';
            break;

        case 'getContactsById':
            // UNCHANGED: 'organizationId' was already unique
            const orgIdContacts = this.getNodeParameter('organizationId', i) as string;
            endpoint = `/v1/organizations/${orgIdContacts}/contacts`;
            method = 'GET';

            // CHANGED: 'additionalOptions' -> 'organizationsContactsAdditionalOptions' (for getContactsById operation)
            const contactOptions = this.getNodeParameter('organizationsContactsAdditionalOptions', i, {}) as any;
            const contactParams = new URLSearchParams();
            if (contactOptions.page) contactParams.append('page', contactOptions.page.toString());
            if (contactOptions.limit) contactParams.append('limit', contactOptions.limit.toString());
            if (contactOptions.search) contactParams.append('search', contactOptions.search);
            if (contactOptions.sortDirection) contactParams.append('sortDirection', contactOptions.sortDirection);
            if (contactOptions.sortField) contactParams.append('sortField', contactOptions.sortField);

            if (contactParams.toString()) {
                endpoint += '?' + contactParams.toString();
            }
            break;
    }

    return { method, endpoint, body };
}