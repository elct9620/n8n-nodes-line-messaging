import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import * as getContent from './data-actions/getContent.operation';

type ItemProcessor = (this: IExecuteFunctions, itemIndex: number) => Promise<INodeExecutionData>;

const processors: Record<string, ItemProcessor> = {
	getContent: getContent.processItem,
};

export class LineMessagingData implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Line Messaging Data',
		name: 'lineMessagingData',
		icon: 'file:line.svg',
		group: ['output'],
		version: [1],
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send and receive large amounts of data with Line Messaging API',
		defaults: {
			name: 'Line Messaging Data',
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
				noDataExpression: true,
				default: 'getContent',
				options: [
					{
						name: 'Get Content',
						value: 'getContent',
						description: 'Retrieve content of a message by its ID',
						action: 'Retrieve content of a message by its ID',
					},
				],
			},
			...getContent.description,
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
