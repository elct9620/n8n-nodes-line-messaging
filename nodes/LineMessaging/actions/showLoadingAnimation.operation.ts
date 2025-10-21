import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	JsonObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest } from '../GenericFunctions';

export const properties: INodeProperties[] = [
	{
		displayName: 'Chat ID',
		name: 'chatId',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['showLoadingAnimation'],
			},
		},
		default: '',
		required: true,
		description: 'User ID of the target user for whom the loading animation is to be displayed',
		placeholder: 'U4af4980629...',
	},
	{
		displayName: 'Loading Seconds',
		name: 'loadingSeconds',
		type: 'options',
		displayOptions: {
			show: {
				operation: ['showLoadingAnimation'],
			},
		},
		options: [
			{
				name: '5',
				value: 5,
			},
			{
				name: '10',
				value: 10,
			},
			{
				name: '15',
				value: 15,
			},
			{
				name: '20',
				value: 20,
			},
			{
				name: '25',
				value: 25,
			},
			{
				name: '30',
				value: 30,
			},
			{
				name: '35',
				value: 35,
			},
			{
				name: '40',
				value: 40,
			},
			{
				name: '45',
				value: 45,
			},
			{
				name: '50',
				value: 50,
			},
			{
				name: '55',
				value: 55,
			},
			{
				name: '60',
				value: 60,
			},
		],
		default: 20,
		description: 'Number of seconds to display the loading animation',
	},
];

export const description = properties;

export async function execute(this: IExecuteFunctions, items: INodeExecutionData[]) {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const chatId = this.getNodeParameter('chatId', i, '') as string;
			const loadingSeconds = this.getNodeParameter('loadingSeconds', i, 20) as number;

			if (!chatId) {
				throw new NodeOperationError(
					this.getNode(),
					'Chat ID is required. Use the LINE user ID from webhook or profile.',
				);
			}

			// Make API call to Line Messaging API
			const responseData = await apiRequest.call(this, 'POST', '/chat/loading/start', {
				chatId,
				loadingSeconds,
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
