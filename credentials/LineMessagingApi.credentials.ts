import type { ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class LineMessagingApi implements ICredentialType {
	name = 'lineMessagingApi';

	displayName = 'Line Messaging API';

	documentationUrl = 'https://developers.line.biz/en/docs/messaging-api/overview/';

	properties: INodeProperties[] = [
		{
			displayName: 'Channel Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'The Channel Access Token for the Line Messaging API. You can obtain it from the Line Developers Console.',
		},
		{
			displayName: 'Channel Secret',
			name: 'channelSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'The Channel Secret for the Line Messaging API. You can obtain it from the Line Developers Console.',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.line.me/oauth2/v2.1',
			url: '/verify',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: {
				access_token: '={{$credentials.accessToken}}',
			},
			json: true,
		},
	};
}
