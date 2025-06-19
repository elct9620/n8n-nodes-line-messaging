import type { INodeProperties } from 'n8n-workflow';

/**
 * Creates the reply token property for reply operations
 * @returns INodeProperties for reply token
 */
export function getReplyTokenProperty(): INodeProperties {
	return {
		displayName: 'Reply Token',
		name: 'replyToken',
		type: 'string',
		required: true,
		typeOptions: { password: true },
		default: '',
		placeholder: '1234567890',
		description:
			'The reply token to use for replying to a message. If not provided, the message will be sent as a new message.',
		displayOptions: {
			show: {
				operation: ['reply'],
			},
		},
	};
}

/**
 * Creates the user ID property for send operations
 * @returns INodeProperties for user ID
 */
export function getUserIdProperty(): INodeProperties {
	return {
		displayName: 'User ID',
		name: 'to',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'U1234567890abcdef...',
		description: 'The ID of the user to send the message to',
		displayOptions: {
			show: {
				operation: ['send'],
			},
		},
	};
}
