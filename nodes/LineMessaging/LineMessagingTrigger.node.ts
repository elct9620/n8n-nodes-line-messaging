import type {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionType } from 'n8n-workflow';
import * as crypto from 'crypto';

export class LineMessagingTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Line Messaging Trigger',
		name: 'lineMessagingTrigger',
		icon: 'file:line.svg',
		group: ['trigger'],
		version: [1],
		defaultVersion: 1,
		subtitle: '=Updates: {{$parameter["updates"].join(", ")}}',
		description: 'Starts the workflow on a Line Messaging update',
		defaults: {
			name: 'Line Messaging Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'lineMessagingApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const credentials = await this.getCredentials('lineMessagingApi');
		const receivedSignature = this.getHeaderData('x-line-signature');
		const bodyData = this.getBodyData();
		
		// Verify the signature using the channel secret
		const channelSecret = credentials.channelSecret as string;
		const bodyString = JSON.stringify(bodyData);
		
		// Create hmac using sha256
		const hmac = crypto.createHmac('sha256', channelSecret);
		hmac.update(bodyString);
		const calculatedSignature = hmac.digest('base64');
		
		// Compare the calculated signature with the received one
		if (receivedSignature !== calculatedSignature) {
			throw new NodeApiError(this.getNode(), bodyData, {
				message: 'Line signature verification failed',
				description: 'The signature in the x-line-signature header does not match the calculated signature',
			});
		}

		return {
			workflowData: [
				{
					json: bodyData,
				},
			],
		};
	}
}
