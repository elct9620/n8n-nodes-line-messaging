import type { INodeProperties } from 'n8n-workflow';
import { ActionType, MessageType } from '../../Message';

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
				// For UX reason, fields are ordered by usage frequency rather than alphabetically
				//
				// # TextV2
				// - Type (required, select first)
				// - Text (required)
				// - Quote Token (optional)
				// - Quick Reply (optional)
				//
				// # Flex
				// - Type (required, select first)
				// - Alt Text (required)
				// - Flex Message JSON (required)
				// - Quick Reply (optional)
				//
				// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
				values: [
					/**
					 * Alt Text - For Flex Messages
					 */
					{
						displayName: 'Alt Text',
						name: 'altText',
						type: 'string',
						required: true,
						default: '',
						placeholder: 'This is a flex message',
						description:
							'Alternative text shown in notifications and when Flex message cannot be displayed',
						displayOptions: {
							show: {
								type: [MessageType.Flex],
							},
						},
					},

					/**
					 * Flex Message JSON
					 */
					{
						displayName: 'Flex Message JSON',
						name: 'flexJson',
						type: 'json',
						typeOptions: {
							rows: 10,
						},
						default:
							'{\n  "type": "bubble",\n  "body": {\n    "type": "box",\n    "layout": "vertical",\n    "contents": [\n      {\n        "type": "text",\n        "text": "Hello, World!"\n      }\n    ]\n  }\n}',
						description:
							'Flex Message container JSON. Design your message using <a href="https://developers.line.biz/flex-simulator/" target="_blank">LINE Flex Message Simulator</a>.',
						displayOptions: {
							show: {
								type: [MessageType.Flex],
							},
						},
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
					 * Type
					 */
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						default: 'textV2',
						options: [
							{
								name: 'Flex Message',
								value: MessageType.Flex,
							},
							{
								name: 'Text Message (V2)',
								value: MessageType.TextV2,
							},
						],
					},

					/**
					 * Quick Reply - Intentionally placed last as optional field for all message types
					 */
					{
						displayName: 'Quick Reply (Optional)',
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
										displayName: 'Action Type',
										name: 'actionType',
										type: 'options',
										required: true,
										default: 'message',
										options: [
											{
												name: 'Message',
												value: ActionType.Message,
											},
											{
												name: 'Postback',
												value: ActionType.Postback,
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
									{
										displayName: 'Label',
										name: 'label',
										type: 'string',
										default: '',
										placeholder: 'Quick Reply',
										description: 'The label for the quick reply item',
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
