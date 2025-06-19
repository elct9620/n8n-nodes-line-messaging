import type { INodeProperties } from 'n8n-workflow';
import { MessageType } from '../../Message';

/**
 * Creates the shared message properties configuration for LINE messaging operations
 * @param operations Array of operation names that should show these properties
 * @returns INodeProperties for the messages collection
 */
export function getMessageProperties(operations: string[]): INodeProperties {
	return {
		displayName: 'Messages',
		name: 'messages',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		default: {},
		placeholder: 'Add Message',
		displayOptions: {
			show: {
				operation: operations,
			},
		},
		options: [
			{
				displayName: 'Message',
				name: 'values',
				values: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						default: 'textV2',
						options: [
							{
								name: 'Text Message (V2)',
								value: MessageType.TextV2,
							},
						],
					},

					/**
					 * Quote Token
					 */
					{
						displayName: 'Quote Token',
						name: 'quoteToken',
						type: 'string',
						typeOptions: { password: true },
						default: '',
						placeholder: '1234567890',
						description:
							'The quote token to use for quoting a message. If not provided, the message will be sent as a new message.',
						displayOptions: {
							show: {
								type: [MessageType.TextV2],
							},
						},
					},

					/**
					 * Text Message
					 */
					{
						displayName: 'Text',
						name: 'text',
						type: 'string',
						default: '',
						placeholder: 'Hello, World!',
						description: 'The text message to send',
						displayOptions: {
							show: {
								type: [MessageType.TextV2],
							},
						},
					},

					/**
					 * Quick Reply
					 */
					{
						displayName: 'Quick Reply',
						name: 'quickReply',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
							sortable: true,
						},
						default: {},
						placeholder: 'Add Quick Reply',
						options: [
							{
								displayName: 'Quick Reply Item',
								name: 'items',
								values: [
									{
										displayName: 'Label',
										name: 'label',
										type: 'string',
										default: '',
										placeholder: 'Quick Reply',
										description: 'The label for the quick reply item',
									},
									{
										displayName: 'Action Type',
										name: 'actionType',
										type: 'options',
										default: 'postback',
										options: [
											{
												name: 'Postback',
												value: 'postback',
											},
											{
												name: 'Message',
												value: 'message',
											},
										],
									},
									{
										displayName: 'Data',
										name: 'data',
										type: 'string',
										default: '',
										placeholder: '{"key":"value"}',
										description:
											'The data to send with the quick reply action. Format depends on action type.',
									},
								],
							},
						],
					},
				],
			},
		],
	};
}
