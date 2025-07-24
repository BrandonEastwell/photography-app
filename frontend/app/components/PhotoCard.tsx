import {Pressable} from "react-native";
import {Image} from "expo-image";
import React, {useState} from "react";
import {ExifData, Photo, photoKeyToExifKeyMap} from "@/app/lib/Types";
import PhotoPopup from "@/app/components/PhotoPopup";
import PhotoModal from "@/app/components/PhotoModal";

export default function PhotoCard({ photo } : {
    photo: Photo
}) {
    const [showPhotoPopup, setShowPhotoPopup] = useState<boolean>(false)
    const [exif, setExif] = useState<Partial<ExifData>>({})
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
        setShowPhotoPopup(true)
    }

    return (
        <>
            <Pressable onPress={onClickPhoto} style={{ width: "32%", height: 200, margin: 2.5, zIndex: 50 }}>
                <Image source={photo.image_url} style={{ width: "100%", height: "100%" }} />
            </Pressable>
            { showPhotoPopup &&
                <PhotoModal>
                    <PhotoPopup onClose={setShowPhotoPopup} photoSrc={photo.image_url} exif={exif} children={undefined}>

                    </PhotoPopup>
                </PhotoModal>
            }
        </>

    )
}