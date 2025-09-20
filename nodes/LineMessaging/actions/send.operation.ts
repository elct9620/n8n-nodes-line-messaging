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
import { getUserIdProperty } from './shared/operationProperties';
import { getMessageProperties } from './shared/messageProperties';

export const properties: INodeProperties[] = [
	// User ID
	getUserIdProperty(),

	// Messages
	getMessageProperties(['send']),
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
			const to = this.getNodeParameter('to', i, '') as string;

			if (!to) {
				throw new NodeOperationError(this.getNode(), 'User ID is required. Use the LINE user ID from webhook or profile.');
			}

			if (messages.length === 0) {
				throw new NodeOperationError(this.getNode(), 'At least one message is required. Add text, image, or other message types.');
			}

			// Make API call to Line Messaging API
			const responseData = await apiRequest.call(this, 'POST', '/message/push', {
				to,
				messages,
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
