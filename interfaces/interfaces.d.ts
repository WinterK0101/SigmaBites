export interface Eatery {
    id: string;
    name: string;
    primaryCuisine: string;
    rating?: number;
    totalRatings?: number;
    priceLevel?: number;
    distance: number;
    isOpen?: boolean;
    todayHours?: string;
    photoReferences: string[];
    coords: {
        lat: number;
        lng: number;
    };
    placeId: string;
}

export interface EateryDetails extends Eatery {
    address: string;
    phoneNumber?: string;
    website?: string;
    allHours?: string[];
    editorialSummary?: string;
    reviews?: Review[];
    googleMapsUri: string;
}

export interface Review {
    authorName: string;
    rating: number;
    text: string;
    relativeTime: string;
    authorUrl?: string;
    profilePhotoUrl?: string;
}

export interface EateryFilters {
    priceLevels: number[];
    minimumRating: number;
    cuisineTypes: string[];
    radius: number;
    openNowToggle: boolean;
}

