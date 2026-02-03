import type {
    IAuthenticateGeneric,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class WhatsappPrivateApi implements ICredentialType {
    name = 'whatsappPrivateApi';
    displayName = 'WhatsApp Private API';
    documentationUrl = 'https://bump.sh/aldinokemal/doc/go-whatsapp-web-multidevice/';
    properties: INodeProperties[] = [
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'http://localhost:3000',
            required: true,
            description: 'Base URL of your WhatsApp Private API instance (e.g., http://localhost:3000)',
        },
        {
            displayName: 'API Token',
            name: 'apiToken',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            description: 'API Token for authentication (if required by your API instance)',
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                'Authorization': '=Bearer {{$credentials.apiToken}}',
                'Content-Type': 'application/json',
            },
        },
    };
}