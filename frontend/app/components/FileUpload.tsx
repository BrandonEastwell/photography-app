import { Modal, Pressable, View, Text } from "react-native";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {ImagePickerAsset} from "expo-image-picker";
import * as Location from 'expo-location';
import LocationPicker from "@/app/components/LocationPicker";

interface ExifData {
    Make?: string,
    Model?: string,
    LensModel?: string,
    FocalLength?: number,
    Flash?: boolean,
    FNumber?: string,
    GPSLatitude?: number,
    GPSLongitude?: number,
    ISOSpeedRatings?: string,
    ShutterSpeedValue?: string,
    DateTimeOriginal?: string,
    ExifImageWidth?: string,
    ExifImageHeight?: string
}

export default function FileUpload({ setShowUpload } : { setShowUpload: Dispatch<SetStateAction<boolean>>  }) {
    const [imageUpload, setImageUpload] = useState<ImagePickerAsset | undefined>(undefined);
    const [showMap, setShowMap] = useState<boolean>(false);
    const [exif, setExif] = useState<ExifData | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

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
            if (!image.fileSize || image.fileSize > 1048576) return setError("Image size exceeds limit (10MB)")
            setImageUpload(image)

            console.log('EXIF:', image.exif);
            setExif((prevState) => ({ ...prevState, GPSLatitude: image.exif?.GPSLatitude, GPSLongitude: image.exif?.GPSLongitude }))
            console.log(exif)
        }
    }

    const uploadPhoto = async () => {
        if (imageUpload) {
            const formData = new FormData();
            formData.append('image', {
                uri: imageUpload.uri,
                name: imageUpload.fileName,
                type: imageUpload.type
            })

            let result = await fetch("http://127.0.0.1:8000/api/media/photos", {
                method: "POST",
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        }
    }

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "denied") return;
        const location = await Location.getCurrentPositionAsync();
        setExif((prevState) => ({ ...prevState, GPSLatitude: location.coords.latitude, GPSLongitude: location.coords.longitude }))
    }

    return (
        <Modal visible={!!imageUpload} transparent>
            <View style={{backgroundColor: 'rgba(0,0,0,0.70)', height: "95vh", flexDirection: "column", gap: 15, justifyContent: "center", alignItems: "center"}}>
                <View style={{ width: 320, height: 540, backgroundColor: 'rgba(12,12,12,0.94)', borderRadius: 15, marginHorizontal: "auto" }}>
                    { imageUpload && <Image style={{ width: "100%", height: "100%", borderRadius: 15 }} source={imageUpload.uri}></Image> }
                </View>
                {imageUpload &&
                    <View style={{ flexDirection: "column", gap: 15, marginHorizontal: "auto" }}>
                        {!exif?.GPSLatitude || !exif?.GPSLongitude &&
                            <View style={{ flexDirection: "row", gap: 15 }}>
                                <Pressable onPress={getCurrentLocation} style={{ backgroundColor: "#ffffff", padding: 10, paddingHorizontal: 20, borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center"}}>
                                    <Text style={{ color: 'black' }}>Use current location</Text>
                                </Pressable>
                                <Pressable onPress={() => setShowMap(true)} style={{ backgroundColor: "#ffffff", padding: 10, paddingHorizontal: 20, borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center"}}>
                                    <Text style={{ color: 'black' }}>Select location</Text>
                                </Pressable>
                            </View>
                        }

                        <Pressable onPress={uploadPhoto} style={{ backgroundColor: "#ffffff", padding: 10, paddingHorizontal: 20, borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{ color: 'black' }}>Add photo</Text>
                        </Pressable>
                    </View>
                }
            </View>
            { showMap && <LocationPicker /> }
        </Modal>
    )
}
