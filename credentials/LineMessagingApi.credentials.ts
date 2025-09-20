import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

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

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{`Bearer ${$credentials.accessToken}`}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			baseURL: 'https://api.line.me/v2/bot',
			url: '/info',
			json: true,
		},
	};
}
