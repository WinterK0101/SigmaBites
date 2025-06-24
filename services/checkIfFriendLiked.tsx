import { Eatery, User } from "@/interfaces/interfaces";
import {fetchUserFriends} from '@/services/friendService';

export async function checkIfFriendLiked(eateryID: string, currentUser: string): Promise<User[]> {
    const mutualLikes: User[] = [];
    const friends: User[] = await fetchUserFriends(currentUser); // await needed

    friends.forEach((friend: User) => {
        if (friend.liked_eateries.includes(eateryID)) {
            mutualLikes.push(friend);
        }
    });

    return mutualLikes;
}
