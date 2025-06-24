import {Eatery, EateryFilters} from "@/interfaces/interfaces";

export const filterEateries = (eateries: Eatery[], filters: EateryFilters): Eatery[] => {
    const filteredEateries = eateries.filter(eatery => {
        // Filter by price level
        if (!filters.priceLevels.includes(eatery.priceLevel)) {
            return false;
        }

        // Filter by minimum rating
        if (eatery.rating < filters.minimumRating) {
            return false;
        }

        // Filter by open now toggle
        if (filters.openNowToggle && !eatery.currentOpeningHours.openNow) {
            return false;
        }

        return true;
    });
    const sortedCuisines = sortEateriesByCuisine(filteredEateries, filters.cuisineTypes);
    return sortedCuisines;
};


const sortEateriesByCuisine = (eateries: Eatery[], cuisineTypes: string[]): Eatery[] => {
    // If 'All' is selected, return original order
    if (cuisineTypes.includes('All')) {
        return eateries;
    }

    // Map cuisine types to Google Places API types
    const cuisineTypeMap: { [key: string]: string[] } = {
        'Japanese': ['japanese_restaurant', 'sushi_restaurant'],
        'Korean': ['korean_restaurant'],
        'Chinese': ['chinese_restaurant'],
        'Indian': ['indian_restaurant'],
        'Thai': ['thai_restaurant'],
        'American': ['american_restaurant', 'hamburger_restaurant', 'pizza_restaurant'],
        'Asian': ['asian_restaurant', 'vietnamese_restaurant', 'filipino_restaurant']
    };

    const matching: Eatery[] = [];
    const nonMatching: Eatery[] = [];

    eateries.forEach(eatery => {
        const matches = cuisineTypes.some(selectedCuisine => {
            const apiTypes = cuisineTypeMap[selectedCuisine] || [];
            return apiTypes.some(apiType => eatery.types.includes(apiType));
        });

        if (matches) {
            matching.push(eatery);
        } else {
            nonMatching.push(eatery);
        }
    });

    // Put matching cuisines first, then non-matching
    return [...matching, ...nonMatching];
};
