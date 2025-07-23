import {View, Text, Platform, Pressable, Animated} from "react-native";
import React, {useEffect, useState} from "react";
import AuthService from "@/app/lib/AuthService";
import {router} from "expo-router";
import Constants from "expo-constants";
import {Image} from "expo-image";
import useUpload from "@/app/lib/useUpload";
import PhotoUpload from "@/app/components/PhotoUpload";
import ScrollView = Animated.ScrollView;
const apiUrl = Constants.expoConfig?.extra?.API_URL;

interface Photo {
    id: string
    url: string
}

interface Profile {
    username: string
    firstName: string
    lastName: string
    description: string | null
    image: string | null
}

export default function Profile() {
    const [photos, setPhotos] = useState<Photo[] | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [error, setError] = useState(null)
    const { onUploadClick, showUploadScreen, setShowUploadScreen } = useUpload()

    useEffect(() => {
        const onLoad = async () => {
            const isLoggedIn = await AuthService.isUserLoggedIn()
            if (!isLoggedIn) {
                let isAuthRefreshed: boolean = await AuthService.refreshAuthToken()
                if (!isAuthRefreshed) return router.push("/auth/login")
            }

            const res = await fetch(`${apiUrl}/api/user/profile`, {
                method: "GET",
                headers: {
                    "Platform": Platform.OS
                },
                credentials: "include"
            })

            const data = await res.json()
            if (!data.success) return setError(data.error)
            const user = data.user
            setProfile({ username: user.username, description: user.description, image: user.image, firstName: user.firstName, lastName: user.lastName })
            setPhotos(user.photos)
        }

        onLoad()
    }, []);

    return (
        <View style={{ width: '100%', height: "100%", backgroundColor: "#181a1b", alignItems: "center" }}>
            { profile &&
                <View style={{ position: "relative", maxWidth: 600, width: '100%', height: "100%", justifyContent: "center" }}>
                    <View style={{ flexDirection: "row", maxHeight: 200, minHeight: 150, width: '100%', gap: 10, padding: 30, borderBottomWidth: 1, borderColor: "white" }}>
                        <View style={{ height: '100%', maxWidth: 128, maxHeight: 128, aspectRatio: 1, borderRadius: 9999, backgroundColor: "white"}}>
                            { profile.image && <Image source={ profile.image } style={{  }} /> }
                        </View>
                        <View style={{ flex: 2, flexDirection: "column", padding: 10 }}>
                            <Text style={{ flex: 1, flexShrink: 1, fontSize: 16, color: 'white', fontFamily: "SpaceMono-Regular" }}>{ profile.username }</Text>
                            <Text style={{ flex: 1, flexShrink: 1, fontSize: 12, color: 'white', fontFamily: "SpaceMono-Regular" }}>{ profile.firstName + ' ' +profile.lastName }</Text>
                            <View style={{ flex: 3, flexDirection: "row", flexWrap: "wrap", marginTop: 5, height: 'auto' }}>
                                { profile.description && <Text style={{ fontSize: 12, color: 'white', fontFamily: "SpaceMono-Regular" }}>{ profile.description }</Text> }
                                { !profile.description && <Text style={{ fontSize: 12, color: 'white', opacity: 0.5, fontFamily: "SpaceMono-Regular" }}>Add a description</Text> }
                            </View>
                        </View>
                    </View>

                    { photos &&
                        <ScrollView>
                            <View style={{
                                flex: 1,
                                flexDirection: "row",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                marginTop: 2.5,
                                gap: 2.5
                            }}>
                                { photos &&
                                    photos.map((photo: Photo, index) => (
                                        <Image key={index} source={photo.url} style={{ width: "32%", height: 200 }} />
                                    ))
                                }
                            </View>
                        </ScrollView>
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