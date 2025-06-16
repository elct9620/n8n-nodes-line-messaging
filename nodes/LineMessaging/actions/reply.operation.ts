import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MessageType } from '../Message';
import { apiRequest } from '../GenericFunctions';
import { MessageFactory } from '../Factory';

export const properties: INodeProperties[] = [
	/**
	 * Reply Token
	 */
	{
		displayName: 'Reply Token',
		name: 'replyToken',
		type: 'string',
		required: true,
		typeOptions: { password: true },
		default: '',
		placeholder: '1234567890',
		description:
			'The reply token to use for replying to a message. If not provided, the message will be sent as a new message.',
	},

	/***
	 * Messages
	 */
	{
		displayName: 'Messages',
		name: 'messages',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		default: {},
		placeholder: 'Add Message',
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
	},
];

export const description = properties;

export async function execute(this: IExecuteFunctions, items: INodeExecutionData[]) {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const messagesCollection = this.getNodeParameter('messages', i, {
				values: [],
			}) as { values: IDataObject[] };

			// Transform the input parameters into LINE API compatible messages
			const messages = (messagesCollection.values || []).map((params) =>
				MessageFactory.createMessage(params),
			);
			const replyToken = this.getNodeParameter('replyToken', i, '') as string;

			if (!replyToken) {
				throw new NodeOperationError(this.getNode(), 'Reply token is required for reply operation');
			}

			if (messages.length === 0) {
				throw new NodeOperationError(this.getNode(), 'At least one message is required');
			}

			// Make API call to Line Messaging API
			const responseData = await apiRequest.call(this, 'POST', '/message/reply', {
				replyToken,
				messages,
			});

			returnData.push({
				json: { success: true, response: responseData },
				pairedItem: {
					item: i,
				},
			});
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({
					json: {
						success: false,
						error: (error as JsonObject).message,
					},
					pairedItem: {
						item: i,
					},
				});
				continue;
			}
			throw error;
		}
	}

	return returnData;
}
