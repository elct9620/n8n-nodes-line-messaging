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
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'U4af4980629...',
		description: 'The ID of the user whose profile you want to retrieve',
		displayOptions: {
			show: {
				operation: ['getProfile'],
			},
		},
	},
];

export const description = properties;

export async function execute(this: IExecuteFunctions, items: INodeExecutionData[]) {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const userId = this.getNodeParameter('userId', i) as string;

			if (!userId) {
				throw new NodeOperationError(
					this.getNode(),
					'User ID is required. Use the LINE user ID from webhook or other sources.',
				);
			}

			// Make API call to Line Messaging API to get profile
			const responseData = await apiRequest.call(this, 'GET', `/profile/${userId}`, {});

			returnData.push({
				json: {
					success: true,
					profile: responseData,
				},
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
