import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';

/**
 * Makes an API request to the Line Messaging Data API
 *
 * @param {IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions} this The context
 * @param {IHttpRequestMethods} method The HTTP method
 * @param {string} endpoint The endpoint to call
 * @param {IDataObject} body The request body
 * @param {IDataObject} [query] The query parameters
 * @param {IDataObject} [option] Additional options for the request
 * @returns {Promise<any>} The response data
 */
export async function apiDataRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject,
	query?: IDataObject,
	option: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('lineMessagingApi');
	const channelAccessToken = credentials.accessToken as string;

	const options = {
		method,
		headers: {
			Authorization: `Bearer ${channelAccessToken}`,
		},
		body,
		url: `https://api-data.line.me/v2/bot${endpoint}`,
		qs: query,
		json: true,
		...option,
	};

	return this.helpers.request(options);
}
