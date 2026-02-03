import type { IExecuteFunctions } from 'n8n-workflow';
import type {
    IHttpRequestMethods,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

import { executeApp } from './operations/App';
import { executeUser } from './operations/User';
import { executeSend } from './operations/Send';
import { executeMessage } from './operations/Message';
import { executeGroup } from './operations/Group';
import { executeChat } from './operations/Chat';
import { executeNewsletter } from './operations/Newsletter';

export class WhatsappPrivate implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'WhatsApp Private',
        name: 'whatsappPrivate',
        icon: 'file:whatsappprivateapi.svg',
        group: ['output'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Consume WhatsApp Private API',
        defaults: {
            name: 'WhatsApp Private',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'whatsappPrivateApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    { name: 'App', value: 'app' },
                    { name: 'User', value: 'user' },
                    { name: 'Send', value: 'send' },
                    { name: 'Message', value: 'message' },
                    { name: 'Group', value: 'group' },
                    { name: 'Chat', value: 'chat' },
                    { name: 'Newsletter', value: 'newsletter' },
                ],
                default: 'send',
            },

            // APP OPERATIONS
            {
                displayName: 'App Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['app'] } },
                options: [
                    { name: 'Login with Scan QR', value: 'login', action: 'Login with QR code scanning' },
                    { name: 'Login with Pair Code', value: 'loginWithCode', action: 'Login with pairing code' },
                    { name: 'Logout', value: 'logout', action: 'Logout from WhatsApp' },
                    { name: 'Reconnect', value: 'reconnect', action: 'Reconnect to WhatsApp' },
                    { name: 'Get Devices', value: 'devices', action: 'Get connected devices' },
                ],
                default: 'login',
            },

            // USER OPERATIONS
            {
                displayName: 'User Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['user'] } },
                options: [
                    { name: 'Get Info', value: 'getInfo', action: 'Get user information' },
                    { name: 'Get Avatar', value: 'getAvatar', action: 'Get user avatar' },
                    { name: 'Change Avatar', value: 'changeAvatar', action: 'Change user avatar' },
                    { name: 'Change Push Name', value: 'changePushName', action: 'Change push name' },
                    { name: 'Get My Groups', value: 'getMyGroups', action: 'Get my groups' },
                    { name: 'Get My Newsletters', value: 'getMyNewsletters', action: 'Get my newsletters' },
                    { name: 'Get My Privacy Settings', value: 'getMyPrivacy', action: 'Get privacy settings' },
                    { name: 'Get My Contacts', value: 'getMyContacts', action: 'Get my contacts' },
                    { name: 'Check User', value: 'checkUser', action: 'Check if user exists' },
                    { name: 'Get Business Profile', value: 'getBusinessProfile', action: 'Get business profile' },
                ],
                default: 'getInfo',
            },

            // SEND OPERATIONS
            {
                displayName: 'Send Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['send'] } },
                options: [
                    { name: 'Send Message', value: 'message', action: 'Send text message' },
                    { name: 'Send Image', value: 'image', action: 'Send image' },
                    { name: 'Send Audio', value: 'audio', action: 'Send audio file' },
                    { name: 'Send File', value: 'file', action: 'Send file' },
                    { name: 'Send Video', value: 'video', action: 'Send video' },
                    { name: 'Send Contact', value: 'contact', action: 'Send contact' },
                    { name: 'Send Link', value: 'link', action: 'Send link with preview' },
                    { name: 'Send Location', value: 'location', action: 'Send location' },
                    { name: 'Send Poll', value: 'poll', action: 'Send poll/vote' },
                    { name: 'Send Presence', value: 'presence', action: 'Send presence status' },
                    { name: 'Send Chat Presence', value: 'chatPresence', action: 'Send typing indicator' },
                ],
                default: 'message',
            },

            // MESSAGE OPERATIONS
            {
                displayName: 'Message Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['message'] } },
                options: [
                    { name: 'Revoke Message', value: 'revoke', action: 'Revoke/delete for everyone' },
                    { name: 'React to Message', value: 'react', action: 'React to message' },
                    { name: 'Delete Message', value: 'delete', action: 'Delete message' },
                    { name: 'Edit Message', value: 'edit', action: 'Edit message' },
                    { name: 'Mark as Read', value: 'markRead', action: 'Mark message as read' },
                    { name: 'Star Message', value: 'star', action: 'Star message' },
                    { name: 'Unstar Message', value: 'unstar', action: 'Unstar message' },
                ],
                default: 'revoke',
            },

            // GROUP OPERATIONS
            {
                displayName: 'Group Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['group'] } },
                options: [
                    { name: 'Join with Link', value: 'joinWithLink', action: 'Join group with invite link' },
                    { name: 'Get Info from Link', value: 'getInfoFromLink', action: 'Get group info from link' },
                    { name: 'Get Group Info', value: 'getInfo', action: 'Get group information' },
                    { name: 'Leave Group', value: 'leave', action: 'Leave group' },
                    { name: 'Create Group', value: 'create', action: 'Create new group' },
                    { name: 'Add Participants', value: 'addParticipants', action: 'Add participants to group' },
                    { name: 'Remove Participant', value: 'removeParticipant', action: 'Remove participant from group' },
                    { name: 'Promote Participant', value: 'promoteParticipant', action: 'Promote participant to admin' },
                    { name: 'Demote Participant', value: 'demoteParticipant', action: 'Demote participant from admin' },
                    { name: 'Get Participant Requests', value: 'getParticipantRequests', action: 'Get pending join requests' },
                    { name: 'Approve Join Request', value: 'approveJoinRequest', action: 'Approve join request' },
                    { name: 'Reject Join Request', value: 'rejectJoinRequest', action: 'Reject join request' },
                    { name: 'Set Photo', value: 'setPhoto', action: 'Set group photo' },
                    { name: 'Set Name', value: 'setName', action: 'Set group name' },
                    { name: 'Set Locked', value: 'setLocked', action: 'Lock/unlock group settings' },
                    { name: 'Set Announce', value: 'setAnnounce', action: 'Set announce mode' },
                    { name: 'Set Topic', value: 'setTopic', action: 'Set group topic/description' },
                    { name: 'Get Invite Link', value: 'getInviteLink', action: 'Get group invite link' },
                ],
                default: 'getInfo',
            },

            // CHAT OPERATIONS
            {
                displayName: 'Chat Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['chat'] } },
                options: [
                    { name: 'Get Chat List', value: 'getList', action: 'Get list of chats' },
                    { name: 'Get Chat Messages', value: 'getMessages', action: 'Get messages from chat' },
                    { name: 'Label Chat', value: 'label', action: 'Add label to chat' },
                    { name: 'Pin Chat', value: 'pin', action: 'Pin/unpin chat' },
                ],
                default: 'getList',
            },

            // NEWSLETTER OPERATIONS
            {
                displayName: 'Newsletter Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['newsletter'] } },
                options: [
                    { name: 'Unfollow', value: 'unfollow', action: 'Unfollow newsletter' },
                ],
                default: 'unfollow',
            },

            // APP PARAMETERS
            {
                displayName: 'Phone Number',
                name: 'phoneNumber',
                type: 'string',
                displayOptions: { show: { resource: ['app'], operation: ['loginWithCode'] } },
                default: '',
                required: true,
                description: 'Phone number for pairing code login',
            },

            // USER PARAMETERS
            {
                displayName: 'User Phone Numbers',
                name: 'userPhones',
                type: 'string',
                displayOptions: { show: { resource: ['user'], operation: ['checkUser'] } },
                default: '',
                required: true,
                description: 'Comma-separated phone numbers to check (e.g. 6285718422265,6285718422266)',
            },
            {
                displayName: 'New Push Name',
                name: 'pushName',
                type: 'string',
                displayOptions: { show: { resource: ['user'], operation: ['changePushName'] } },
                default: '',
                required: true,
                description: 'New push name to set',
            },
            {
                displayName: 'Avatar File',
                name: 'avatarFile',
                type: 'string',
                displayOptions: { show: { resource: ['user'], operation: ['changeAvatar'] } },
                default: '',
                required: true,
                description: 'Path to avatar image file',
            },

            // SEND PARAMETERS
            {
                displayName: 'To',
                name: 'to',
                type: 'string',
                displayOptions: { show: { resource: ['send'] } },
                default: '',
                required: true,
                description: 'Phone number or Group JID (e.g. 6285718422265 or 120363220336809434@g.us)',
            },
            {
                displayName: 'Message',
                name: 'message',
                type: 'string',
                displayOptions: { show: { resource: ['send'], operation: ['message'] } },
                default: '',
                required: true,
                description: 'Text message to send',
            },
            {
                displayName: 'Caption',
                name: 'caption',
                type: 'string',
                displayOptions: { show: { resource: ['send'], operation: ['image', 'video', 'file'] } },
                default: '',
                description: 'Caption for media file',
            },
            {
                displayName: 'File',
                name: 'file',
                type: 'string',
                displayOptions: { show: { resource: ['send'], operation: ['image', 'audio', 'video', 'file'] } },
                default: '',
                required: true,
                description: 'Path to file or base64 encoded file data',
            },
            {
                displayName: 'Contact Data',
                name: 'contactData',
                type: 'collection',
                displayOptions: { show: { resource: ['send'], operation: ['contact'] } },
                default: {},
                placeholder: 'Add Contact Field',
                options: [
                    { displayName: 'Name', name: 'name', type: 'string', default: '' },
                    { displayName: 'Phone', name: 'phone', type: 'string', default: '' },
                ],
            },
            {
                displayName: 'Link',
                name: 'link',
                type: 'string',
                displayOptions: { show: { resource: ['send'], operation: ['link'] } },
                default: '',
                required: true,
                description: 'URL to send',
            },
            {
                displayName: 'Location Data',
                name: 'locationData',
                type: 'collection',
                displayOptions: { show: { resource: ['send'], operation: ['location'] } },
                default: {},
                placeholder: 'Add Location Field',
                required: true,
                options: [
                    { displayName: 'Latitude', name: 'latitude', type: 'number', default: 0 },
                    { displayName: 'Longitude', name: 'longitude', type: 'number', default: 0 },
                    { displayName: 'Name', name: 'name', type: 'string', default: '' },
                    { displayName: 'Address', name: 'address', type: 'string', default: '' },
                ],
            },
            {
                displayName: 'Poll Data',
                name: 'pollData',
                type: 'collection',
                displayOptions: { show: { resource: ['send'], operation: ['poll'] } },
                default: {},
                placeholder: 'Add Poll Field',
                required: true,
                options: [
                    { displayName: 'Question', name: 'question', type: 'string', default: '' },
                    { displayName: 'Options', name: 'options', type: 'string', default: '', description: 'Comma-separated poll options' },
                    { displayName: 'Max Answers', name: 'maxAnswers', type: 'number', default: 1 },
                ],
            },
            {
                displayName: 'Presence',
                name: 'presence',
                type: 'options',
                displayOptions: { show: { resource: ['send'], operation: ['presence'] } },
                options: [
                    { name: 'Available', value: 'available' },
                    { name: 'Unavailable', value: 'unavailable' },
                ],
                default: 'available',
            },
            {
                displayName: 'Chat Presence',
                name: 'chatPresence',
                type: 'options',
                displayOptions: { show: { resource: ['send'], operation: ['chatPresence'] } },
                options: [
                    { name: 'Typing', value: 'composing' },
                    { name: 'Recording', value: 'recording' },
                    { name: 'Stop', value: 'paused' },
                ],
                default: 'composing',
            },

            // MESSAGE PARAMETERS
            {
                displayName: 'Message ID',
                name: 'messageId',
                type: 'string',
                displayOptions: { show: { resource: ['message'] } },
                default: '',
                required: true,
                description: 'ID of the message to act upon',
            },
            {
                displayName: 'Reaction',
                name: 'reaction',
                type: 'string',
                displayOptions: { show: { resource: ['message'], operation: ['react'] } },
                default: '',
                description: 'Emoji reaction (leave empty to remove reaction)',
            },
            {
                displayName: 'New Message Text',
                name: 'newMessage',
                type: 'string',
                displayOptions: { show: { resource: ['message'], operation: ['edit'] } },
                default: '',
                required: true,
                description: 'New message text for editing',
            },

            // GROUP PARAMETERS
            {
                displayName: 'Group JID',
                name: 'groupJid',
                type: 'string',
                displayOptions: { show: { resource: ['group'], operation: ['getInfo', 'leave', 'addParticipants', 'removeParticipant', 'promoteParticipant', 'demoteParticipant', 'getParticipantRequests', 'approveJoinRequest', 'rejectJoinRequest', 'setPhoto', 'setName', 'setLocked', 'setAnnounce', 'setTopic', 'getInviteLink'] } },
                default: '',
                required: true,
                description: 'Group JID (e.g. 120363220336809434@g.us)',
            },
            {
                displayName: 'Group Link',
                name: 'groupLink',
                type: 'string',
                displayOptions: { show: { resource: ['group'], operation: ['joinWithLink', 'getInfoFromLink'] } },
                default: '',
                required: true,
                description: 'WhatsApp group invite link',
            },
            {
                displayName: 'Group Name',
                name: 'groupName',
                type: 'string',
                displayOptions: { show: { resource: ['group'], operation: ['create', 'setName'] } },
                default: '',
                required: true,
                description: 'Name for the group',
            },
            {
                displayName: 'Participants',
                name: 'participants',
                type: 'string',
                displayOptions: { show: { resource: ['group'], operation: ['create', 'addParticipants'] } },
                default: '',
                required: true,
                description: 'Comma-separated phone numbers (e.g. 6285718422265,6285718422266)',
            },
            {
                displayName: 'Participant Phone',
                name: 'participantPhone',
                type: 'string',
                displayOptions: { show: { resource: ['group'], operation: ['removeParticipant', 'promoteParticipant', 'demoteParticipant', 'approveJoinRequest', 'rejectJoinRequest'] } },
                default: '',
                required: true,
                description: 'Phone number of participant',
            },
            {
                displayName: 'Group Photo',
                name: 'groupPhoto',
                type: 'string',
                displayOptions: { show: { resource: ['group'], operation: ['setPhoto'] } },
                default: '',
                required: true,
                description: 'Path to photo file or base64 encoded image',
            },
            {
                displayName: 'Group Topic',
                name: 'groupTopic',
                type: 'string',
                displayOptions: { show: { resource: ['group'], operation: ['setTopic'] } },
                default: '',
                required: true,
                description: 'Group description/topic',
            },
            {
                displayName: 'Locked',
                name: 'locked',
                type: 'boolean',
                displayOptions: { show: { resource: ['group'], operation: ['setLocked'] } },
                default: false,
                description: 'Lock group settings (only admins can change)',
            },
            {
                displayName: 'Announce',
                name: 'announce',
                type: 'boolean',
                displayOptions: { show: { resource: ['group'], operation: ['setAnnounce'] } },
                default: false,
                description: 'Announce mode (only admins can send messages)',
            },

            // CHAT PARAMETERS
            {
                displayName: 'Chat JID',
                name: 'chatJid',
                type: 'string',
                displayOptions: { show: { resource: ['chat'], operation: ['getMessages', 'label', 'pin'] } },
                default: '',
                required: true,
                description: 'Chat JID (phone number or group ID)',
            },
            {
                displayName: 'Label',
                name: 'label',
                type: 'string',
                displayOptions: { show: { resource: ['chat'], operation: ['label'] } },
                default: '',
                required: true,
                description: 'Label to add to chat',
            },
            {
                displayName: 'Pin',
                name: 'pin',
                type: 'boolean',
                displayOptions: { show: { resource: ['chat'], operation: ['pin'] } },
                default: true,
                description: 'Pin or unpin chat',
            },
            {
                displayName: 'Additional Options',
                name: 'chatMessagesOptions',
                type: 'collection',
                displayOptions: { show: { resource: ['chat'], operation: ['getMessages'] } },
                default: {},
                placeholder: 'Add Option',
                options: [
                    { displayName: 'Limit', name: 'limit', type: 'number', default: 25, description: 'Number of messages to retrieve' },
                    { displayName: 'Offset', name: 'offset', type: 'number', default: 0, description: 'Offset for pagination' },
                ],
            },

            // NEWSLETTER PARAMETERS
            {
                displayName: 'Newsletter JID',
                name: 'newsletterJid',
                type: 'string',
                displayOptions: { show: { resource: ['newsletter'], operation: ['unfollow'] } },
                default: '',
                required: true,
                description: 'Newsletter JID to unfollow',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const resource = this.getNodeParameter('resource', i) as string;

            let endpoint = '';
            let method: IHttpRequestMethods = 'GET';
            let body: any = {};

            try {
                if (resource === 'app') {
                    const result = await executeApp.call(this, i);
                    endpoint = result.endpoint;
                    method = result.method;
                    body = result.body;
                } else if (resource === 'user') {
                    const result = await executeUser.call(this, i);
                    endpoint = result.endpoint;
                    method = result.method;
                    body = result.body;
                } else if (resource === 'send') {
                    const result = await executeSend.call(this, i);
                    endpoint = result.endpoint;
                    method = result.method;
                    body = result.body;
                } else if (resource === 'message') {
                    const result = await executeMessage.call(this, i);
                    endpoint = result.endpoint;
                    method = result.method;
                    body = result.body;
                } else if (resource === 'group') {
                    const result = await executeGroup.call(this, i);
                    endpoint = result.endpoint;
                    method = result.method;
                    body = result.body;
                } else if (resource === 'chat') {
                    const result = await executeChat.call(this, i);
                    endpoint = result.endpoint;
                    method = result.method;
                    body = result.body;
                } else if (resource === 'newsletter') {
                    const result = await executeNewsletter.call(this, i);
                    endpoint = result.endpoint;
                    method = result.method;
                    body = result.body;
                } else {
                    returnData.push({
                        json: { error: `Resource "${resource}" is not yet implemented.` },
                        pairedItem: { item: i },
                    });
                    continue;
                }

                
                const credentials = await this.getCredentials('whatsappPrivateApi');
                const baseUrl = credentials.baseUrl as string;

                const responseData = await this.helpers.requestWithAuthentication.call(
                    this,
                    'whatsappPrivateApi',
                    {
                        method,
                        url: `${baseUrl}${endpoint}`,  // Diese Zeile ändern
                        body: Object.keys(body).length > 0 ? body : undefined,
                        json: true,
                    },
                );

                returnData.push({
                    json: responseData,
                    pairedItem: { item: i },
                });

            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: error.message },
                        pairedItem: { item: i },
                    });
                } else {
                    throw error;
                }
            }
        }

        return this.prepareOutputData(returnData);
    }
}