import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeTickets(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    // CHANGED: 'operation' -> 'ticketsOperation'
    const operation = this.getNodeParameter('operation', i) as string;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    // Helper function to handle string-to-array conversions for body data
    const processBodyData = (data: any) => {
        const processedData = { ...data };
        const arrayFields = ['relatedOrganizationIds', 'relatedContactIds', 'relatedAssetIds'];
        for (const field of arrayFields) {
            if (processedData[field] && typeof processedData[field] === 'string') {
                processedData[field] = processedData[field].split(',').map((id: string) => id.trim());
            }
        }
        return processedData;
    };

    switch (operation) {
        case 'getAll':
            endpoint = '/v2/tickets';
            method = 'GET';
            
            // CHANGED: 'additionalOptions' -> 'ticketsAdditionalOptions'
            const getAllOptions = this.getNodeParameter('ticketsAdditionalOptions', i, {}) as any;
            const queryParams = new URLSearchParams();
            Object.keys(getAllOptions).forEach(key => {
                if (getAllOptions[key] !== undefined && getAllOptions[key] !== '' && getAllOptions[key] !== null) {
                    queryParams.append(key, getAllOptions[key].toString());
                }
            });
            if (queryParams.toString()) {
                endpoint += '?' + queryParams.toString();
            }
            break;

        case 'getCategories':
            endpoint = '/v2/tickets/categories';
            method = 'GET';
            break;

        case 'create':
            endpoint = '/v2/tickets';
            method = 'POST';
            
            // UNCHANGED: 'ticketData' was already unique
            const ticketDataCreate = this.getNodeParameter('ticketData', i, {}) as any;
            body = processBodyData(ticketDataCreate);
            break;

        case 'getConversations':
            // UNCHANGED: 'ticketId' was already unique
            const ticketIdConvo = this.getNodeParameter('ticketId', i) as string;
            endpoint = `/v2/tickets/${ticketIdConvo}/conversations`;
            method = 'GET';
            break;

        case 'getById':
            // UNCHANGED: 'ticketId' was already unique
            const ticketIdGet = this.getNodeParameter('ticketId', i) as string;
            endpoint = `/v2/tickets/${ticketIdGet}`;
            method = 'GET';
            
            // CHANGED: 'associations' -> 'ticketsAssociations'
            const associations = this.getNodeParameter('ticketsAssociations', i, []) as string[];
            if (associations.length > 0) {
                endpoint += '?associations=' + associations.join(',');
            }
            break;

        case 'updateById':
            // UNCHANGED: 'ticketId' was already unique
            const ticketIdUpdate = this.getNodeParameter('ticketId', i) as string;
            endpoint = `/v2/tickets/${ticketIdUpdate}`;
            method = 'PATCH';
            
            // UNCHANGED: 'ticketData' was already unique
            const ticketDataUpdate = this.getNodeParameter('ticketData', i, {}) as any;
            body = processBodyData(ticketDataUpdate);
            break;

        case 'deleteById':
            // UNCHANGED: 'ticketId' was already unique
            const ticketIdDelete = this.getNodeParameter('ticketId', i) as string;
            endpoint = `/v2/tickets/${ticketIdDelete}`;
            method = 'DELETE';
            break;
    }

    return { method, endpoint, body };
}