import { supabase } from '@/SupabaseConfig';
import { completeSwiping, getWaitingStatus, updateSwipingSessionStatus } from "@/services/groupSwiping";

export const handleEateryLikedService = async (likedEatery, userId) => {
    console.log('Liked:', likedEatery.displayName);

    if (!likedEatery?.placeId) {
        console.warn('No placeId found for liked eatery');
        return;
    }

    try {
        // Check if eatery exists and get user data in parallel
        const [eateryCheck, userData] = await Promise.all([
            supabase
                .from('Eatery')
                .select('placeId')
                .eq('placeId', likedEatery.placeId)
                .single(),
            supabase.auth.getUser()
        ]);

        const operations = [];

        // Add eatery insert operation if needed
        if (eateryCheck.error?.code === 'PGRST116') { // No rows found
            operations.push(
                supabase
                    .from('Eatery')
                    .insert([{
                        placeId: likedEatery.placeId ?? null,
                        displayName: likedEatery.displayName ?? null,
                        formattedAddress: likedEatery.formattedAddress ?? null,
                        location: likedEatery.location ?? null,
                        websiteUri: likedEatery.websiteUri ?? null,
                        googleMapsUri: likedEatery.googleMapsUri ?? null,
                        currentOpeningHours: likedEatery.currentOpeningHours ?? null,
                        types: likedEatery.types ?? null,
                        primaryTypeDisplayName: likedEatery.primaryTypeDisplayName ?? null,
                        rating: likedEatery.rating ?? null,
                        userRatingCount: likedEatery.userRatingCount ?? null,
                        priceLevel: likedEatery.priceLevel ?? null,
                        photo: likedEatery.photo ?? null,
                        editorialSummary: likedEatery.editorialSummary ?? null,
                        generativeSummary: likedEatery.generativeSummary ?? null,
                        internationalPhoneNumber: likedEatery.internationalPhoneNumber ?? null,
                    }])
            );
        }

        // Handle user profile update if user data is available
        if (userData?.data?.user?.id) {
            const currentUserId = userData.data.user.id;
            operations.push(
                supabase
                    .from('profiles')
                    .select('liked_eateries')
                    .eq('id', currentUserId)
                    .single()
                    .then(({ data: profileData, error: profileError }) => {
                        if (!profileError) {
                            let likedEateriesArr = Array.isArray(profileData?.liked_eateries)
                                ? profileData.liked_eateries
                                : [];

                            if (!likedEateriesArr.includes(likedEatery.placeId)) {
                                likedEateriesArr = [...likedEateriesArr, likedEatery.placeId];
                                return supabase
                                    .from('profiles')
                                    .update({ liked_eateries: likedEateriesArr })
                                    .eq('id', currentUserId);
                            }
                        }
                        return Promise.resolve();
                    })
            );
        }

        // Handle reviews insert
        if (Array.isArray(likedEatery.reviews) && likedEatery.reviews.length > 0) {
            const reviewsToInsert = likedEatery.reviews.map(review => {
                let authorObj = review.author;
                if (typeof authorObj !== 'object' || authorObj === null) {
                    authorObj = {
                        displayName: typeof review.author === 'string' ? review.author : '',
                        uri: '',
                        photoUri: ''
                    };
                }
                return {
                    author: authorObj,
                    rating: review.rating ?? null,
                    text: review.text ?? null,
                    relativePublishTimeDescription: review.relativePublishTimeDescription ?? null,
                    placeId: likedEatery.placeId,
                };
            });

            operations.push(
                supabase
                    .from('review')
                    .insert(reviewsToInsert)
            );
        }

        await Promise.allSettled(operations);

    } catch (error) {
        console.error('Error in handleEateryLikedService:', error);
        throw error;
    }
};

export const handleSwipeCompletionService = async ({
                                                       swipingMode,
                                                       lastSwipeWasRight,
                                                       groupID,
                                                       currentUserId,
                                                       eateries,
                                                       router,
                                                       handleSoloModeNavigation
                                                   }) => {
    try {
        if (swipingMode === 'solo') {
            if (!lastSwipeWasRight) {
                router.replace('/(modals)/NoMatches');
            } else {
                const lastEatery = eateries[eateries.length - 1];
                await handleSoloModeNavigation(lastEatery);
            }
        } else if (swipingMode === 'group') {
            if (!groupID) {
                console.error('No group ID available');
                return;
            }

            // Mark current user's swiping as completed
            await completeSwiping(groupID, currentUserId);

            // Check if all participants have completed swiping
            const waitingStatus = await getWaitingStatus(groupID);

            if (waitingStatus.everyoneReady) {
                // Update session status before navigation
                await updateSwipingSessionStatus(groupID, 'completed');

                // Navigate to results immediately
                router.replace({
                    pathname: '/groupSwiping/GroupResults',
                    params: { groupID },
                });
            } else {
                // Still waiting for others, go to waiting screen
                router.replace({
                    pathname: '/groupSwiping/Waiting',
                    params: { groupID }
                });
            }
        }
    } catch (error) {
        console.error('Error in handleSwipeCompletionService:', error);
        throw error;
    }
};

export const handleEndSessionService = async ({
                                                  swipingMode,
                                                  groupID,
                                                  currentUserId,
                                                  router
                                              }) => {
    try {
        if (swipingMode === 'solo') {
            router.replace('/(tabs)/Discover');
        } else if (swipingMode === 'group') {
            if (!groupID) {
                console.error('No group ID available');
                return;
            }

            await completeSwiping(groupID, currentUserId);
            const waitingStatus = await getWaitingStatus(groupID);

            if (waitingStatus.everyoneReady) {
                await updateSwipingSessionStatus(groupID, 'completed');
                router.replace({
                    pathname: '/groupSwiping/GroupResults',
                    params: { groupID },
                });
            } else {
                router.replace({
                    pathname: '/groupSwiping/Waiting',
                    params: { groupID }
                });
            }
        }
    } catch (error) {
        console.error('Error in handleEndSessionService:', error);
        throw error;
    }
};

export const initializeEateriesService = async ({
                                                    swipingMode,
                                                    groupID,
                                                    useDummyData,
                                                    eateriesParam,
                                                    dummyEateries
                                                }) => {
    // For group mode, check the group setting first
    if (swipingMode === 'group' && groupID) {
        try {
            const { data: groupSession } = await supabase
                .from('group_sessions')
                .select('useDummyData')
                .eq('group_id', groupID)
                .single();

            if (groupSession?.useDummyData) {
                return dummyEateries; // Everyone uses dummy data
            }
            // If not using dummy data, fall through to parse eateriesParam
        } catch (error) {
            console.error('Failed to fetch group settings:', error);
        }
    }

    // Original logic for parsing actual eateries (solo mode or group mode with real data)
    let sourceEateries = dummyEateries;
    if (useDummyData !== 'true' && eateriesParam) {
        try {
            sourceEateries = JSON.parse(eateriesParam);
        } catch (error) {
            console.error('Failed to parse eateries:', error);
            sourceEateries = dummyEateries;
        }
    }
    return sourceEateries;
};

