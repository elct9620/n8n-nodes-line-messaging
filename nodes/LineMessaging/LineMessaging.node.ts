import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import * as reply from './actions/reply.operation';
import * as getProfile from './actions/getProfile.operation';

export class LineMessaging implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Line Messaging',
		name: 'lineMessaging',
		icon: 'file:line.svg',
		group: ['output'],
		version: [1],
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with the Line Messaging API',
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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: 'reply',
				noDataExpression: true,
				options: [
					{
						name: 'Get Profile',
						value: 'getProfile',
						description: 'Retrieve profile information of a user',
						action: 'Retrieve profile information of a user',
					},
					{
						name: 'Reply',
						value: 'reply',
						description: 'Reply to a message using a reply token',
						action: 'Reply to a message using a reply token',
					},
				],
			},
			// Reply operation properties
			...reply.description,
			
			// Get Profile operation properties
			...getProfile.description,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;
		let returnData: INodeExecutionData[] = [];

		if (operation === 'reply') {
			returnData = await reply.execute.call(this, items);
		} else if (operation === 'getProfile') {
			returnData = await getProfile.execute.call(this, items);
		}

		return [returnData];
	}
}
