import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  IDataObject,
  IBinaryData,
  JsonObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { apiDataRequest } from '../GenericFunctions';
import { getFileExtension } from '../utils';

export const properties: INodeProperties[] = [
  {
    displayName: 'Message ID',
    name: 'messageId',
    type: 'string',
    default: '',
    required: true,
    placeholder: '1234567890',
    description: 'The ID of the message to retrieve content from',
  },
  {
    displayName: 'Binary Property',
    name: 'binaryPropertyName',
    type: 'string',
    default: 'data',
    required: true,
    description: 'The binary property to which to write the data to',
  },
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    options: [
      {
        displayName: 'Check Transcoding Status',
        name: 'checkTranscoding',
        type: 'boolean',
        default: false,
        description:
          'Whether to check if content is ready before retrieving (useful for large files)',
      },
      {
        displayName: 'Retry Count',
        name: 'retryCount',
        type: 'number',
        default: 3,
        description: 'How many times to retry if content is still processing',
      },
      {
        displayName: 'Retry Interval (Seconds)',
        name: 'retryInterval',
        type: 'number',
        default: 3,
        description: 'How long to wait between retries in seconds',
      },
    ],
  },
];

export const description = properties;

export async function execute(this: IExecuteFunctions, items: INodeExecutionData[]) {
  const returnData: INodeExecutionData[] = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const messageId = this.getNodeParameter('messageId', i) as string;
      const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
      const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;

      // Check if we should check transcoding status first
      if (additionalOptions.checkTranscoding === true) {
        const retryCount = (additionalOptions.retryCount as number) || 3;
        const retryInterval = ((additionalOptions.retryInterval as number) || 3) * 1000;

        let transcodingStatus: string = 'processing';
        let currentRetry = 0;

        while (transcodingStatus === 'processing' && currentRetry < retryCount) {
          // Check transcoding status
          const response = await apiDataRequest.call(
            this,
            'GET',
            `/message/${messageId}/content/transcoding`,
            {},
          );

          transcodingStatus = response.status as string;

          if (transcodingStatus === 'processing') {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
            currentRetry++;
          } else if (transcodingStatus === 'failed') {
            throw new NodeOperationError(this.getNode(), 'Content transcoding failed');
          }
        }

        if (transcodingStatus === 'processing') {
          throw new NodeOperationError(
            this.getNode(),
            'Content is still processing after maximum retries',
          );
        }
      }

      // Request content using apiDataRequest with custom options for binary data
      const response = await apiDataRequest.call(
        this,
        'GET',
        `/message/${messageId}/content`,
        {},
        {},
        {
          encoding: null, // Important: This ensures the body is a Buffer
          json: false,
          resolveWithFullResponse: true,
        },
      );

      const contentType = response.headers['content-type'];
      const fileExtension = getFileExtension(contentType);
      const fileName = `line_content_${messageId}${fileExtension}`;

      // Create binary data
      const binaryData: IBinaryData = {
        data: Buffer.from(response.body).toString('base64'),
        mimeType: contentType,
        fileName,
      };

      // Add binary data to the item
      const newItem: INodeExecutionData = {
        json: {
          messageId,
          success: true,
          contentType,
        },
        binary: {
          [binaryPropertyName]: binaryData,
        },
        pairedItem: {
          item: i,
        },
      };

      returnData.push(newItem);
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({
          json: {
            success: false,
            error: (error as JsonObject).message,
          },
          pairedItem: {
            item: i,
          },
        });
        continue;
      }
      throw error;
    }
  }

  return returnData;
}
