import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import * as reply from './actions/reply.operation';
import * as getProfile from './actions/getProfile.operation';
import * as send from './actions/send.operation';
import * as multicast from './actions/multicast.operation';
import * as showLoadingAnimation from './actions/showLoadingAnimation.operation';

type ItemProcessor = (this: IExecuteFunctions, itemIndex: number) => Promise<INodeExecutionData>;

const processors: Record<string, ItemProcessor> = {
	reply: reply.processItem,
	send: send.processItem,
	multicast: multicast.processItem,
	getProfile: getProfile.processItem,
	showLoadingAnimation: showLoadingAnimation.processItem,
};

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
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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
					{
						name: 'Show Loading Animation',
						value: 'showLoadingAnimation',
						description: 'Display a loading animation to a user',
						action: 'Display a loading animation to a user',
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

			// Show Loading Animation operation properties
			...showLoadingAnimation.description,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;
		const processor = processors[operation];
		const returnData: INodeExecutionData[] = [];

		if (!processor) {
			throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const result = await processor.call(this, i);
				returnData.push(result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: (error as JsonObject).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				const wrapped =
					error instanceof NodeApiError || error instanceof NodeOperationError
						? error
						: new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
				throw wrapped;
			}
		}

		return [returnData];
	}
}
