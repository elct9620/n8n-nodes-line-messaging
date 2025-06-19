type DeliveryContext = {
	isRedelivery: boolean;
};

type SourceUser = {
	type: 'user';
	userId: string;
};

type SourceGroup = {
	type: 'group';
	groupId: string;
	userId?: string; // Optional, only present if the event is from a user in a group
};

type SourceRoom = {
	type: 'room';
	roomId: string;
	userId?: string; // Optional, only present if the event is from a user in a room
};

type Source = SourceUser | SourceGroup | SourceRoom;
type CommonProperties = {
	type: string;
	mode: 'active' | 'standby';
	replyToken?: string;
	timestamp: number;
	source?: Source;
	webhookEventId: string;
	deliveryContext: DeliveryContext;
};

type EventMode =
	| {
			mode: 'active';
			replyToken: string;
	  }
	| {
			mode: 'standby';
			replyToken?: undefined;
	  };

type Emoji = {
	index: number;
	length: number;
	productId: string;
	emojiId: string;
};

type Mentionee = {
	index: number;
	length: number;
	type: 'user' | 'bot';
	userId?: string; // Only present if type is 'user'
	isSelf?: boolean; // Only present if type is 'bot'
	quotedMessageId?: string; // Only present if type is 'bot'
};

type Mention = {
	mentionees: Mentionee[];
};

type ContentProvider = {
	type: 'line' | 'external';
	originalContentUrl?: string; // Only present if type is 'external'
	previewImageUrl?: string; // Only present if type is 'external'
};

type TextMessage = {
	id: string;
	type: 'text';
	quoteToken: string;
	text: string;
	emojis?: Array<Emoji>;
	mention?: Mention;
};

type ImageMessage = {
	id: string;
	type: 'image';
	quoteToken: string;
	contentProvider: ContentProvider;
	imageSet?: {
		id: string;
		index: number;
		total: number;
	};
};

type VideoMessage = {
	id: string;
	type: 'video';
	quoteToken: string;
	duration: number;
	contentProvider: ContentProvider;
};

type AudioMessage = {
	id: string;
	type: 'audio';
	quoteToken: string;
	duration: number;
	contentProvider: ContentProvider;
};

type FileMessage = {
	id: string;
	type: 'file';
	fileName: string;
	fileSize: number;
};

type LocationMessage = {
	id: string;
	type: 'location';
	title?: string;
	address?: string;
	latitude: number;
	longitude: number;
};

type MessageEvent = {
	type: EventType.Message;
	replyToken: string;
	message: TextMessage | ImageMessage | VideoMessage | AudioMessage | FileMessage | LocationMessage;
};

type UnsendEvent = {
	type: EventType.Unsend;
	unsend: {
		messageId: string;
	};
};

type FollowEvent = {
	type: EventType.Follow;
	replyToken: string;
	follow: {
		isUnblocked: boolean;
	};
};

type UnfollowEvent = {
	type: EventType.Unfollow;
};

type JoinEvent = {
	type: EventType.Join;
	replyToken: string;
};

type LeaveEvent = {
	type: EventType.Leave;
};

type MemberJoinedEvent = {
	type: EventType.MemberJoined;
	replyToken: string;
	joined: {
		members: Array<SourceUser>;
	};
};

type MemberLeftEvent = {
	type: EventType.MemberLeft;
	left: {
		members: Array<SourceUser>;
	};
};

type PostbackDateTime =
	| {
			date: string; // ISO 8601 format
	  }
	| {
			time: string; // ISO 8601 format
	  }
	| {
			dateTime: string; // ISO 8601 format
	  };

type PostbackRichMenu = {
	newRichMenuAliasId?: string; // Optional, only present if a new rich menu alias is set
	status: 'SUCCESS' | 'RICHMENU_ALIAS_ID_NOTFOUND' | 'RICHMENU_NOTFOUND' | 'FAILED';
};

type Postback = {
	data: string;
	params?: PostbackDateTime | PostbackRichMenu;
};

type PostbackEvent = {
	type: EventType.Postback;
	replyToken: string;
	postback: Postback;
};

type VideoPlayCompleteEvent = {
	type: EventType.VideoPlayComplete;
	replyToken: string;
	videoPlayComplete: {
		trackingId: string;
	};
};

type BeaconEvent = {
	type: EventType.Beacon;
	replyToken: string;
	beacon: {
		hwid: string; // Hardware ID
		type: 'enter' | 'stay' | 'leave'; // Type of beacon event
		dm?: string; // Optional, only present if a direct message is sent
	};
};

type AccountLinkEvent = {
	type: EventType.AccountLink;
	replyToken: string;
	link: {
		result: 'ok' | 'failed'; // Result of the account link
		nonce: string; // Unique nonce for the link event
	};
};

type MembershipEvent = {
	type: EventType.Membership;
	replyToken: string;
	membership: {
		type: 'joined' | 'left' | 'renewed'; // Type of membership event
		membershipId: string; // Unique ID for the membership
	};
};

export enum EventType {
	Message = 'message',
	Unsend = 'unsend',
	Follow = 'follow',
	Unfollow = 'unfollow',
	Join = 'join',
	Leave = 'leave',
	MemberJoined = 'memberJoined',
	MemberLeft = 'memberLeft',
	Postback = 'postback',
	VideoPlayComplete = 'videoPlayComplete',
	Beacon = 'beacon',
	AccountLink = 'accountLink',
	Membership = 'membership',
}

type EventBody =
	| MessageEvent
	| UnsendEvent
	| FollowEvent
	| UnfollowEvent
	| JoinEvent
	| LeaveEvent
	| MemberJoinedEvent
	| MemberLeftEvent
	| PostbackEvent
	| VideoPlayCompleteEvent
	| BeaconEvent
	| AccountLinkEvent
	| MembershipEvent;
export type IEvent = CommonProperties & EventMode & EventBody;

export interface IWebhook {
	destination: string;
	events: IEvent[];
}
