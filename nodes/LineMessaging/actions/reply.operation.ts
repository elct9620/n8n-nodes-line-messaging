import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiRequest } from '../GenericFunctions';
import { MessageFactory } from '../Factory';
import { getReplyTokenProperty } from './shared/operationProperties';
import { getMessageProperties } from './shared/messageProperties';

export const properties: INodeProperties[] = [
	// Reply Token
	getReplyTokenProperty(),

	// Messages
	getMessageProperties(['reply']),
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
	const replyToken = this.getNodeParameter('replyToken', itemIndex, '') as string;

	if (!replyToken) {
		throw new NodeOperationError(
			this.getNode(),
			'Reply token is required. Get it from the webhook trigger event.',
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
	const responseData = await apiRequest.call(this, 'POST', '/message/reply', {
		replyToken,
		messages,
	});

	return {
		json: { success: true, response: responseData },
		pairedItem: { item: itemIndex },
	};
}
