import type {
    IAuthenticateGeneric,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class RembergApi implements ICredentialType {
    name = 'rembergApi';
    displayName = 'Remberg API';
    documentationUrl = 'https://developers.remberg.de/reference/';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            description: 'Enter your API key that you get from Remberg (https://accountname.app.remberg.de/en/settings/api) - Enter without Bearer prefix',
        },

        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'https://api.remberg.com', // Set your default value here
            description: 'API URL endpoint'
        },
        // they are freely namable, so no need to make them unique. e.g. clientid, port, etc.
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.apiKey}}',
            },
        },
    };
}