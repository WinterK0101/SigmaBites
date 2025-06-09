import axios from "axios";
import {Eatery} from "@/interfaces/interfaces";

const BASE_URL = "https://maps.googleapis.com/maps/api/place"
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export const getNearbyEateries = (lat: number, lng: number): Promise<Eatery[]> => {
    return axios.get(BASE_URL+
        "/nearbysearch/json?" +
        "&location=" + lat + "," + lng +
        "&radius=1500&type=restaurant" +
        "&key="+API_KEY)
    .then((res)=>{
        return res.data.results.map((place: any) => {
            const eatery: Eatery = {
                name: place.name,
                address: place.vicinity || place.formatted_address || '',
                photoUrls: place.photos?.map((photo: any) =>
                    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`
                ) || [],
                rating: place.rating,
                totalRatings: place.user_ratings_total,
                tags: place.types,
                openNow: place.opening_hours?.open_now,
                priceLevel: place.price_level,
                coords: {
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng,
                },
                placeId: place.place_id,
            };
            return eatery;
        });
    })
        .catch((err) => {
            console.error("Failed to fetch nearby places", err);
            throw err;
        });
}