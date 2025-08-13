import {View, Text, Pressable, FlatList} from "react-native";
import React, {useEffect, useState} from "react";
import {router, useLocalSearchParams} from "expo-router";
import Constants from "expo-constants";
import useUpload from "@/app/lib/useUpload";
import PhotoUpload from "@/app/components/PhotoUpload";
import {Photo, UserProfile} from "@/app/lib/Types";
import PhotoCard from "@/app/components/PhotoCard";
import {useMessage} from "@/app/lib/MessagingContext";
import DefaultProfileIcon from "../../assets/images/account_circle.svg"
import {useAuth} from "@/app/lib/AuthContext";
import {getReqHeaders} from "@/app/lib/Helpers";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

function isCompleteUser(user: Partial<UserProfile>): user is UserProfile {
    if (!user) return false
    const requiredKeys: (keyof UserProfile)[] = ["user_id", "first_name", "last_name", "username"]
    return requiredKeys.every((key) => user[key] !== undefined)
}

export default function Username() {
    const [photos, setPhotos] = useState<Photo[] | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const { onUploadClick, showUploadScreen, setShowUploadScreen } = useUpload()
    const { username } = useLocalSearchParams()
    const { setMessage } = useMessage()
    const { authUser, isAuthenticated, authUserPhotos, setAuthUserPhotos, setAuthUser } = useAuth()

    useEffect(() => {
        const onLoad = async () => {
            const isLoggedIn = await isAuthenticated()
            if (!isLoggedIn) return router.push("/auth/login")

            if (authUser?.username === username && isCompleteUser(authUser)) {
                setProfile(authUser)
                setPhotos(authUserPhotos)
                return
            }

            const headers = await getReqHeaders()
            const res = await fetch(`${apiUrl}/api/users/username/${username}`, {
                method: "GET",
                headers,
                credentials: "include"
            })

            const data = await res.json()
            if (!data.success) return setMessage({ message: data.error, error: true })

            const profile = { username: data.user.username, description: data.user.description, image: data.user.image,
                first_name: data.user.first_name, last_name: data.user.last_name, user_id: data.user.user_id }
            setProfile(profile)
            setPhotos(data.user.photos)

            if (authUser?.username === username) {
                setAuthUser(profile)
                setAuthUserPhotos(data.user.photos)
            }
        }

        onLoad()
    }, []);

    useEffect(() => {
        if (authUser?.username === username) {
            setPhotos(authUserPhotos)
        }
    }, [authUserPhotos]);

    const Item = ({ photo }: { photo: Photo }) =>
        <PhotoCard photo={photo}
                   userId={profile?.user_id ?? photo.user_id}
                   removePhoto={(id: number) => setPhotos((prevPhotos) => (prevPhotos ?? []).filter((p) => p.image_id !== id))} />

    return (
        <View style={{ width: '100%', height: "100%", backgroundColor: "#181a1b", alignItems: "center" }}>
            { profile &&
                <View style={{ width: '100%', height: "100%" }}>
                    <View style={{ flexDirection: "column", alignItems: "center" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", maxHeight: 200, minHeight: 150, gap: 10, padding: 30 }}>
                            <View style={{ height: '100%', flexDirection: "column", justifyContent: "center", maxWidth: 128, maxHeight: 128, borderRadius: 9999, backgroundColor: "transparent"}}>
                                { !profile.image && <DefaultProfileIcon style={{ width: "100%", height: "100%" }} /> }
                            </View>
                            <View style={{ flex: 2, flexDirection: "column", padding: 10 }}>
                                <Text style={{ fontSize: 12, color: 'white', opacity: 0.5, fontFamily: "SpaceMono-Regular" }}>Portfolio</Text>
                                <Text style={{ flex: 1, flexShrink: 1, fontSize: 16, color: 'white', fontFamily: "SpaceMono-Regular" }}>{ profile.username }</Text>
                                <Text style={{ flex: 1, flexShrink: 1, fontSize: 12, color: 'white', fontFamily: "SpaceMono-Regular" }}>{ profile.first_name + ' ' + profile.last_name }</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ width: "100%", borderBottomWidth: 1, borderColor: "white" }}></View>

                    { photos &&
                        <FlatList columnWrapperStyle={{ justifyContent: 'flex-start' }}
                                  numColumns={3} keyExtractor={item => item.image_url} data={photos}
                                  renderItem={(photo) => <Item photo={photo.item} />} />
                    }

                    { !photos &&
                        <View style={{ flexDirection: "column", justifyContent: "center", marginTop: 100 }}>
                            <Text style={{ marginHorizontal: "auto", color: 'white', fontFamily: "SpaceMono-Regular" }}>You have no photos!</Text>
                            <Pressable onPress={onUploadClick} style={{ marginHorizontal: "auto", backgroundColor: '#3091fc', padding: 10, paddingHorizontal: 20,
                                borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 10}}>
                                <Text style={{ color: 'white', fontFamily: "SpaceMono-Regular" }}>Upload Photo</Text>
                            </Pressable>
                        </View>
                    }
                </View>
            }

            { showUploadScreen && <PhotoUpload setShowUpload={setShowUploadScreen} /> }
        </View>
    )
}