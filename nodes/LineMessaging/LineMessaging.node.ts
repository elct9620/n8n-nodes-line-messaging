import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class LineMessaging implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Line Messaging',
		name: 'lineMessaging',
		icon: 'file:line.svg',
		group: ['output'],
		version: [1],
		subtitle: '={{$parameter["type"]}',
		description: 'Sends messages to Line Messaging API',
		defaults: {
			name: 'Line Messaging',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'lineMessagingApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: 'reply',
				noDataExpression: true,
				options: [
					{
						name: 'Reply',
						value: 'reply',
					},
				],
			},

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
				displayOptions: {
					show: {
						type: ['reply'],
					},
				},
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
						name: 'messageValues',
						displayName: 'Message',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'Text',
										value: 'text',
									},
								],
								default: 'text',
								description: 'Message type',
							},
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										type: ['text'],
									},
								},
								description: 'Message text',
								placeholder: 'Hello, user',
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const credentials = await this.getCredentials('lineMessagingApi');
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const type = this.getNodeParameter('type', 0) as string;

		const channelAccessToken = credentials.channelAccessToken as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const messagesCollection = this.getNodeParameter('messages', i, { messageValues: [] }) as {
					messageValues?: Array<{
						type: string;
						text?: string;
					}>;
				};
				
				const messages = messagesCollection.messageValues || [];
				const replyToken = this.getNodeParameter('replyToken', i, '') as string;

				if (type === 'reply' && !replyToken) {
					throw new NodeOperationError(this.getNode(), 'Reply token is required for reply type');
				}

				if (messages.length === 0) {
					throw new NodeOperationError(this.getNode(), 'At least one message is required');
				}

				// Format the messages for the LINE API
				const formattedMessages = messages.map((message) => {
					if (message.type === 'text') {
						return {
							type: 'text',
							text: message.text,
						};
					}
					return null;
				}).filter(Boolean);

				// Make API call to Line Messaging API
				if (type === 'reply') {
					const responseData = await this.helpers.request({
						method: 'POST',
						url: 'https://api.line.me/v2/bot/message/reply',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${channelAccessToken}`,
						},
						body: {
							replyToken: replyToken,
							messages: formattedMessages,
						},
						json: true,
					});
					
					returnData.push({
						json: { success: true, response: responseData },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: (error as JsonObject).message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
