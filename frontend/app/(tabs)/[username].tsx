import {View, Text, Platform, Pressable, Animated, FlatList} from "react-native";
import React, {useEffect, useState} from "react";
import AuthService from "@/app/lib/AuthService";
import {router, useLocalSearchParams} from "expo-router";
import Constants from "expo-constants";
import {Image} from "expo-image";
import useUpload from "@/app/lib/useUpload";
import PhotoUpload from "@/app/components/PhotoUpload";
import {Photo, UserProfile} from "@/app/lib/Types";

import PhotoCard from "@/app/components/PhotoCard";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function Username() {
    const [photos, setPhotos] = useState<Photo[] | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [error, setError] = useState(null)
    const { onUploadClick, showUploadScreen, setShowUploadScreen } = useUpload()
    const { username } = useLocalSearchParams();

    useEffect(() => {
        const onLoad = async () => {
            const isLoggedIn = await AuthService.isTokenExpired()
            if (!isLoggedIn) {
                let isAuthRefreshed: boolean = await AuthService.refreshAuthToken()
                if (!isAuthRefreshed) return router.push("/auth/login")
            }

            const res = await fetch(`${apiUrl}/api/users/username/${username}`, {
                method: "GET",
                headers: {
                    "Platform": Platform.OS
                },
                credentials: "include"
            })

            const data = await res.json()
            if (!data.success) return setError(data.error)
            const user = data.user
            setProfile({ username: user.username, description: user.description, image: user.image,
                first_name: user.first_name, last_name: user.last_name, user_id: user.user_id })
            setPhotos(user.photos)
        }

        onLoad()
    }, []);

    const Item = ({ photo }: { photo: Photo }) => <PhotoCard photo={photo} userId={profile?.user_id ?? photo.user_id} />

    return (
        <View style={{ width: '100%', height: "100%", backgroundColor: "#181a1b", alignItems: "center" }}>
            { profile &&
                <View style={{ position: "relative", width: '100%', height: "100%" }}>
                    <View style={{ flexDirection: "row", alignSelf: "center", maxHeight: 200, minHeight: 150, gap: 10, padding: 30 }}>
                        <View style={{ height: '100%', maxWidth: 128, maxHeight: 128, aspectRatio: 1, borderRadius: 9999, backgroundColor: "white"}}>
                            { profile.image && <Image source={ profile.image } style={{  }} /> }
                        </View>
                        <View style={{ flex: 2, flexDirection: "column", padding: 10 }}>
                            <Text style={{ fontSize: 12, color: 'white', opacity: 0.5, fontFamily: "SpaceMono-Regular" }}>Portfolio</Text>
                            <Text style={{ flex: 1, flexShrink: 1, fontSize: 24, color: 'white', fontFamily: "SpaceMono-Regular" }}>{ profile.username }</Text>
                            <Text style={{ flex: 1, flexShrink: 1, fontSize: 12, color: 'white', fontFamily: "SpaceMono-Regular" }}>{ profile.first_name + ' ' +profile.last_name }</Text>
                        </View>
                    </View>

                    <View style={{ width: "100%", borderBottomWidth: 1, borderColor: "white" }}></View>

                    { photos &&
                        <FlatList columnWrapperStyle={{ justifyContent: 'space-evenly' }}
                                  numColumns={3} keyExtractor={item => item.image_url} data={photos}
                                  renderItem={(photo) => <Item photo={photo.item} />} />
                    }

                    { !photos &&
                        <View style={{ flexDirection: "column", justifyContent: "center", marginTop: 100 }}>
                            <Text style={{ marginHorizontal: "auto", color: 'black', fontFamily: "SpaceMono-Regular" }}>You have no photos!</Text>
                            <Pressable onPress={onUploadClick} style={{ marginHorizontal: "auto", backgroundColor: '#3091fc', padding: 10, paddingHorizontal: 20,
                                borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 10}}>
                                <Text style={{ color: 'white', fontFamily: "SpaceMono-Regular" }}>Upload Photo</Text>
                            </Pressable>
                        </View>
                    }
                </View>
            }

            { showUploadScreen &&
                <PhotoUpload setShowUpload={setShowUploadScreen} /> }

            { !profile && error &&
                <Text style={{ color: 'red', alignSelf: 'center', marginBottom: 20, fontFamily: "SpaceMono-Regular" }}>{error}</Text>
            }
        </View>
    )
}