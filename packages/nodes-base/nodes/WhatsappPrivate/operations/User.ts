import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeUser(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    const operation = this.getNodeParameter('operation', i) as string;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'getInfo':
            // Get user information
            endpoint = '/user/info';
            method = 'GET';
            break;

        case 'getAvatar':
            // Get user avatar
            endpoint = '/user/avatar';
            method = 'GET';
            break;

        case 'changeAvatar':
            // Change user avatar
            endpoint = '/user/avatar';
            method = 'POST';
            const avatarFile = this.getNodeParameter('avatarFile', i) as string;
            body.avatar = avatarFile;
            break;

        case 'changePushName':
            // Change push name
            endpoint = '/user/pushname';
            method = 'POST';
            const pushName = this.getNodeParameter('pushName', i) as string;
            body.pushname = pushName;
            break;

        case 'getMyGroups':
            // Get my groups
            endpoint = '/user/my/groups';
            method = 'GET';
            break;

        case 'getMyNewsletters':
            // Get my newsletters
            endpoint = '/user/my/newsletters';
            method = 'GET';
            break;

        case 'getMyPrivacy':
            // Get privacy settings
            endpoint = '/user/my/privacy';
            method = 'GET';
            break;

        case 'getMyContacts':
            // Get my contacts
            endpoint = '/user/my/contacts';
            method = 'GET';
            break;

        case 'checkUser':
            // Check if user exists
            endpoint = '/user/check';
            method = 'GET';
            
            const userPhones = this.getNodeParameter('userPhones', i) as string;
            if (userPhones) {
                endpoint += `?phones=${encodeURIComponent(userPhones)}`;
            }
            break;

        case 'getBusinessProfile':
            // Get business profile
            endpoint = '/user/business-profile';
            method = 'GET';
            break;

        default:
            throw new Error(`Unknown operation: ${operation}`);
    }

    return { method, endpoint, body };
}