import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest } from '../GenericFunctions';
import { MessageFactory } from '../Factory';
import { getMessageProperties } from './shared/messageProperties';

/**
 * Creates the user IDs property for multicast operations
 * @returns INodeProperties for user IDs array
 */
function getUserIdsProperty(): INodeProperties {
	return {
		displayName: 'User IDs',
		name: 'to',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'U1234567890abcdef..., U0987654321fedcba...',
		description: 'Comma-separated list of User IDs to send the message to (max 500 recipients)',
		displayOptions: {
			show: {
				operation: ['multicast'],
			},
		},
	};
}

export const properties: INodeProperties[] = [
	// User IDs
	getUserIdsProperty(),

	// Messages
	getMessageProperties(['multicast']),
];

export const description = properties;

export async function execute(this: IExecuteFunctions, items: INodeExecutionData[]) {
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const messagesCollection = this.getNodeParameter('messages', i, {
				values: [],
			}) as { values: IDataObject[] };

			// Transform the input parameters into LINE API compatible messages
			const messages = (messagesCollection.values || []).map((params) =>
				MessageFactory.createMessage(params),
			);
			const toInput = this.getNodeParameter('to', i, '') as string;

			if (!toInput) {
				throw new NodeOperationError(
					this.getNode(),
					'User IDs are required for multicast operation',
				);
			}

			// Parse comma-separated User IDs and trim whitespace
			const to = toInput
				.split(',')
				.map((id) => id.trim())
				.filter((id) => id.length > 0);

			if (to.length === 0) {
				throw new NodeOperationError(this.getNode(), 'At least one valid User ID is required');
			}

			if (to.length > 500) {
				throw new NodeOperationError(
					this.getNode(),
					'Maximum 500 recipients allowed for multicast operation',
				);
			}

			if (messages.length === 0) {
				throw new NodeOperationError(this.getNode(), 'At least one message is required');
			}

			// Make API call to Line Messaging API
			const responseData = await apiRequest.call(this, 'POST', '/message/multicast', {
				to,
				messages,
			});

			returnData.push({
				json: {
					success: true,
					response: responseData,
					recipientCount: to.length,
					userIds: to,
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
