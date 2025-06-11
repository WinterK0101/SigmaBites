import {getCurrentLocation} from "@/services/locationService";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth's radius in kilometers
    const toRadians = (degrees: number) => degrees * Math.PI / 180;

    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

// Remove async since we're not doing any async operations
export function distanceFromUser(userLocation: any, location: any) {
    // Add null checks to prevent errors
    if (!userLocation || !userLocation.coordinates || !location) {
        return 'Distance unavailable';
    }

    const distance = calculateDistance(
        userLocation.coordinates.latitude,
        userLocation.coordinates.longitude,
        location.latitude,
        location.longitude
    );
    return `${distance.toFixed(2)} km`;
}

export function getOpeningHoursForToday(eatery: any) {
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;

    const weekdayDescriptions = eatery?.currentOpeningHours?.weekdayDescriptions;

    if (!weekdayDescriptions || !Array.isArray(weekdayDescriptions) || weekdayDescriptions.length < 7) {
        return 'Hours unavailable';
    }

    const todaysDescription = weekdayDescriptions[dayIndex];
    if (!todaysDescription) {
        return 'Hours unavailable';
    }

    // Removes the mention of the current day
    const timePart = todaysDescription.split(': ')[1];
    return timePart || 'Hours unavailable';
}