import {Modal, Pressable, View, Text, Platform} from "react-native";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import * as ImagePicker from 'expo-image-picker';
import {ImagePickerAsset} from "expo-image-picker";
import {ExifData} from "@/app/lib/Types";
import ExifForm from "@/app/components/ExifForm";
import Constants from 'expo-constants';
import * as SecureStore from "expo-secure-store";
import AuthService from "@/app/lib/AuthService";
import {router} from "expo-router";
import PhotoCardContent from "@/app/components/PhotoCardContent";
import PhotoModal from "@/app/components/PhotoModal";
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
    const [error, setError] = useState<string | undefined>(undefined)
    const [message, setMessage] = useState<string | undefined>(undefined)

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

        if (result.canceled) setShowUpload(false)
        else {
            let image = result.assets[0]
            if (!image.fileSize || image.fileSize > 1048576) return
            console.log('EXIF:', image.exif);

            const exifData = { Make: image.exif?.Make, Model: image.exif?.Model,
                LensModel: image.exif?.LensModel, FocalLength: image.exif?.FocalLength, Flash: image.exif?.Flash,
                FNumber: image.exif?.FNumber, ISOSpeedRatings: image.exif?.ISOSpeedRatings,
                ShutterSpeedValue: image.exif?.ShutterSpeedValue, GPSLatitude: image.exif?.GPSLatitude,
                GPSLongitude: image.exif?.GPSLongitude }

            setExif(exifData)
            setImageUpload(image)
            setShowExifForm(true)
        }
    }

    const uploadBtnOnClick = async () => {
        if (!imageUpload) return
        const formData = new FormData();

        if (Platform.OS === "web" && imageUpload.file) {
            formData.append("image", imageUpload.file, imageUpload.file.name);
        } else {
            // @ts-ignore
            formData.append('image', {
                uri: imageUpload.uri,
                name: imageUpload.fileName,
                type: imageUpload.type
            })
        }

        if (exif) Object.entries(exif).map(([key, value]) => formData.append(key, value))
        await uploadPhoto(formData)
    }

    const uploadPhoto = async (formData: FormData) => {
        const isUserLoggedIn = await AuthService.isTokenExpired()
        if (!isUserLoggedIn) {
            const refreshed = await AuthService.refreshAuthToken()
            if (!refreshed) return router.replace("/auth/login")
        }

        let res = await postPhoto(formData)
        let data = await res.json()

        if (!data.success) {
            if (data.error == "Token expired") {
                const refreshed = await AuthService.refreshAuthToken()
                if (!refreshed) return router.replace("/auth/login")

                res = await postPhoto(formData)
                data = res.json()

                if (!data.success) throw new Error("Upload failed after refresh");
            }
            return setError(data.error)
        }

        setMessage(data.message)
        setTimeout(() => {
            setShowUpload(false)
        }, 2000)
    }
    
    async function postPhoto(formData: any) {
        const headers: Record<string, string> = {"Platform": Platform.OS}

        if (Platform.OS !== "web") {
            const token = await SecureStore.getItemAsync("auth_token") as string
            headers['Authorization'] = `Bearer ${token}`
        }

        return await fetch(`${apiUrl}/api/media/photos`, {
            method: "POST",
            body: formData,
            headers,
            credentials: "include",
        })
    }

    return (
        <PhotoModal>
            { imageUpload && showExifForm &&
                <ExifForm setExif={setExif} exif={exif} onSubmit={() => setShowExifForm(false)} onClose={() => setShowExifForm(false)} formMode={"Photo"} />
            }
            { imageUpload && !showExifForm &&
                <PhotoCardContent onClose={setShowUpload} photoSrc={imageUpload.uri} exif={exif} profile={null} userId={null}>
                    <View style={{ flexDirection: "row", gap: 15, alignItems: "center", justifyContent: "center" }}>
                        <Pressable onPress={uploadBtnOnClick} style={{ backgroundColor: '#3091fc', padding: 10, borderRadius: 15 }}>
                            <Text style={{ color: 'white', fontFamily: "SpaceMono-Regular" }}>Upload</Text>
                        </Pressable>
                        <Pressable onPress={() => setShowExifForm(true)} style={{ backgroundColor: "#ffffff", padding: 10, borderRadius: 15 }}>
                            <Text style={{ color: 'black', fontFamily: "SpaceMono-Regular" }}>Go Back</Text>
                        </Pressable>
                    </View>
                    {error && (
                        <Text style={{ color: 'red', alignSelf: 'center', marginBottom: 30, fontFamily: "SpaceMono-Regular" }}>{error}</Text>
                    )}
                    {message && (
                        <Text style={{ color: '#3091fc', alignSelf: 'center', marginBottom: 30, fontFamily: "SpaceMono-Regular" }}>{message}</Text>
                    )}
                </PhotoCardContent>
            }
        </PhotoModal>
    )
}