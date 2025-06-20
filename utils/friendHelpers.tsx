import { FRIEND_STATUS } from '@/constants/friendStatus';
import { StyleSheet } from 'react-native';

export const getFriendButtonText = (status) => {
    switch (status) {
        case FRIEND_STATUS.NOT_FRIENDS:
            return 'Add Friend';
        case FRIEND_STATUS.REQUEST_SENT:
            return 'Requested';
        case FRIEND_STATUS.REQUEST_RECEIVED:
            return 'Accept Request';
        case FRIEND_STATUS.FRIENDS:
            return 'Friends';
        default:
            return 'Add Friend';
    }
};

export const getFriendButtonStyle = (status, styles) => {
    switch (status) {
        case FRIEND_STATUS.REQUEST_SENT:
            return [styles.friendButton, styles.requestedButton];
        case FRIEND_STATUS.FRIENDS:
            return [styles.friendButton, styles.friendsButton];
        default:
            return styles.friendButton;
    }
};

export const getFriendButtonTextStyle = (status, styles) => {
    switch (status) {
        case FRIEND_STATUS.REQUEST_SENT:
            return [styles.friendButtonText, styles.requestedButtonText];
        case FRIEND_STATUS.FRIENDS:
            return [styles.friendButtonText, styles.friendsButtonText];
        default:
            return styles.friendButtonText;
    }
};
