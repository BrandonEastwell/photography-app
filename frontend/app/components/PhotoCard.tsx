import {Pressable} from "react-native";
import {Image} from "expo-image";
import React, {useState} from "react";
import {ExifData, Photo, photoKeyToExifKeyMap, UserProfile} from "@/app/lib/Types";
import PhotoCardContent from "@/app/components/PhotoCardContent";
import PhotoModal from "@/app/components/PhotoModal";
import Constants from 'expo-constants';
import AuthService from "@/app/lib/AuthService";
import {getReqHeaders} from "@/app/lib/Helpers";
import {useMessage} from "@/app/lib/MessagingContext";
import {useAuth} from "@/app/lib/AuthContext";
import {router} from "expo-router";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function PhotoCard({ photo, userId, removePhoto } : {
    photo: Photo
    userId: number
    removePhoto?: (id: number) => void
}) {
    const [showCard, setShowCard] = useState<boolean>(false)
    const [exif, setExif] = useState<Partial<ExifData>>({})
    const [profile, setProfile] = useState<Partial<UserProfile> | null>(null)
    const { setMessage } = useMessage()
    const { isAuthenticated } = useAuth()

    const onClickPhoto = () => {
        const exifData: Partial<ExifData> = {}
        for (const key in photoKeyToExifKeyMap) {
            const exifKey = photoKeyToExifKeyMap[key as keyof Photo]
            const typedKey = key as keyof Photo

            if (photo[typedKey] === undefined || photo[typedKey] === null) continue

            switch (exifKey) {
                case "ShutterSpeedValue":
                    exifData[exifKey] = String(photo[typedKey])
                    break
                case "Make":
                    exifData[exifKey] = String(photo[typedKey])
                    break
                case "Model":
                    exifData[exifKey] = String(photo[typedKey])
                    break
                case "ISOSpeedRatings":
                    exifData[exifKey] = Number(photo[typedKey])
                    break
                case "LensModel":
                    exifData[exifKey] = String(photo[typedKey])
                    break
                case "Flash":
                    exifData[exifKey] = photo[typedKey] === true ? "Yes" : "No"
                    break
                case "FocalLength":
                    exifData[exifKey] = Number(photo[typedKey])
                    break
                case "GPSLongitude":
                    exifData[exifKey] = Number(photo[typedKey])
                    break
                case "GPSLatitude":
                    exifData[exifKey] = Number(photo[typedKey])
                    break
            }
        }

        setExif(exifData)
        getUserDetails().then(() => setShowCard(true))
    }

    const getUserDetails = async () => {
        if (!userId) return

        try {
            const res = await fetch(`${apiUrl}/api/users/id/${userId}`, {
                method: "GET"
            })

            const data = await res.json()
            if (!data.success) return
            const user = data.user
            setProfile({ username: user.username, image: user.image, user_id: user.user_id })
        } catch (e) {
            console.error(e)
        }
    }

    const deletePhoto = async () => {
        if (removePhoto && photo.image_id) {
            const isUserAuthenticated = await isAuthenticated()
            if (!isUserAuthenticated) {
                let isAuthRefreshed: boolean = await AuthService.refreshAuthToken()
                if (!isAuthRefreshed) return router.push("/auth/login")
            }

            try {
                const headers = await getReqHeaders()
                let res = await fetch(`${apiUrl}/api/media/photo/${photo.image_id}`, {
                    method: "DELETE",
                    headers,
                    credentials: "include",
                })

                const data = await res.json()
                if (!data.success) return setMessage({ message: data.error, error: true })
                data.message ? setMessage({ message: data.message, error: false }) : null
                removePhoto(photo.image_id)
            } catch (e) {
                console.error(e)
                setMessage({ message: "Could not delete photo right now", error: true })
            }
        }
    }

    return (
        <>
            <Pressable onPress={onClickPhoto} style={{ width: "32%", height: 200, margin: 2.5, zIndex: 50 }}>
                <Image source={photo.image_url} style={{ width: "100%", height: "100%" }} />
            </Pressable>
            { showCard &&
                <PhotoModal>
                    <PhotoCardContent onClose={setShowCard} photoSrc={photo.image_url} exif={exif} children={undefined}
                                      profile={profile} userId={userId} showCard={showCard} onDelete={deletePhoto}>
                    </PhotoCardContent>
                </PhotoModal>
            }
        </>
    )
}