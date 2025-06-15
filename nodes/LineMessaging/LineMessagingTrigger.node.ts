import type {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { verifySignature } from './GenericFunctions';

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
		const headers = this.getHeaderData();
		const bodyData = this.getBodyData();

		const receivedSignature = headers['x-line-signature'] as string;
		const channelSecret = credentials.channelSecret as string;
		
		// Verify the signature
		if (!verifySignature(channelSecret, receivedSignature, bodyData)) {
			const res = this.getResponseObject();
			res.status(403).json({ error: 'Invalid signature' });
			return {
				noWebhookResponse: true,
			};
		}

		return {
			workflowData: [],
		};
	}
}
