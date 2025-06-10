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
    primaryType: string;
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

