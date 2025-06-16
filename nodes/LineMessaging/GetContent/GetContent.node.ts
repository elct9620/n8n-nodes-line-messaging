import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class GetContent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Line Messaging Content',
		name: 'getContent',
		icon: 'file:../line.svg',
		group: ['output'],
		version: [1],
		description: 'Retrieves content from Line Messaging API',
		defaults: {
			name: 'Line Messaging Content',
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
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				default: '',
				required: true,
				placeholder: '1234567890',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];

		// TODO: Implement the logic to retrieve content from Line Messaging API
		// Create `IBinaryData` object to hold the content
		// Set mimetype from the content type

		return [returnData];
	}
}
