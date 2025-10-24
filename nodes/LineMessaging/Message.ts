export enum MessageType {
	TextV2 = 'textV2',
	Flex = 'flex',
}

export enum QuickReplyItemType {
	Action = 'action',
}

export enum ActionType {
	Message = 'message',
	Postback = 'postback',
}

type MessageAction = {
	type: ActionType.Message;
	label: string;
	text: string;
};

type PostbackAction = {
	type: ActionType.Postback;
	label: string;
	data: string;
	displayText?: string;
};

export type Action = MessageAction | PostbackAction;

export type QuickReply = {
	items: Array<{
		type: QuickReplyItemType.Action;
		action: Action;
	}>;
};

type CommonMessage = {
	type: MessageType;
	quickReply?: QuickReply;
};

type TextV2 = {
	type: MessageType.TextV2;
	text: string;
	quoteToken?: string;
};

type FlexMessage = {
	type: MessageType.Flex;
	altText: string;
	contents: unknown;
};

export type Message = (CommonMessage & TextV2) | (CommonMessage & FlexMessage);
