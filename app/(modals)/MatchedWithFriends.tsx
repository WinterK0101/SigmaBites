import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    Modal,
    Pressable,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

export default function Matched() {
    const router = useRouter();
    const { restaurantImage, friendImage } = useLocalSearchParams();

    const restaurantUri = typeof restaurantImage === 'string' ? restaurantImage : '';
    const friendImgStr = typeof friendImage === 'string' ? friendImage : '[]';

    const userImage =
        'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg';

    const resolveImage = (img: string) => {
        if (!img) return null;
        if (img.startsWith('http')) return { uri: img };
        switch (img) {
            case 'assets/images/personA.png':
                return require('../../assets/images/personA.png');
            case 'assets/images/personB.png':
                return require('../../assets/images/personB.png');
            case 'assets/images/personC.png':
                return require('../../assets/images/personC.png');
            default:
                return null;
        }
    };

    let friendImageList: string[] = [];
    try {
        friendImageList = JSON.parse(friendImgStr);
    } catch {
        friendImageList = [];
    }

    const resolvedRestaurantImage = restaurantUri ? { uri: restaurantUri } : null;

    // Generate restaurant link for sharing (customize as needed)
    const restaurantLink = `https://yourapp.com/restaurant?image=${encodeURIComponent(
        restaurantUri
    )}`;

    const [modalVisible, setModalVisible] = useState(false);

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(restaurantLink);
        Alert.alert('Copied!', 'The restaurant link has been copied to your clipboard.');
    };

    // Helper component to render friend images based on count
    const FriendImages = () => {
        const count = friendImageList.length;

        if (count === 0) {
            return (
                <View style={[styles.image, styles.placeholder]}>
                    <Text style={styles.placeholderText}>No Friend Yet</Text>
                </View>
            );
        }

        if (count === 1) {
            // Show single friend image full circle
            const img = resolveImage(friendImageList[0]) || { uri: friendImageList[0] };
            return (
                <View style={styles.friendBubble}>
                    <Image source={img} style={styles.fullSize} />
                </View>
            );
        }

        if (count === 2) {
            // Split horizontally in halves
            return (
                <View style={styles.friendBubble}>
                    {friendImageList.slice(0, 2).map((uri, index) => {
                        const resolvedImg = resolveImage(uri) || { uri };
                        return (
                            <View
                                key={index}
                                style={[
                                    styles.half,
                                    index === 0 ? styles.leftHalf : styles.rightHalf,
                                ]}
                            >
                                <Image source={resolvedImg} style={styles.fullSize} />
                            </View>
                        );
                    })}
                </View>
            );
        }

        // For 3 or 4 friends, use the 4-quadrant layout (max 4)
        return (
            <View style={styles.friendBubble}>
                {friendImageList.slice(0, 4).map((uri, index) => {
                    let regionStyle = {};
                    switch (index) {
                        case 0:
                            regionStyle = styles.topLeft;
                            break;
                        case 1:
                            regionStyle = styles.topRight;
                            break;
                        case 2:
                            regionStyle = styles.bottomLeft;
                            break;
                        case 3:
                            regionStyle = styles.bottomRight;
                            break;
                    }
                    const resolvedImg = resolveImage(uri) || { uri };
                    return (
                        <View key={index} style={[styles.quadrant, regionStyle]}>
                            <Image source={resolvedImg} style={styles.fullSize} />
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <ImageBackground
            source={require('../../assets/images/match-bg.jpeg')}
            style={styles.background}
            resizeMode="cover"
        >
            <Text style={styles.title}>Matched!</Text>

            <View style={styles.pyramidContainer}>
                <View style={styles.topRow}>
                    <Image source={{ uri: userImage }} style={styles.image} />
                    <FriendImages />
                </View>

                <View style={styles.heartCircle}>
                    <FontAwesome name="heart" size={32} color="white" />
                </View>

                {resolvedRestaurantImage && (
                    <Image source={resolvedRestaurantImage} style={styles.image} />
                )}
            </View>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setModalVisible(true)} // Show modal on press
            >
                <Text style={styles.primaryText}>Invite Now!</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => router.back()}>
                <Text style={{ fontFamily: 'Baloo-Regular', fontSize: 24, color: 'white' }}>
                    Keep swiping
                </Text>
            </TouchableOpacity>

            {/* Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Send this link to your friend</Text>
                        <Text style={styles.modalLink}>{restaurantLink}</Text>

                        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                            <Text style={styles.copyButtonText}>Copy Link</Text>
                        </TouchableOpacity>

                        <Pressable
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 42,
        color: 'white',
        marginBottom: 40,
        fontFamily: 'Baloo-Regular',
    },
    pyramidContainer: {
        alignItems: 'center',
        marginBottom: 50,
        position: 'relative',
    },
    topRow: {
        flexDirection: 'row',
        marginBottom: -40,
        alignItems: 'center',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 80,
        borderWidth: 4,
        borderColor: 'white',
        backgroundColor: '#ddd',
        marginHorizontal: -20,
        zIndex: 1,
    },
    placeholder: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    heartCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FE724C',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 75,
        left: '50%',
        marginLeft: -100,
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    primaryButton: {
        backgroundColor: 'white',
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 60,
        marginBottom: 15,
    },
    primaryText: {
        color: '#FF724C',
        fontFamily: 'Baloo-Regular',
        fontSize: 20,
    },
    friendBubble: {
        width: 150,
        height: 150,
        borderRadius: 80,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 4,
        borderColor: 'white',
        backgroundColor: '#ddd',
        marginHorizontal: -20,
        zIndex: 1,
    },
    fullSize: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    quadrant: {
        position: 'absolute',
        width: '50%',
        height: '50%',
        overflow: 'hidden',
    },
    topLeft: {
        top: 0,
        left: 0,
    },
    topRight: {
        top: 0,
        right: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
    },
    half: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        overflow: 'hidden',
    },
    leftHalf: {
        left: 0,
        top: 0,
    },
    rightHalf: {
        right: 0,
        top: 0,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalLink: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    copyButton: {
        backgroundColor: '#FF724C',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginBottom: 15,
    },
    copyButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#FF724C',
        fontWeight: '600',
    },
});