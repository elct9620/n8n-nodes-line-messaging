export enum MessageType {
	TextV2 = 'textV2',
}

type TextV2 = {
	type: MessageType.TextV2;
	text: string;
	quoteToken?: string;
};

export type Message = TextV2;
