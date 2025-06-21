import {View, Text, ImageBackground, ScrollView, Image, ActivityIndicator} from 'react-native'
import React from 'react'
import {images} from "@/constants/images";

export default function Waiting() {
    return (
        <ImageBackground
            source={images.primarybg}
            style={{flex: 1, width: '100%', height: '100%'}}
            resizeMode="cover"
        >
            <View className="flex-1 justify-center items-center px-6">
                <Text
                    className="font-baloo-regular text-5xl text-white text-center"
                    style={{
                        textShadowColor: 'rgba(129, 52, 42, 1)',
                        textShadowOffset: { width: 3, height: 4 },
                        textShadowRadius: 0,
                        lineHeight: 52,
                    }}
                >
                    Waiting for Others...
                </Text>

                <View className="bg-white rounded-2xl w-3/4 h-2/6 mt-10 items-center px-4 py-6">
                    <Text className="font-baloo-regular text-accent text-2xl">Progress</Text>
                    <ScrollView
                        className="flex-1 mt-3"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4}}
                    >
                        {dummyUsers.map((user) => (
                            <View
                                key={user.username}
                                className="flex flex-row items-center justify-between w-full mb-4 px-2"
                            >
                                <View className="flex flex-row items-center flex-1">
                                    <Image source={{ uri: user.avatar_url }} className="w-12 h-12 rounded-full mr-3"/>
                                    <Text className="font-lexend-regular text-primary text-base" style={{maxWidth: '72%'}}>@{user.username}</Text>
                                </View>

                                {/* Status indicator */}
                                <View className="ml-2">
                                    {user.swipingStatus === 'completed' ? (
                                        <View className="bg-accent rounded-full w-8 h-8 justify-center align-center">
                                            <Text className="text-white text-xl text-center">✓</Text>
                                        </View>
                                    ) : (
                                        <ActivityIndicator size="small" color="#fe724c" />
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </ImageBackground>
    )
}
