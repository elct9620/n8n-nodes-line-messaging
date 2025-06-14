import type {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class LineMessagingTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Line Messaging Trigger',
		name: 'lineMessagingTrigger',
		icon: 'file:line.svg',
		group: ['trigger'],
		version: [1],
		defaultVersion: 1,
		subtitle: '=Updates: {{$parameter["updates"].join(", ")}}',
		description: 'Starts the workflow on a Telegram update',
		defaults: {
			name: 'Telegram Trigger',
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
		const signature = this.getHeaderData('x-line-signature');
		const bodyData = this.getBodyData();

		// TODO: verify the signature with the credentials
		// Use `credentials.channelSecret` to verify the signature
		// The `JSON.stringify(bodyData)` should be used to create the sha256 hash
		// compare it with the `signature` header as base64 encoded string

		return {
			workflowData: [],
		};
	}
}
