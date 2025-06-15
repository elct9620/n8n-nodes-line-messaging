import * as crypto from 'crypto';

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
