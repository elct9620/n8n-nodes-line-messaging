import { Action, ActionType, Message, MessageType, QuickReply, QuickReplyItemType } from './Message';
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
			case MessageType.Flex:
				return this.createFlexMessage(params);
			default:
				throw new NodeOperationError(
					{} as never,
					`Unsupported message type: ${type}. Currently only 'textV2' and 'flex' messages are supported.`,
				);
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
		const quickReply = this.processQuickReply(params);
		if (quickReply) {
			message.quickReply = quickReply;
		}

		return message;
	}

	/**
	 * Creates a Flex message
	 */
	private static createFlexMessage(params: IDataObject): Message {
		const altText = params.altText as string;
		const flexJson = params.flexJson as string;

		// Validate altText is provided
		if (!altText || altText.trim() === '') {
			throw new NodeOperationError(
				{} as never,
				'Alt Text is required for Flex messages. Please provide alternative text for notifications.',
			);
		}

		// Parse Flex message JSON
		let contents: unknown;
		try {
			contents = JSON.parse(flexJson);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			throw new NodeOperationError(
				{} as never,
				`Invalid Flex Message JSON: ${errorMessage}. Please ensure your JSON is valid.`,
			);
		}

		const message: Message = {
			type: MessageType.Flex,
			altText,
			contents,
		};

		// Add quick replies if provided
		const quickReply = this.processQuickReply(params);
		if (quickReply) {
			message.quickReply = quickReply;
		}

		return message;
	}

	/**
	 * Processes quick reply parameters and returns QuickReply object if valid
	 */
	private static processQuickReply(params: IDataObject): QuickReply | undefined {
		if (!params.quickReply || !(params.quickReply as IDataObject).items) {
			return undefined;
		}

		const items = (params.quickReply as IDataObject).items as IDataObject[];

		if (!items || items.length === 0) {
			return undefined;
		}

		const quickReplyItems = items.map((item) => {
			const actionType = item.actionType as string;
			let action: Action;

			if (actionType === ActionType.Postback) {
				action = {
					type: ActionType.Postback,
					label: item.label as string,
					data: item.data as string,
					displayText: item.label as string,
				};
			} else {
				// Default to message
				action = {
					type: ActionType.Message,
					label: item.label as string,
					text: item.data as string,
				};
			}

			return {
				type: QuickReplyItemType.Action,
				action,
			} as { type: QuickReplyItemType.Action; action: Action };
		});

		return {
			items: quickReplyItems,
		};
	}
}
