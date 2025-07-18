import {Modal, Pressable, View, Text, Platform} from "react-native";
import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {ImagePickerAsset} from "expo-image-picker";
import {ExifData} from "@/app/lib/Types";
import ExifForm from "@/app/components/ExifForm";
import Constants from 'expo-constants';
import * as SecureStore from "expo-secure-store";
import AuthService from "@/app/lib/AuthService";
import {router} from "expo-router";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function PhotoUpload({ setShowUpload } : { setShowUpload: Dispatch<SetStateAction<boolean>>  }) {
    const [imageUpload, setImageUpload] = useState<ImagePickerAsset | undefined>(undefined);
    const [exif, setExif] = useState<ExifData | undefined>(undefined);
    const [showExifForm, setShowExifForm] = useState<boolean>(false)
    const exifRef = useRef(exif)
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

            exifRef.current = { Make: image.exif?.Make, Model: image.exif?.Model,
                LensModel: image.exif?.LensModel, FocalLength: image.exif?.FocalLength, Flash: image.exif?.Flash,
                FNumber: image.exif?.FNumber, ISOSpeedRatings: image.exif?.ISOSpeedRatings,
                ShutterSpeedValue: image.exif?.ShutterSpeedValue, GPSLatitude: image.exif?.GPSLatitude,
                GPSLongitude: image.exif?.GPSLongitude }

            setExif(exifRef.current)
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
        const isUserLoggedIn = await AuthService.isUserLoggedIn()
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
        <Modal visible={!!imageUpload} transparent>
            <View style={{ position: "absolute", padding: 5, paddingHorizontal: 20,
                borderRadius: 15, flexDirection: "row", gap: 10, zIndex: 100, width: "100%", justifyContent: "flex-end", alignItems: "flex-end"}}>
                <Text onPress={() => setShowUpload(false)} style={{ color: 'white', fontFamily: "BethEllen-Regular", fontSize: 20 }}>X</Text>
            </View>
            <View style={{backgroundColor: 'rgba(0,0,0,0.70)', height: "95vh", flexDirection: "column", gap: 15, justifyContent: "center",
                alignItems: "center"}}>
                <View style={{ width: 320, height: 540, backgroundColor: 'rgba(12,12,12,0.94)', borderRadius: 15, marginHorizontal: "auto" }}>
                    { imageUpload && <Image style={{ width: "100%", height: "100%", borderRadius: 15 }} source={imageUpload.uri}></Image> }
                </View>
                { imageUpload && showExifForm &&
                    <ExifForm setExif={setExif} exif={exif} initExif={exifRef.current} onSubmit={() => setShowExifForm(false)} />
                }
                { imageUpload && !showExifForm &&
                    <>
                        <View style={{ flexDirection: "row", gap: 15, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                            { exif && Object.entries(exif).map(([key, value]) => { if (value !== undefined) {
                                    return (
                                        <View key={key} style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 }}>
                                            <Text style={{ color: "white" }}>{key}</Text>
                                            <View style={{ backgroundColor: 'rgb(227,227,227)', borderRadius: 6, padding: 5 }}>
                                                <Text style={{  }}>{value}</Text>
                                            </View>
                                        </View>
                                    )
                                }})}
                            { !exif && <Text style={{ color: 'black', fontFamily: "SpaceMono-Regular", }}>Cancel Upload</Text> }
                                </View>
                        <Pressable onPress={uploadBtnOnClick} style={{ backgroundColor: '#3091fc', padding: 10, paddingHorizontal: 20,
                            borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 20}}>
                            <Text style={{ color: 'white', fontFamily: "SpaceMono-Regular" }}>Upload Photo</Text>
                        </Pressable>
                        <Pressable onPress={() => setShowExifForm(true)} style={{ backgroundColor: "#ffffff", padding: 10, paddingHorizontal: 20,
                            borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{ color: 'black', fontFamily: "SpaceMono-Regular", }}>Go Back</Text>
                        </Pressable>
                        {error && (
                            <Text style={{ color: 'red', alignSelf: 'center', marginBottom: 20, fontFamily: "SpaceMono-Regular" }}>{error}</Text>
                        )}
                        {message && (
                            <Text style={{ color: '#3091fc', alignSelf: 'center', marginBottom: 20, fontFamily: "SpaceMono-Regular" }}>{message}</Text>
                        )}
                    </>
                }
            </View>
        </Modal>
    )
}