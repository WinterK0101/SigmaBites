# Sigma Bites

**Presented by Sigma Bytes**

Sigma Bites is a mobile application designed to help users discover nearby eateries through a swipe-based interface inspired by Tinder. Leveraging the Google Places API and real-time geolocation, the app intelligently recommends restaurants based on user preferences and current location. The platform aims to make food discovery social, intuitive, and fun.

<br>
[Click here to get the QR code] (https://shorturl.at/dN90C) to run the app on Expo Go!

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Use Cases](#use-cases)
- [Technology Stack](#technology-stack)
- [Installation and Setup](#installation-and-setup)
- [Project Structure](#project-structure)
- [Contributors](#contributors)
- [System Architecture](#system-architecture) 

---

## Overview

Sigma Bites addresses two core user scenarios:
1. Users relaxing at home who want to explore and save future dining options.
2. Users who are out, hungry, and need to make quick decisions on where to eat.

Using a Tinder-style swipe interface, users can explore restaurants near them, match preferences with friends, and plan outings seamlessly. The experience is tailored to both solo and group decision-making, enhancing how people interact with food and friends.

---

## Key Features

### Swipe-Based Discovery
- Users swipe right to save, or swipe left to skip nearby eateries.
- Real-time recommendations powered by the Google Places API.

### Solo Swipe Mode
- Users can discover new eateries nearby on their own.
- As a bonus, users are "matched" when they swipe right on the same place as a friend.
- Enables instant invites and streamlined planning for meals together.

### Group Swipe Mode
- Friends can join a synchronized session to swipe through eateries to decide on where to eat together.
- The restaurant(s) with the most votes will be selected, and users can also view the breakdown of the votes at the end.

### Saved Eateries and History
- Users can view the restaurants they've previously swiped on, and even add certain restaurants to a favourites list for future reference.
- View recently saved places in a centralized display on their profile.
- See where friends have eaten and explore their recommendations.

### Social and Profile System
- Add friends, view their favorite eateries, and swipe together.
- Receive friend requests and invitations to join group swiping sessions through a "Bites Inbox"

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
- **Backend Services**: Supabase 
- **APIs**: Google Places API (Nearby Search, Place Photo, and Autocomplete)
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

## System Architecture Diagram
![Sigma Bites](https://github.com/user-attachments/assets/9c56528c-e12d-4664-a0ed-35107d9d2386)
