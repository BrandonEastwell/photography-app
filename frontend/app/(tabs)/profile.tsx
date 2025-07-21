import {View, Text, Platform, Pressable} from "react-native";
import React, {useEffect, useState} from "react";
import AuthService from "@/app/lib/AuthService";
import {router} from "expo-router";
import Constants from "expo-constants";
import {Image} from "expo-image";
import useUpload from "@/app/lib/useUpload";
import PhotoUpload from "@/app/components/PhotoUpload";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

interface Photos {
    id: string
    url: string
}

interface Profile {
    username: string
    description: string | null
    image: string | null
}

export default function Profile() {
    const [photos, setPhotos] = useState<Photos[] | null>(null)
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
            setProfile({ username: user.username, description: user.description, image: user.image })
            setPhotos(data.photos)
        }

        onLoad()
    }, []);

    return (
        <>
            { profile &&
                <View>
                    <View style={{ flexDirection: "row", maxHeight: 200, padding: 30 }}>
                        <View style={{ flex: 1 }}>
                            <View style={{ width: "80%", aspectRatio: 1, borderRadius: 100, backgroundColor: "black"}}>
                                { profile.image && <Image source={profile.image} style={{  }} /> }
                            </View>
                        </View>
                        <View style={{ flex: 2, flexDirection: "column", padding: 10 }}>
                            <Text> { profile?.username } </Text>
                        </View>
                    </View>

                    { photos &&
                        <View>

                        </View>
                    }

                    { !photos &&
                        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 100 }}>
                            <Pressable onPress={onUploadClick} style={{ backgroundColor: '#3091fc', padding: 10, paddingHorizontal: 20,
                                borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 20}}>
                                <Text style={{ color: 'white', fontFamily: "SpaceMono-Regular" }}>Upload Photo</Text>
                            </Pressable>
                        </View>
                    }
                </View>
            }

            { showUploadScreen && <PhotoUpload setShowUpload={setShowUploadScreen} /> }

            { !profile && error &&
                <Text style={{ color: 'red', alignSelf: 'center', marginBottom: 20, fontFamily: "SpaceMono-Regular" }}>{error}</Text>
            }
        </>
    )
}