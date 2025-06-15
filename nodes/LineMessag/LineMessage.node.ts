import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { Message, MessageType } from '../../types/Message';

export class LineMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Line Message Builder',
		name: 'lineMessage',
		icon: 'file:line.svg',
		group: ['output'],
		version: [1],
		subtitle: '={{$parameter["messageType"]}}',
		description: 'Builds messages for Line Messaging API',
		defaults: {
			name: 'Line Message Builder',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				default: 'textV2',
				noDataExpression: true,
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
					'The quote token to use for replying to a message. If not provided, the message will be sent as a new message.',
				displayOptions: {
					show: {
						messageType: [MessageType.TextV2],
					},
				},
			},

			/***
			 * Text
			 */
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '',
				placeholder: 'Hello, world!',
				description: 'The text message to send',
				displayOptions: {
					show: {
						messageType: [MessageType.TextV2],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const messages: Message[] = [];

		const type = this.getNodeParameter('messageType', 0) as MessageType;
		const items: INodeExecutionData[] = this.getInputData();

		for (let i = 0; i < items.length; i++) {
			let message: Message;

			if (type === MessageType.TextV2) {
				message = {
					type: MessageType.TextV2,
					text: this.getNodeParameter('text', i) as string,
					quoteToken: this.getNodeParameter('quoteToken', i, null) as string,
				} as Message;
				messages.push(message);
			}
		}

		return [messages as any as INodeExecutionData[]];
	}
}
