import {Eatery, EateryFilters, Review} from "@/interfaces/interfaces";

const BASE_URL = "https://maps.googleapis.com/maps/api/places"
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

async function getNearbyEateries(lat: number, lng: number, filters: EateryFilters) {
    console.log('Starting API call with:', { lat, lng, filters }); // Debug log

    const requestBody = {
        includedTypes: ["restaurant", "cafeteria", "cafe", "bar", "meal_takeaway", "bakery"],
        excludedTypes: ["gas_station"],
        locationRestriction: {
            circle: {
                center: {
                    latitude: lat,
                    longitude: lng,
                },
                radius: filters.radius
            }
        },
        rankPreference: "POPULARITY"
    };

    const fieldMask = [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.location',
        'places.googleMapsUri',
        'places.currentOpeningHours',
        'places.types',
        'places.primaryTypeDisplayName',
        'places.rating',
        'places.userRatingCount',
        'places.reviews',
        'places.priceLevel',
        'places.photos',
        'places.internationalPhoneNumber',
        'places.websiteUri',
        'places.editorialSummary',
        'places.generativeSummary',
    ].join(',');

    try {
        console.log('Making API request...'); // Debug log

        const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': fieldMask
            } as HeadersInit,
            body: JSON.stringify(requestBody),
        });

        console.log('Response status:', response.status); // Debug log

        const data = await response.json();
        console.log('Raw API response:', data); // Debug log

        let places = data.places || []
        console.log('Number of places found:', places.length); // Debug log

        const eateries = places.map((place: any) => createEatery(place));
        console.log('Processed eateries:', eateries.length); // Debug log

        return eateries;
    } catch (error) {
        console.error('Error searching eateries:', error);
        throw error;
    }
}

const createEatery = (place: any) => {
    console.log('Processing place:', place.displayName); // Debug log

    const eatery: Eatery = {
        placeId: place.id || '',
        displayName: place.displayName?.text || 'Unknown',
        formattedAddress: place.formattedAddress || '',
        location: {
            latitude: place.location?.latitude || 0,
            longitude: place.location?.longitude || 0,
        },
        websiteUri: place.websiteUri || '',
        googleMapsUri: place.googleMapsUri || '',
        currentOpeningHours: {
            openNow: place.currentOpeningHours?.openNow || false,
            weekdayDescriptions: place.currentOpeningHours?.weekdayDescriptions || [],
        },
        types: place.types || [],
        primaryTypeDisplayName: place.primaryTypeDisplayName?.text || '',
        rating: place.rating || 0,
        userRatingCount: place.userRatingCount || 0,
        priceLevel: priceLevelMap[place.priceLevel as keyof typeof priceLevelMap] || 0,
        photo: obtainEateryPhoto(place.photos),
        editorialSummary: place.editorialSummary?.text || '',
        generativeSummary: place.generativeSummary?.overview?.text || '',
        reviews: getReviews(place.reviews || []),
        internationalPhoneNumber: place.internationalPhoneNumber || '',
    };
    return eatery;
}

// Helpers for properties
const priceLevelMap = {
    'PRICE_LEVEL_INEXPENSIVE': 1,
    'PRICE_LEVEL_MODERATE': 2,
    'PRICE_LEVEL_EXPENSIVE': 3,
    'PRICE_LEVEL_VERY_EXPENSIVE': 4
};

const obtainEateryPhoto = (photosArr: any) => {
    if (!photosArr || !Array.isArray(photosArr) || photosArr.length === 0) {
        return "fallback-image.jpg";
    }
    let firstPhoto = photosArr[1];
    if (!firstPhoto) {
        firstPhoto = photosArr[0];
    }
    if (firstPhoto?.name) {
        const photoUrl = `https://places.googleapis.com/v1/${firstPhoto.name}/media?maxWidthPx=400&key=${API_KEY}`;
        console.log('Generated photo URL:', photoUrl); // Debug log
        return photoUrl;
    }

    return "fallback-image.jpg";
}

const getReviews = (reviewArr: any[]) => {
    if (!Array.isArray(reviewArr)) {
        return [];
    }

    const reviews = reviewArr.map((apiReview: any) => {
        const review: Review = {
            author: {
                displayName: apiReview.authorAttribution?.displayName || 'Anonymous',
                uri: apiReview.authorAttribution?.uri || '',
                photoUri: apiReview.authorAttribution?.photoUri || '',
            },
            rating: apiReview.rating || 0,
            text: apiReview.text?.text || '',
            relativePublishTimeDescription: apiReview.relativePublishTimeDescription || '',
        };
        return review;
    });
    return reviews;
}

export { getNearbyEateries };