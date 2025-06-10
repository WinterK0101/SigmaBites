// app/(tabs)/_layout.tsx
import * as React from 'react';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Matches from "@/app/(tabs)/Matches";
import Friends from "@/app/(tabs)/Friends";
import Profile from "@/app/(tabs)/Profile";
import Discover from "@/app/(tabs)/Discover";
import { icons } from "@/constants/icons";

const Tab = createMaterialTopTabNavigator();
const TabLayout = () => {
    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={{
                tabBarIndicatorStyle: {
                    position: 'absolute',
                    top: -2,
                    height: 6,
                    backgroundColor: '#FE724C',
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                    fontFamily: 'Lexend-Regular',
                },
                tabBarStyle: {
                    backgroundColor: "white",
                    height: 92,
                    borderTopColor: '#d9d9d9',
                    borderTopWidth: 2,
                    position: 'fixed',
                },
                tabBarItemStyle: {
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    paddingVertical: 8,
                    marginTop: 4,
                },
                tabBarActiveTintColor: '#FE724C',
                tabBarInactiveTintColor: '#272D2F',
            }}
        >
            <Tab.Screen name="Discover"
                component={Discover}
                options={{
                    title: "Discover",
                    tabBarIcon: ({ focused, color }) => (
                        <icons.discover height={25} width={25} stroke={color} />
                    )
                }}
            />
            <Tab.Screen name="Matches"
                component={Matches}
                options={{
                    title: "Matches",
                    tabBarIcon: ({ focused, color }) => (
                        <icons.matches height={25} width={25} stroke={color} />
                    )
                }}
            />
            <Tab.Screen name="Friends"
                component={Friends}
                options={{
                    title: "Friends",
                    tabBarIcon: ({ focused, color }) => (
                        <icons.friends height={25} width={25} stroke={color} />
                    )
                }}
            />
            <Tab.Screen name="Profile"
                component={Profile}
                options={{
                    title: "Profile",
                    tabBarIcon: ({ focused, color }) => (
                        <icons.profile height={25} width={25} stroke={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
}

export default TabLayout