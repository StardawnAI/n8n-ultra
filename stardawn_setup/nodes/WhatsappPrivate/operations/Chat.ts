import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeChat(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    const operation = this.getNodeParameter('operation', i) as string;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'getList':
            // Get list of chats
            endpoint = '/chats';
            method = 'GET';
            break;

        case 'getMessages':
            // Get messages from chat
            const chatJid = this.getNodeParameter('chatJid', i) as string;
            endpoint = `/chat/${encodeURIComponent(chatJid)}/messages`;
            method = 'GET';
            
            // Add query parameters for pagination
            const chatMessagesOptions = this.getNodeParameter('chatMessagesOptions', i, {}) as any;
            const queryParams = new URLSearchParams();
            
            if (chatMessagesOptions.limit) {
                queryParams.append('limit', chatMessagesOptions.limit.toString());
            }
            if (chatMessagesOptions.offset) {
                queryParams.append('offset', chatMessagesOptions.offset.toString());
            }
            
            if (queryParams.toString()) {
                endpoint += '?' + queryParams.toString();
            }
            break;

        case 'label':
            // Add label to chat
            const labelChatJid = this.getNodeParameter('chatJid', i) as string;
            endpoint = `/chat/${encodeURIComponent(labelChatJid)}/label`;
            method = 'POST';
            const label = this.getNodeParameter('label', i) as string;
            body.label = label;
            break;

        case 'pin':
            // Pin/unpin chat
            const pinChatJid = this.getNodeParameter('chatJid', i) as string;
            endpoint = `/chat/${encodeURIComponent(pinChatJid)}/pin`;
            method = 'POST';
            const pin = this.getNodeParameter('pin', i) as boolean;
            body.pin = pin;
            break;

        default:
            throw new Error(`Unknown operation: ${operation}`);
    }

    return { method, endpoint, body };
}