import type {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeOperationError, NodeConnectionType } from 'n8n-workflow';
import { verifySignature } from './GenericFunctions';
import { EventType, IEvent, type IWebhook } from './IWebhook';

export class LineMessagingTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Line Messaging Trigger',
		name: 'lineMessagingTrigger',
		icon: 'file:line.svg',
		group: ['trigger'],
		version: [1],
		defaultVersion: 1,
		usableAsTool: undefined,
		subtitle: '=Events: {{$parameter["events"].join(", ")}}',
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
		properties: [
			{
				displayName: 'Trigger On',
				name: 'events',
				type: 'multiOptions',
				default: [],
				options: [
					{
						name: 'All',
						value: '*',
						description: 'Trigger on all events',
					},
					...Object.values(EventType).map((event) => ({
						name: event.charAt(0).toUpperCase() + event.slice(1),
						value: event,
						description: `Trigger on ${event} events`,
					})),
				],
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const credentials = await this.getCredentials('lineMessagingApi');
		const headers = this.getHeaderData();
		const req = this.getRequestObject();
		const bodyData = this.getBodyData() as unknown as IWebhook;
		const receivedSignature = headers['x-line-signature'] as string;
		const channelSecret = credentials.channelSecret as string;

		if (!receivedSignature) {
			throw new NodeOperationError(this.getNode(), 'Missing x-line-signature header');
		}
		if (!channelSecret) {
			throw new NodeOperationError(this.getNode(), 'Missing channel secret in credentials');
		}

		// Verify the signature using raw body to preserve unicode characters
		if (!verifySignature(channelSecret, receivedSignature, req.rawBody)) {
			const res = this.getResponseObject();
			res.status(403).json({ error: 'Invalid signature' });
			return {
				noWebhookResponse: true,
			};
		}

		const desiredEvents = this.getNodeParameter('events', []) as string[];
		let events: IEvent[] = [];

		// Filter events based on user selection
		if (desiredEvents.includes('*')) {
			// If '*' is selected, include all events
			events = bodyData.events;
		} else if (desiredEvents.length > 0) {
			// Otherwise, only include selected event types
			events = bodyData.events.filter((event) => desiredEvents.includes(event.type));
		}

		return {
			workflowData: [this.helpers.returnJsonArray(events)],
		};
	}
}
