export const FRIEND_STATUS = {
    NOT_FRIENDS: 'not_friends',
    REQUEST_SENT: 'request_sent',
    REQUEST_RECEIVED: 'request_received',
    FRIENDS: 'friends',
} as const;

export type FriendStatus = typeof FRIEND_STATUS[keyof typeof FRIEND_STATUS];