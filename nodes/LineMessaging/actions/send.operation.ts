import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
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

export async function processItem(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const messagesCollection = this.getNodeParameter('messages', itemIndex, {
		values: [],
	}) as { values: IDataObject[] };

	// Transform the input parameters into LINE API compatible messages
	const messages = (messagesCollection.values || []).map((params) =>
		MessageFactory.createMessage(params),
	);
	const to = this.getNodeParameter('to', itemIndex, '') as string;

	if (!to) {
		throw new NodeOperationError(
			this.getNode(),
			'User ID is required. Use the LINE user ID from webhook or profile.',
			{ itemIndex },
		);
	}

	if (messages.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			'At least one message is required. Add text, image, or other message types.',
			{ itemIndex },
		);
	}

	// Make API call to Line Messaging API
	const responseData = await apiRequest.call(this, 'POST', '/message/push', {
		to,
		messages,
	});

	return {
		json: { success: true, response: responseData },
		pairedItem: { item: itemIndex },
	};
}
