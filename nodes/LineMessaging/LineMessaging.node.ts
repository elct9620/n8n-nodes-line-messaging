import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import * as reply from './actions/reply.operation';
import * as getProfile from './actions/getProfile.operation';
import * as send from './actions/send.operation';
import * as multicast from './actions/multicast.operation';

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
						name: 'Multicast',
						value: 'multicast',
						description: 'Send a message to multiple users',
						action: 'Send a message to multiple users',
					},
					{
						name: 'Reply',
						value: 'reply',
						description: 'Reply to a message using a reply token',
						action: 'Reply to a message using a reply token',
					},
					{
						name: 'Send',
						value: 'send',
						description: 'Send a message to a user',
						action: 'Send a message to a user',
					},
				],
			},
			// Reply operation properties
			...reply.description,

			// Send operation properties
			...send.description,

			// Multicast operation properties
			...multicast.description,

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
		} else if (operation === 'send') {
			returnData = await send.execute.call(this, items);
		} else if (operation === 'multicast') {
			returnData = await multicast.execute.call(this, items);
		} else if (operation === 'getProfile') {
			returnData = await getProfile.execute.call(this, items);
		}

		return [returnData];
	}
}
