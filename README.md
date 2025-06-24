# Sigma Bites

**Presented by Sigma Bytes**

Sigma Bites is a mobile application designed to help users discover nearby eateries through a swipe-based interface inspired by Tinder. Leveraging the Google Places API and real-time geolocation, the app intelligently recommends restaurants based on user preferences and current location. The platform aims to make food discovery social, intuitive, and fun.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Use Cases](#use-cases)
- [Technology Stack](#technology-stack)
- [Installation and Setup](#installation-and-setup)
- [Project Structure](#project-structure)
- [Contributors](#contributors)

---

## Overview

Sigma Bites addresses two core user scenarios:
1. Users relaxing at home who want to explore and save future dining options.
2. Users who are out, hungry, and need to make quick, collaborative decisions on where to eat.

Through a swipe interface, users can browse restaurants, match preferences with friends, and make plans seamlessly. The experience is tailored to both solo and group decision-making, enhancing how people interact with food and friends.

---

## Key Features

### Swipe-Based Discovery
- Users swipe right to like or left to skip nearby eateries.
- Real-time recommendations powered by the Google Places API.

### Solo Swipe Mode
- Users are matched when they like the same place as a friend.
- Enables instant invites and streamlined planning.

### Group Swipe Mode
- Friends can join a synchronized session.
- The restaurant with the most votes is selected as the group match.

### Saved Eateries and History
- Users can favourite restaurants for future reference.
- View recently saved places in a centralized display.
- See where friends have eaten and explore their recommendations.

### Social and Profile System
- Users can add and follow friends, accept or reject friend requests, and manage privacy settings.
- Activity is displayed in the “Bites Inbox,” including nearby friend alerts and matched recommendations.

---

## Use Cases

- **At Home**: Browse and save options for later outings.
- **Out and Hungry**: Make spontaneous group decisions quickly and effortlessly.
- **Social Planning**: Use matches and swipes to coordinate meetups with friends.
- **Food Discovery**: Explore eateries based on real-time suggestions and social trends.

---

## Technology Stack

- **Frontend**: React Native
- **Development Platform**: Expo Go
- **Backend Services**: Firebase, Supabase 
- **APIs**: Google Places API
- **Version Control**: Git & GitHub

---

## Installation and Setup

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-username/sigma-bites.git
   cd sigma-bites
2. **Install dependencies**
    ```bash
   npm install
4. **Set up environment variables**
   Create a .env file and add your Firebase and Google Places API credentials.
5. **Start the development server**
   ```bash
   npx expo start
7. **Run on a device**
Install the Expo Go app on your iOS or Android device.
Scan the QR code generated in the terminal to open the app.

## Project Structure

```
sigma-bites/
├── assets/                # Static images, logos, etc.
├── components/            # Reusable UI components
├── context/               # Context providers (e.g., session, auth)
├── navigation/            # Stack and tab navigation
├── screens/               # Main screen components
├── services/              # Firebase, API integrations
├── utils/                 # Utility functions and helpers
├── App.js                 # App root file
├── app.json               # Expo configuration
├── .env                   # Environment configuration (not committed)
└── README.md              # Project documentation
```


## Contributors 
Brought to you by Loong Kiat, Mun Kuan, Iniya, Michelle and Emeline. 
