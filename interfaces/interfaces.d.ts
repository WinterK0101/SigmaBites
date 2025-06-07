export interface Eatery {
    name: string;
    address: string;
    photoUrls?: string;
    rating?: number;
    totalRatings?: number;
    tags?: string[]; // Derived from 'types'
    openNow?: boolean;
    priceLevel?: number; // 0 to 4
    coords: {
        lat: number;
        lng: number;
    };
    placeId: string;
    phoneNumber?: string;
    website?: string;
    openingHoursText?: string[];
}