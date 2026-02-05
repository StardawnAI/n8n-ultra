import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeMessage(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    const operation = this.getNodeParameter('operation', i) as string;
    const messageId = this.getNodeParameter('messageId', i) as string;

    let endpoint = '';
    let method: IHttpRequestMethods = 'POST';
    let body: any = {};

    switch (operation) {
        case 'revoke':
            // Revoke message (delete for everyone)
            endpoint = `/message/${encodeURIComponent(messageId)}/revoke`;
            method = 'POST';
            break;

        case 'react':
            // React to message
            endpoint = `/message/${encodeURIComponent(messageId)}/reaction`;
            method = 'POST';
            const reaction = this.getNodeParameter('reaction', i, '') as string;
            body.reaction = reaction;
            break;

        case 'delete':
            // Delete message
            endpoint = `/message/${encodeURIComponent(messageId)}/delete`;
            method = 'POST';
            break;

        case 'edit':
            // Edit message
            endpoint = `/message/${encodeURIComponent(messageId)}/update`;
            method = 'POST';
            const newMessage = this.getNodeParameter('newMessage', i) as string;
            body.message = newMessage;
            break;

        case 'markRead':
            // Mark message as read
            endpoint = `/message/${encodeURIComponent(messageId)}/read`;
            method = 'POST';
            break;

        case 'star':
            // Star message
            endpoint = `/message/${encodeURIComponent(messageId)}/star`;
            method = 'POST';
            break;

        case 'unstar':
            // Unstar message
            endpoint = `/message/${encodeURIComponent(messageId)}/unstar`;
            method = 'POST';
            break;

        default:
            throw new Error(`Unknown operation: ${operation}`);
    }

    return { method, endpoint, body };
}