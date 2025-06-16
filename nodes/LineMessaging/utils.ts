import type { IDataObject } from 'n8n-workflow';

/**
 * Determine file extension from content type
 */
export function getFileExtension(contentType: string): string {
	const mimeTypeMap: { [key: string]: string } = {
		'image/jpeg': '.jpg',
		'image/png': '.png',
		'image/gif': '.gif',
		'video/mp4': '.mp4',
		'audio/mp4': '.m4a',
		'audio/aac': '.aac',
		'application/pdf': '.pdf',
		'application/octet-stream': '.bin',
	};

	return mimeTypeMap[contentType] || '';
}
