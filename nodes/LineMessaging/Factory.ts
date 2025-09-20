import { Action, Message, MessageType } from './Message';
import { IDataObject, NodeOperationError } from 'n8n-workflow';

/**
 * Factory for creating LINE Messaging API compatible message objects
 */
export class MessageFactory {
	/**
	 * Creates a LINE Message object from node parameters
	 */
	static createMessage(params: IDataObject): Message {
		const type = params.type as MessageType;

		switch (type) {
			case MessageType.TextV2:
				return this.createTextV2Message(params);
			default:
				throw new NodeOperationError({} as never, `Unsupported message type: ${type}. Currently only 'textV2' messages are supported.`);
		}
	}

	/**
	 * Creates a TextV2 message
	 */
	private static createTextV2Message(params: IDataObject): Message {
		const message: Message = {
			type: MessageType.TextV2,
			text: params.text as string,
		};

		// Add quote token if provided
		if (params.quoteToken) {
			message.quoteToken = params.quoteToken as string;
		}

		// Add quick replies if provided
		if (params.quickReply && (params.quickReply as IDataObject).items) {
			const items = (params.quickReply as IDataObject).items as IDataObject[];

			if (items && items.length > 0) {
				const quickReplyItems = items.map((item) => {
					const actionType = item.actionType as string;
					let action: Action;

					if (actionType === 'message') {
						action = {
							type: 'message',
							label: item.label as string,
							text: item.data as string,
						};
					} else {
						// Default to postback
						action = {
							type: 'postback',
							label: item.label as string,
							data: item.data as string,
							displayText: item.label as string,
						};
					}

					return {
						type: 'action',
						action,
					} as { type: 'action'; action: Action };
				});

				message.quickReply = {
					items: quickReplyItems,
				};
			}
		}

		return message;
	}
}
