import {Pressable} from "react-native";
import {Image} from "expo-image";
import React, {useState} from "react";
import {ExifData, Photo, photoKeyToExifKeyMap, UserProfile} from "@/app/lib/Types";
import PhotoCardContent from "@/app/components/PhotoCardContent";
import PhotoModal from "@/app/components/PhotoModal";
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function PhotoCard({ photo, userId } : {
    photo: Photo
    userId: number
}) {
    const [showPhotoPopup, setShowPhotoPopup] = useState<boolean>(false)
    const [exif, setExif] = useState<Partial<ExifData>>({})
    const [profile, setProfile] = useState<Partial<UserProfile> | null>(null)

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
        getUserDetails().then(() => {
            setShowPhotoPopup(true)
        })
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

    return (
        <>
            <Pressable onPress={onClickPhoto} style={{ width: "32%", height: 200, margin: 2.5, zIndex: 50 }}>
                <Image source={photo.image_url} style={{ width: "100%", height: "100%" }} />
            </Pressable>
            { showPhotoPopup &&
                <PhotoModal>
                    <PhotoCardContent onClose={setShowPhotoPopup} photoSrc={photo.image_url} exif={exif} children={undefined}
                                      profile={profile} userId={userId}>
                    </PhotoCardContent>
                </PhotoModal>
            }
        </>
    )
}