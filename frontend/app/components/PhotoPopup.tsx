import {Pressable, Text, View} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import {Image} from "expo-image";
import PhotoTags from "@/app/components/PhotoTags";
import {ExifData, UserProfile} from "@/app/lib/Types";
import {useRouter} from "expo-router";

export default function PhotoPopup({ children, onClose, photoSrc, exif, profile } : {
    children: React.ReactNode
    onClose: React.Dispatch<React.SetStateAction<boolean>>
    photoSrc: string
    exif: ExifData | null
    profile: UserProfile | null
}) {

    const router = useRouter();
    const navigateToProfile = () => {
        if (profile) {
            router.push({
                pathname: `/[username]`,
                params: {
                    username: encodeURIComponent(profile.username)
                }
            })
        }
    }

    return (
        <View style={{ flexDirection: "column", backgroundColor: "#181a1b", borderRadius: 15, maxWidth: 340, height: "auto" }}>
            <View style={{ padding: 10, borderRadius: 15, flexDirection: "row", zIndex: 100, width: "100%", justifyContent: "space-between"}}>
                <View>
                    { profile &&
                        <Pressable onPress={navigateToProfile} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                            <View style={{ width: 28, height: 28, aspectRatio: 1, borderRadius: 9999, backgroundColor: "white" }}>
                                { profile.image && <Image source={ profile.image } style={{ width: "100%", height: "100%", aspectRatio: 1 }} /> }
                            </View>
                            <View style={{ flex: 1, flexDirection: "column", justifyContent: "center" }}>
                                <Text style={{ fontSize: 14, color: 'white', fontFamily: "SpaceMono-Regular" }}>{ profile.username }</Text>
                            </View>
                        </Pressable>
                    }
                </View>
                <AntDesign style={{ alignSelf: "center" }} onPress={() => onClose(false)} name="close" size={20} color="white" />
            </View>
            <Image style={{ width: 340, height: 400 }} source={photoSrc}></Image>
            <View style={{ paddingHorizontal: 15, paddingVertical: 15 }}>
                { exif && <PhotoTags exif={exif} /> }
                { children }
            </View>
        </View>
    )
}