import * as crypto from 'crypto';
import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IN8nHttpFullResponse,
	IN8nHttpResponse,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

enum LineApiType {
	MESSAGING = 'messaging',
	DATA = 'data',
}

/**
 * Extracts HTTP status code from error object
 */
function getHttpStatusCode(error: unknown): number | undefined {
	if (!error || typeof error !== 'object') {
		return undefined;
	}

	if ('statusCode' in error && typeof error.statusCode === 'number') {
		return error.statusCode;
	}
	if ('status' in error && typeof error.status === 'number') {
		return error.status;
	}
	if ('httpCode' in error && typeof error.httpCode === 'number') {
		return error.httpCode;
	}
	return undefined;
}

/**
 * Creates user-friendly error message based on HTTP status code
 */
function createHttpErrorMessage(
	statusCode: number,
	error: unknown,
	apiType: LineApiType = LineApiType.MESSAGING,
): string {
	const apiName = apiType === LineApiType.DATA ? 'LINE Data API' : 'LINE API';

	switch (statusCode) {
		case 401:
			return 'Invalid Channel Access Token. Please check your LINE credentials.';
		case 403:
			return 'Access denied. Please verify your LINE channel permissions.';
		case 404:
			return apiType === LineApiType.DATA
				? 'Content not found. The message content may have expired or been deleted.'
				: 'Resource not found. The user or content may not exist.';
		case 429:
			return apiType === LineApiType.DATA
				? 'Rate limit exceeded. Please wait before making more requests.'
				: 'Rate limit exceeded. Please wait before sending more messages.';
		case 500:
			return `${apiName} is temporarily unavailable. Please try again.`;
		default: {
			const message =
				error &&
				typeof error === 'object' &&
				'message' in error &&
				typeof error.message === 'string'
					? error.message
					: 'Unknown error';
			return `${apiName} error (${statusCode}): ${message}`;
		}
	}
}

/**
 * Verifies the Line Message API signature
 *
 * @param {string} channelSecret The channel secret from Line credentials
 * @param {string} signature The signature received from Line in the x-line-signature header
 * @param {Buffer | string} body The raw request body to verify
 * @returns {boolean} Whether the signature is valid
 */
export function verifySignature(
	channelSecret: string,
	signature: string,
	body: Buffer | string,
): boolean {
	// Create hmac using sha256
	const hmac = crypto.createHmac('sha256', channelSecret);

	// Update with raw body (Buffer or string both work)
	hmac.update(body);

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
): Promise<IDataObject> {
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

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'lineMessagingApi', options);
	} catch (error: unknown) {
		const statusCode = getHttpStatusCode(error);
		let errorMessage: string;

		if (statusCode) {
			errorMessage = createHttpErrorMessage(statusCode, error, LineApiType.MESSAGING);
		} else if (
			error &&
			typeof error === 'object' &&
			'message' in error &&
			typeof error.message === 'string'
		) {
			errorMessage = `LINE API error: ${error.message}`;
		} else {
			errorMessage = 'LINE API request failed';
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, { message: errorMessage });
	}
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
): Promise<IN8nHttpFullResponse | IN8nHttpResponse> {
	const options = {
		method,
		body,
		url: `https://api-data.line.me/v2/bot${endpoint}`,
		qs: query,
		json: true,
		...option,
	};

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'lineMessagingApi', options);
	} catch (error: unknown) {
		const statusCode = getHttpStatusCode(error);
		let errorMessage: string;

		if (statusCode) {
			errorMessage = createHttpErrorMessage(statusCode, error, LineApiType.DATA);
		} else if (
			error &&
			typeof error === 'object' &&
			'message' in error &&
			typeof error.message === 'string'
		) {
			errorMessage = `LINE Data API error: ${error.message}`;
		} else {
			errorMessage = 'LINE Data API request failed';
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, { message: errorMessage });
	}
}
