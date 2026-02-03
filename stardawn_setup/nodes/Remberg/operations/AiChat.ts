// operations/AiChat.ts
import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeAiChat(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
   
    const operation = this.getNodeParameter('operation', i) as string;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'answerQuestion':
            endpoint = '/v1/ai/answer';
            method = 'POST';

            // CHANGED: 'question' -> 'aiChatQuestion'
            body.question = this.getNodeParameter('aiChatQuestion', i) as string;
            
            // CHANGED: 'context' -> 'aiChatContext'
            const contextData = this.getNodeParameter('aiChatContext', i) as { items: { instanceId: string, type: string }[] };
            if (contextData && contextData.items && contextData.items.length > 0) {
                body.context = contextData.items;
            }
            break;

        case 'provideFeedback':
            // CHANGED: 'traceId' -> 'aiChatTraceId'
            const traceId = this.getNodeParameter('aiChatTraceId', i) as string;
            endpoint = `/v1/ai/feedback/${traceId}`;
            method = 'POST';

            // CHANGED: 'score' -> 'aiChatScore'
            body.score = this.getNodeParameter('aiChatScore', i) as number;
            
            // CHANGED: 'comment' -> 'aiChatComment'
            const comment = this.getNodeParameter('aiChatComment', i, '') as string;
            if (comment) {
                body.comment = comment;
            }
            break;
    }

    return { method, endpoint, body };
}