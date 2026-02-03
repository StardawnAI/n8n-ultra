import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeGroup(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    const operation = this.getNodeParameter('operation', i) as string;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'joinWithLink':
            // Join group with invite link
            endpoint = '/group/join-with-link';
            method = 'POST';
            const groupLink = this.getNodeParameter('groupLink', i) as string;
            body.link = groupLink;
            break;

        case 'getInfoFromLink':
            // Get group info from link
            endpoint = '/group/info-from-link';
            method = 'GET';
            const infoGroupLink = this.getNodeParameter('groupLink', i) as string;
            endpoint += `?link=${encodeURIComponent(infoGroupLink)}`;
            break;

        case 'getInfo':
            // Get group information
            endpoint = '/group/info';
            method = 'GET';
            const groupJid = this.getNodeParameter('groupJid', i) as string;
            endpoint += `?group_jid=${encodeURIComponent(groupJid)}`;
            break;

        case 'leave':
            // Leave group
            endpoint = '/group/leave';
            method = 'POST';
            const leaveGroupJid = this.getNodeParameter('groupJid', i) as string;
            body.group_jid = leaveGroupJid;
            break;

        case 'create':
            // Create new group
            endpoint = '/group';
            method = 'POST';
            const groupName = this.getNodeParameter('groupName', i) as string;
            const participants = this.getNodeParameter('participants', i) as string;
            
            body.name = groupName;
            body.participants = participants.split(',').map((phone: string) => phone.trim());
            break;

        case 'addParticipants':
            // Add participants to group
            endpoint = '/group/participants';
            method = 'POST';
            const addGroupJid = this.getNodeParameter('groupJid', i) as string;
            const addParticipants = this.getNodeParameter('participants', i) as string;
            
            body.group_jid = addGroupJid;
            body.participants = addParticipants.split(',').map((phone: string) => phone.trim());
            break;

        case 'removeParticipant':
            // Remove participant from group
            endpoint = '/group/participants/remove';
            method = 'POST';
            const removeGroupJid = this.getNodeParameter('groupJid', i) as string;
            const participantPhone = this.getNodeParameter('participantPhone', i) as string;
            
            body.group_jid = removeGroupJid;
            body.phone = participantPhone;
            break;

        case 'promoteParticipant':
            // Promote participant to admin
            endpoint = '/group/participants/promote';
            method = 'POST';
            const promoteGroupJid = this.getNodeParameter('groupJid', i) as string;
            const promoteParticipantPhone = this.getNodeParameter('participantPhone', i) as string;
            
            body.group_jid = promoteGroupJid;
            body.phone = promoteParticipantPhone;
            break;

        case 'demoteParticipant':
            // Demote participant from admin
            endpoint = '/group/participants/demote';
            method = 'POST';
            const demoteGroupJid = this.getNodeParameter('groupJid', i) as string;
            const demoteParticipantPhone = this.getNodeParameter('participantPhone', i) as string;
            
            body.group_jid = demoteGroupJid;
            body.phone = demoteParticipantPhone;
            break;

        case 'getParticipantRequests':
            // Get pending join requests
            endpoint = '/group/participant-requests';
            method = 'GET';
            const requestsGroupJid = this.getNodeParameter('groupJid', i) as string;
            endpoint += `?group_jid=${encodeURIComponent(requestsGroupJid)}`;
            break;

        case 'approveJoinRequest':
            // Approve join request
            endpoint = '/group/participant-requests/approve';
            method = 'POST';
            const approveGroupJid = this.getNodeParameter('groupJid', i) as string;
            const approveParticipantPhone = this.getNodeParameter('participantPhone', i) as string;
            
            body.group_jid = approveGroupJid;
            body.phone = approveParticipantPhone;
            break;

        case 'rejectJoinRequest':
            // Reject join request
            endpoint = '/group/participant-requests/reject';
            method = 'POST';
            const rejectGroupJid = this.getNodeParameter('groupJid', i) as string;
            const rejectParticipantPhone = this.getNodeParameter('participantPhone', i) as string;
            
            body.group_jid = rejectGroupJid;
            body.phone = rejectParticipantPhone;
            break;

        case 'setPhoto':
            // Set group photo
            endpoint = '/group/photo';
            method = 'POST';
            const photoGroupJid = this.getNodeParameter('groupJid', i) as string;
            const groupPhoto = this.getNodeParameter('groupPhoto', i) as string;
            
            body.group_jid = photoGroupJid;
            body.photo = groupPhoto;
            break;

        case 'setName':
            // Set group name
            endpoint = '/group/name';
            method = 'POST';
            const nameGroupJid = this.getNodeParameter('groupJid', i) as string;
            const newGroupName = this.getNodeParameter('groupName', i) as string;
            
            body.group_jid = nameGroupJid;
            body.name = newGroupName;
            break;

        case 'setLocked':
            // Lock/unlock group settings
            endpoint = '/group/locked';
            method = 'POST';
            const lockedGroupJid = this.getNodeParameter('groupJid', i) as string;
            const locked = this.getNodeParameter('locked', i) as boolean;
            
            body.group_jid = lockedGroupJid;
            body.locked = locked;
            break;

        case 'setAnnounce':
            // Set announce mode
            endpoint = '/group/announce';
            method = 'POST';
            const announceGroupJid = this.getNodeParameter('groupJid', i) as string;
            const announce = this.getNodeParameter('announce', i) as boolean;
            
            body.group_jid = announceGroupJid;
            body.announce = announce;
            break;

        case 'setTopic':
            // Set group topic/description
            endpoint = '/group/topic';
            method = 'POST';
            const topicGroupJid = this.getNodeParameter('groupJid', i) as string;
            const groupTopic = this.getNodeParameter('groupTopic', i) as string;
            
            body.group_jid = topicGroupJid;
            body.topic = groupTopic;
            break;

        case 'getInviteLink':
            // Get group invite link
            endpoint = '/group/invite-link';
            method = 'GET';
            const inviteLinkGroupJid = this.getNodeParameter('groupJid', i) as string;
            endpoint += `?group_jid=${encodeURIComponent(inviteLinkGroupJid)}`;
            break;

        default:
            throw new Error(`Unknown operation: ${operation}`);
    }

    return { method, endpoint, body };
}