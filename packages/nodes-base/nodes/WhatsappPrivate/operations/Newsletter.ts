import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeNewsletter(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    const operation = this.getNodeParameter('operation', i) as string;

    let endpoint = '';
    let method: IHttpRequestMethods = 'POST';
    let body: any = {};

    switch (operation) {
        case 'unfollow':
            // Unfollow newsletter
            endpoint = '/newsletter/unfollow';
            method = 'POST';
            const newsletterJid = this.getNodeParameter('newsletterJid', i) as string;
            body.newsletter_jid = newsletterJid;
            break;

        default:
            throw new Error(`Unknown operation: ${operation}`);
    }

    return { method, endpoint, body };
}