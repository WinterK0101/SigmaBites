export interface Eatery {
    placeId: string;
    displayName: string;
    formattedAddress: string;
    location: {
        latitude: number;
        longitude: number;
    };
    websiteUri: string;
    googleMapsUri: string;
    currentOpeningHours: {
        openNow: boolean;
        weekdayDescriptions: string[];
    }
    types: string[];
    primaryTypeDisplayName: string;
    rating: number;
    userRatingCount: number;
    priceLevel: number;
    photo: string;
    editorialSummary: string;
    generativeSummary: string;
    reviews: Review[];
    internationalPhoneNumber: string;
}

export interface Review {
    id: number;
    author: {
        displayName: string;
        uri: string;
        photoUri: string;
        }
    rating: number;
    text: string;
    relativePublishTimeDescription: string;
}

export interface EateryFilters {
    priceLevels: number[];
    minimumRating: number;
    cuisineTypes: string[];
    radius: number;
    openNowToggle: boolean;
}

export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar_url: string;
    password: string;
    favourite_eateries: string[];
    liked_eateries: string[];
}

export interface LocationData {
    coordinates: {
        latitude: number;
        longitude: number;
    };
    address: string;
    isCurrentLocation: boolean;
}

export interface GroupSession {
    hostID: string;
    filters: string;
    location: string;
    status: 'waiting' | 'active';
}

export interface GroupParticipant {
    memberID: string;
    swipingStatus: 'incomplete' | 'completed';
    joinStatus: 'joined' | 'invited';
    user: User | null;
}