export enum MessageType {
	TextV2 = 'textV2',
	Flex = 'flex',
}

type MessageAction = {
	type: 'message';
	label: string;
	text: string;
};

type PostbackAction = {
	type: 'postback';
	label: string;
	data: string;
	displayText?: string;
};

export type Action = MessageAction | PostbackAction;

export type QuickReply = {
	items: Array<{
		type: 'action';
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
