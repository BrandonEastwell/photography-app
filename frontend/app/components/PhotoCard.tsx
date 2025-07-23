import {Modal, Pressable, View} from "react-native";
import {Image} from "expo-image";
import React, {useState} from "react";
import {Photo} from "@/app/lib/Types";
import PhotoPopup from "@/app/components/PhotoPopup";
import PhotoModal from "@/app/components/PhotoModal";

export default function PhotoCard({ photo } : {
    photo: Photo
}) {
    const [showPhotoPopup, setShowPhotoPopup] = useState<boolean>(false)
    const onClickPhoto = () => {
        setShowPhotoPopup(true)
    }

    return (
        <>
            <Pressable onPress={onClickPhoto} style={{ width: "32%", height: 200, margin: 2.5, zIndex: 50 }}>
                <Image source={photo.image_url} style={{ width: "100%", height: "100%" }} />
            </Pressable>
            { showPhotoPopup &&
                <PhotoModal>
                    <PhotoPopup onClose={setShowPhotoPopup} photoSrc={photo.image_url} exif={null}
                                children={undefined}>
                    </PhotoPopup>
                </PhotoModal>
            }
        </>

    )
}