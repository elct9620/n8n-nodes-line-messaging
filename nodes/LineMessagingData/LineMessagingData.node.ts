import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import * as getContent from './actions/getContent.operation';

export class LineMessagingData implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Line Messaging Data',
		name: 'lineMessagingData',
		icon: 'file:../LineMessaging/line.svg',
		group: ['output'],
		version: [1],
		subtitle: '={{$parameter["operation"]}}',
		description: 'Send and receive large amounts of data with Line Messaging API',
		defaults: {
			name: 'Line Messaging Data',
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
		let returnData: INodeExecutionData[] = [];

		if (operation === 'getContent') {
			returnData = await getContent.execute.call(this, items);
		}

		return [returnData];
	}
}
