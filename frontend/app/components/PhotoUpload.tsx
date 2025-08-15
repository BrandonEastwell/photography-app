import {View, Text, Platform} from "react-native";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import * as ImagePicker from 'expo-image-picker';
import {ImagePickerAsset} from "expo-image-picker";
import {ExifData} from "@/app/lib/Types";
import ExifForm from "@/app/components/ExifForm";
import Constants from 'expo-constants';
import AuthService from "@/app/lib/AuthService";
import {router} from "expo-router";
import PhotoCardContent from "@/app/components/PhotoCardContent";
import PhotoModal from "@/app/components/PhotoModal";
import AnimatedButton from "@/app/components/AnimatedButton";
import {useMessage} from "@/app/lib/MessagingContext";
import {useAuth} from "@/app/lib/AuthContext";
import * as FileSystem from 'expo-file-system';
import {getReqHeaders} from "@/app/lib/Helpers";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

const emptyExifData: ExifData = {
    Make: undefined,
    Model: undefined,
    LensModel: undefined,
    FocalLength: undefined,
    Flash: undefined,
    FNumber: undefined,
    GPSLatitude: undefined,
    GPSLongitude: undefined,
    ISOSpeedRatings: undefined,
    ShutterSpeedValue: undefined,
};

export default function PhotoUpload({ setShowUpload } : { setShowUpload: Dispatch<SetStateAction<boolean>> }) {
    const [imageUpload, setImageUpload] = useState<ImagePickerAsset | undefined>(undefined);
    const [exif, setExif] = useState<ExifData>(emptyExifData);
    const [showExifForm, setShowExifForm] = useState<boolean>(false)
    const [showCard, setShowCard] = useState<boolean>(false)
    const { setMessage } = useMessage()
    const { isAuthenticated, setAuthUserPhotos, authUserPhotos } = useAuth()

    useEffect(() => {
        pickImageAsync()
    }, []);

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            exif: true,
            quality: 1
        });

        if (result.canceled) {
            setMessage({ message: "Upload cancelled", error: false })
            setShowUpload(false)
        } else {
            let image = result.assets[0]
            if (!image.fileSize || image.fileSize > 50000000) {
                setMessage({ message: "Photo over 50MB limit", error: true })
                return setShowUpload(false)
            }

            const exifData = { Make: image.exif?.Make, Model: image.exif?.Model,
                LensModel: image.exif?.LensModel, FocalLength: image.exif?.FocalLength, Flash: image.exif?.Flash,
                FNumber: image.exif?.FNumber, ISOSpeedRatings: image.exif?.ISOSpeedRatings,
                ShutterSpeedValue: image.exif?.ShutterSpeedValue, GPSLatitude: image.exif?.GPSLatitude,
                GPSLongitude: image.exif?.GPSLongitude }

            setExif(exifData)
            setImageUpload(image)
            setShowExifForm(true)
            if (image) setShowCard(true)
        }
    }

    const uploadBtnOnClick = async () => {
        if (!imageUpload) return
        const formData = new FormData();

        if (Platform.OS === "web" && imageUpload.file) {
            formData.append("image", imageUpload.file, imageUpload.file.name);
        } else {
            const fileName =
                imageUpload.fileName ||
                imageUpload.uri.split("/").pop() ||
                `upload_${Date.now()}.jpg`;

            formData.append("image", {
                uri: imageUpload.uri,
                name: fileName,
                type: imageUpload.fileName?.endsWith('.png') ? 'image/png' : 'image/jpeg'
            } as any);
        }

        if (exif) {
            Object.entries(exif).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });
        }
        await uploadPhoto(formData)
    }

    const uploadPhoto = async (formData: FormData) => {
        const isLoggedIn = await isAuthenticated()
        if (!isLoggedIn) return router.push("/auth/login")

        let res = await postPhoto(formData)
        let data = await res.json()

        if (!data.success) {
            if (data.error == "Token expired") {
                const refreshed = await AuthService.refreshAuthToken()
                if (!refreshed) return router.replace("/auth/login")

                res = await postPhoto(formData)
                data = res.json()

                if (data.success) return setMessage({ message: data.message, error: false })
            }
            return setMessage({ message: data.error, error: true })
        }

        const newUserPhotos = authUserPhotos ? [ ...authUserPhotos, data.image] : [ data.image ]
        setAuthUserPhotos(newUserPhotos)
        setMessage({ message: data.message, error: false })
        setShowUpload(false)
    }
    
    async function postPhoto(formData: FormData) {
        const headers = await getReqHeaders()
        if (Platform.OS === "web") {
            return await fetch(`${apiUrl}/api/media/photos`, {
                method: "POST",
                body: formData,
                headers,
                credentials: "include",
            })
        }

        return await fetch(`${apiUrl}/api/media/photos`, {
            method: "POST",
            body: formData,
            headers
        })
    }

    return (
        <PhotoModal>
            { imageUpload && showExifForm &&
                <ExifForm setExif={setExif} exif={exif} onSubmit={() => setShowExifForm(false)} onClose={() => setShowExifForm(false)} formMode={"Photo"} />
            }
            { imageUpload && showCard && !showExifForm &&
                <PhotoCardContent onClose={setShowUpload} photoSrc={imageUpload.uri} exif={exif} profile={null}
                                  userId={null} showCard={showCard}>
                    <View style={{ flexDirection: "row", gap: 15, alignItems: "center", justifyContent: "center" }}>
                        <AnimatedButton onClick={uploadBtnOnClick} defaultBgColor={'transparent'}>
                            <Text style={{ color: 'white', fontFamily: "SpaceMono-Regular" }}>Upload</Text>
                        </AnimatedButton>
                        <AnimatedButton onClick={() => setShowExifForm(true)} defaultBgColor={"transparent"}>
                            <Text style={{ color: 'white', fontFamily: "SpaceMono-Regular" }}>Go Back</Text>
                        </AnimatedButton>
                    </View>
                </PhotoCardContent>
            }
        </PhotoModal>
    )
}