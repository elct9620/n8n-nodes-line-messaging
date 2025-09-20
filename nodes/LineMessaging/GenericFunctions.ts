import * as crypto from 'crypto';
import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';

/**
 * Verifies the Line Message API signature
 *
 * @param {string} channelSecret The channel secret from Line credentials
 * @param {string} signature The signature received from Line in the x-line-signature header
 * @param {object} body The request body to verify
 * @returns {boolean} Whether the signature is valid
 */
export function verifySignature(channelSecret: string, signature: string, body: object): boolean {
	const bodyString = JSON.stringify(body);

	// Create hmac using sha256
	const hmac = crypto.createHmac('sha256', channelSecret);
	hmac.update(bodyString);
	const calculatedSignature = hmac.digest('base64');

	// Compare the calculated signature with the received one
	return signature === calculatedSignature;
}

/**
 * Makes an API request to the Line Messaging API
 *
 * @param {IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions} this The context
 * @param {IHttpRequestMethods} method The HTTP method
 * @param {string} endpoint The endpoint to call
 * @param {IDataObject} body The request body
 * @param {IDataObject} [query] The query parameters
 * @param {IDataObject} [option] Additional options for the request
 * @returns {Promise<any>} The response data
 */
export async function apiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject,
	query?: IDataObject,
	option: IDataObject = {},
): Promise<any> {
	const options = {
		method,
		headers: {
			'Content-Type': 'application/json',
		},
		body,
		url: `https://api.line.me/v2/bot${endpoint}`,
		qs: query,
		json: true,
		...option,
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'lineMessagingApi', options);
}

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
	const options = {
		method,
		body,
		url: `https://api-data.line.me/v2/bot${endpoint}`,
		qs: query,
		json: true,
		...option,
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'lineMessagingApi', options);
}
