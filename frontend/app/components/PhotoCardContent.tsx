import {Animated, Pressable, Text, View} from "react-native";
import React, {useEffect, useRef} from "react";
import {Image} from "expo-image";
import PhotoTags from "@/app/components/PhotoTags";
import {ExifData, UserProfile} from "@/app/lib/Types";
import {useRouter} from "expo-router";
import {useAuth} from "@/app/lib/AuthContext";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function PhotoCardContent({ children, onClose, showCard, photoSrc, onDelete, exif, profile, userId } : {
    children: React.ReactNode
    onClose: React.Dispatch<React.SetStateAction<boolean>>
    photoSrc: string
    onDelete?: () => void
    exif: ExifData | null
    profile: Partial<UserProfile> | null
    userId: number | null
    showCard: boolean
}) {
    const { authUser } = useAuth()
    const router = useRouter();
    const isUserPhoto = authUser?.user_id === userId && typeof (authUser?.user_id + userId) === "number"
    const scaleAnim = useRef(new Animated.Value(1.05)).current;

    const navigateToProfile = () => {
        if (profile?.username) {
            router.push({
                pathname: `/[username]`,
                params: {
                    username: encodeURIComponent(profile.username)
                }
            })
        }
    }

    useEffect(() => {
        if (showCard) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 10,
                tension: 80,
                useNativeDriver: true,
            }).start();
        }
    }, [showCard]);

    const closeCard = () => {
        Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
        }).start(() => onClose(false));
    }

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], flexDirection: "column", backgroundColor: '#121212', borderRadius: 15, maxWidth: 340, height: "auto" }}>
            <View style={{ padding: 10, borderRadius: 15, flexDirection: "row", zIndex: 100, width: "100%", justifyContent: "space-between"}}>
                <View>
                    { profile && !isUserPhoto &&
                        <Pressable onPress={navigateToProfile} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                            <View style={{ width: 28, height: 28, aspectRatio: 1, borderRadius: 9999, backgroundColor: "white" }}>
                                { profile.image && <Image source={ profile.image } style={{ width: "100%", height: "100%", aspectRatio: 1 }} /> }
                            </View>
                            <View style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}>
                                <Text style={{ fontSize: 14, color: 'white', fontFamily: "SpaceMono-Regular" }}>{ profile.username }</Text>
                            </View>
                        </Pressable>
                    }
                    { isUserPhoto && onDelete &&
                        <Pressable onPress={onDelete} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                            <MaterialCommunityIcons name="delete-outline" size={24} color="white" />
                        </Pressable>
                    }
                </View>
                <AntDesign style={{ alignSelf: "center" }} onPress={closeCard} name="close" size={20} color="white" />
            </View>
            <Image style={{ width: 340, height: 400 }} source={photoSrc}></Image>
            <View style={{ paddingHorizontal: 15, paddingVertical: 15 }}>
                { exif && <PhotoTags exif={exif} /> }
                { children }
            </View>
        </Animated.View>
    )
}