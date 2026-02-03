import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeApp(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    const operation = this.getNodeParameter('operation', i) as string;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'login':
            // Login with QR code scanning
            endpoint = '/app/login';
            method = 'GET';
            break;

        case 'loginWithCode':
            // Login with pair code
            endpoint = '/app/login-with-code';
            method = 'GET';
            
            const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
            if (phoneNumber) {
                endpoint += `?phone=${encodeURIComponent(phoneNumber)}`;
            }
            break;

        case 'logout':
            // Logout from WhatsApp
            endpoint = '/app/logout';
            method = 'GET';
            break;

        case 'reconnect':
            // Reconnect to WhatsApp
            endpoint = '/app/reconnect';
            method = 'GET';
            break;

        case 'devices':
            // Get connected devices
            endpoint = '/app/devices';
            method = 'GET';
            break;

        default:
            throw new Error(`Unknown operation: ${operation}`);
    }

    return { method, endpoint, body };
}