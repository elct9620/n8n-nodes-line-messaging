import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
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

export async function processItem(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const userId = this.getNodeParameter('userId', itemIndex) as string;

	if (!userId) {
		throw new NodeOperationError(
			this.getNode(),
			'User ID is required. Use the LINE user ID from webhook or other sources.',
			{ itemIndex },
		);
	}

	// Make API call to Line Messaging API to get profile
	const responseData = await apiRequest.call(this, 'GET', `/profile/${userId}`, {});

	return {
		json: {
			success: true,
			profile: responseData,
		},
		pairedItem: { item: itemIndex },
	};
}
