import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeSend(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    const operation = this.getNodeParameter('operation', i) as string;
    const to = this.getNodeParameter('to', i) as string;

    let endpoint = '';
    let method: IHttpRequestMethods = 'POST';
    let body: any = { to };

    switch (operation) {
        case 'message':
            // Send text message
            endpoint = '/send/message';
            const message = this.getNodeParameter('message', i) as string;
            body.message = message;
            break;

        case 'image':
            // Send image
            endpoint = '/send/image';
            const imageFile = this.getNodeParameter('file', i) as string;
            const imageCaption = this.getNodeParameter('caption', i, '') as string;
            
            body.image = imageFile;
            if (imageCaption) {
                body.caption = imageCaption;
            }
            break;

        case 'audio':
            // Send audio file
            endpoint = '/send/audio';
            const audioFile = this.getNodeParameter('file', i) as string;
            body.audio = audioFile;
            break;

        case 'file':
            // Send file
            endpoint = '/send/file';
            const file = this.getNodeParameter('file', i) as string;
            const fileCaption = this.getNodeParameter('caption', i, '') as string;
            
            body.file = file;
            if (fileCaption) {
                body.caption = fileCaption;
            }
            break;

        case 'video':
            // Send video
            endpoint = '/send/video';
            const videoFile = this.getNodeParameter('file', i) as string;
            const videoCaption = this.getNodeParameter('caption', i, '') as string;
            
            body.video = videoFile;
            if (videoCaption) {
                body.caption = videoCaption;
            }
            break;

        case 'contact':
            // Send contact
            endpoint = '/send/contact';
            const contactData = this.getNodeParameter('contactData', i) as any;
            body.name = contactData.name || '';
            body.phone = contactData.phone || '';
            break;

        case 'link':
            // Send link with preview
            endpoint = '/send/link';
            const link = this.getNodeParameter('link', i) as string;
            body.link = link;
            break;

        case 'location':
            // Send location
            endpoint = '/send/location';
            const locationData = this.getNodeParameter('locationData', i) as any;
            
            body.latitude = locationData.latitude || 0;
            body.longitude = locationData.longitude || 0;
            body.name = locationData.name || '';
            body.address = locationData.address || '';
            break;

        case 'poll':
            // Send poll/vote
            endpoint = '/send/poll';
            const pollData = this.getNodeParameter('pollData', i) as any;
            
            body.question = pollData.question || '';
            body.options = pollData.options ? pollData.options.split(',').map((opt: string) => opt.trim()) : [];
            body.maxAnswers = pollData.maxAnswers || 1;
            break;

        case 'presence':
            // Send presence status
            endpoint = '/send/presence';
            const presence = this.getNodeParameter('presence', i) as string;
            body.presence = presence;
            break;

        case 'chatPresence':
            // Send typing indicator
            endpoint = '/send/chat-presence';
            const chatPresence = this.getNodeParameter('chatPresence', i) as string;
            body.chatPresence = chatPresence;
            break;

        default:
            throw new Error(`Unknown operation: ${operation}`);
    }

    return { method, endpoint, body };
}