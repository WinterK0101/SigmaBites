import * as React from 'react';
import {createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs";
import Matches from "@/app/screens/matches";
import Friends from "@/app/screens/friends";
import Profile from "@/app/screens/profile";
import Discover from "@/app/screens/discover";
import {icons} from "@/constants/icons";

function TabIcon({focused, icon, name}){

}

const Tab = createMaterialTopTabNavigator();
const TabLayout = () => {
    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={{
                tabBarIndicatorStyle: {
                    position: 'absolute',
                    top: 0,
                    height: 6,
                    backgroundColor: '#FE724C',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    textAlignVertical: 'center',
                    includeFontPadding: false,
                },
                tabBarStyle: {
                    backgroundColor: "white",
                    height: 90,
                },
                tabBarItemStyle: {
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    paddingVertical: 8,
                    marginTop: 8,
                },
            }}
        >
            <Tab.Screen name="Discover"
                        component={Discover}
                        options={{
                            title: "Discover",
                            tabBarIcon: ({ focused }) => (
                                <icons.discover height={25} width={25} fill={"transparent"}/>
                            )
                        }}
            />
            <Tab.Screen name="Matches"
                        component={Matches}
                        options={{
                            title: "Matches",
                            tabBarIcon: ({ focused }) => (
                                <icons.matches height={25} width={25} fill={"transparent"}/>
                            )
                        }}
            />
            <Tab.Screen name="Friends"
                        component={Friends}
                        options={{
                            title: "Friends",
                            tabBarIcon: ({ focused }) => (
                                <icons.friends height={25} width={25} fill={"transparent"}/>
                            )
                        }}
            />
            <Tab.Screen name="Profile"
                        component={Profile}
                        options={{
                            title: "Profile",
                            tabBarIcon: ({ focused }) => (
                                <icons.profile height={25} width={25} fill={"transparent"}/>
                            )
                        }}
            />
        </Tab.Navigator>
    );
}

export default TabLayout