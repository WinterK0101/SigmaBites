import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import {useSession} from "@/context/SessionContext";
import {Eatery, User} from "@/interfaces/interfaces";
import RemoteImage from "@/components/RemoteImage";
import {images} from "@/constants/images";
import {fetchUserByID} from "@/services/userService";

export default function LikedConfirmation() {
    const router = useRouter();
    const { eatery: eateryParam } = useLocalSearchParams();
    const [eatery, setEatery] = useState<Eatery>();
    const [currentUser, setCurrentUser] = useState<User | null>();
    const [loading, setLoading] = useState(false);

    const user = useSession()?.user
    if (!user) {
        return;
    }

    useEffect(() => {
        async function fetchData() {
            if (eateryParam) {
                try {
                    const parsedEatery = JSON.parse(eateryParam);
                    const userData = await fetchUserByID(user.id);
                    setCurrentUser(userData);
                    setEatery(parsedEatery);
                } catch (error) {
                    console.error("Error parsing params or fetching user:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }

        fetchData();
    }, [eateryParam, user?.id]);

    return (
        <ImageBackground
            source={images.primarybg}
            className="flex-1 items-center justify-center p-5"
            resizeMode="cover"
        >
            <Text
                className="font-baloo-regular text-5xl text-white text-center"
                style={{
                    textShadowColor: 'rgba(129, 52, 42, 1)',
                    textShadowOffset: { width: 3, height: 4 },
                    textShadowRadius: 0,
                    lineHeight: 52,
                }}
            >
                It's a match!
            </Text>

            <View className="flex-row items-center justify-center mb-12 relative">
                <RemoteImage
                    filePath={currentUser?.avatar_url}
                    bucket="avatars"
                    style={{
                        width: 168,
                        height: 168,
                        borderRadius: 100,
                        borderWidth: 4,
                        borderColor: "white",
                        marginHorizontal: -5
                    }}
                />
                <View className="w-20 h-20 rounded-full bg-[#FE724C] items-center justify-center absolute top-24 z-10">
                    <FontAwesome name="heart" size={36} color="white" />
                </View>
                <Image
                    source={{ uri: eatery?.photo }}
                    className="rounded-full border-4 border-white -mx-5"
                    style={{width: 168, height: 168}}
                />
            </View>

            {/* Bottom Button */}
            <View className="absolute bottom-20 left-0 right-0 items-center px-5">
                <TouchableOpacity
                    className="bg-white px-16 py-4 rounded-full shadow-lg flex-row items-center"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 5,
                    }}
                    onPress={() => router.push({
                        pathname: '/(modals)/RestaurantDetails',
                        params: {
                            placeId: eatery?.placeId,
                            eatery: JSON.stringify(eatery)
                        }
                    })}
                >
                    <Text
                        className="text-accent text-xl font-baloo-regular"
                        style={{lineHeight: 28}}
                    >
                        Go to Eat!
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-row items-center mt-4"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 5,
                    }}
                    onPress={() => router.back()}
                >
                    <Text
                        className="text-white text-xl font-baloo-regular"
                    >
                        Keep Swiping
                    </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}