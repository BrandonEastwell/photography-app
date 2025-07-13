import {Entypo, Feather} from "@expo/vector-icons";
import { Modal, Pressable, View, Text } from "react-native";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {ImagePickerAsset} from "expo-image-picker";

export default function FileUpload({ showUpload } : { showUpload: boolean }) {
    const [imageUpload, setImageUpload] = useState<ImagePickerAsset | undefined>(undefined)
    const [exif, setExif] = useState<Record<string, any> | null>(null);
    const [error, setError] = useState<string | null>(null)

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            exif: true,
            quality: 1,
        });

        if (!result.canceled) {
            let image = result.assets[0]
            if (!image.fileSize || image.fileSize > 1048576) return setError("Image size exceeds limit (10MB)")
            // Check for location in exif
            // Check other exif data like cam make and model
            setImageUpload(image)
            setExif(image.exif || null);
            console.log('EXIF:', image.exif);
        }
    }

    const uploadPhoto = async () => {
        const formData = new FormData();
        formData.append('image', {
            uri: imageUpload?.uri,
            name: imageUpload?.fileName
        })

        let result = await fetch("http://127.0.0.1:8000/api/media/photos", {
            method: "POST",
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    return (
        <Modal visible={showUpload} transparent>
            <View style={{backgroundColor: 'rgba(0,0,0,0.70)', minHeight: "95vh", flexDirection: "column", gap: 15, justifyContent: "center", alignItems: "center"}}>
                <View style={{ width: 320, height: 540, backgroundColor: 'rgba(12,12,12,0.94)', borderRadius: 15, marginHorizontal: "auto" }}>
                    { imageUpload && <Image style={{ width: "100%", height: "100%", borderRadius: 15 }} source={imageUpload.uri}></Image> }
                </View>
                <View style={{ flexDirection: "column", gap: 15, marginHorizontal: "auto" }}>
                    <Pressable onPress={pickImageAsync} style={{ backgroundColor: "#ffffff", padding: 12, paddingHorizontal: 40, borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center"}}>
                        <Feather name="upload" size={24} color="black" />
                        <Text style={{ color: 'black' }}>Upload a photo</Text>
                    </Pressable>
                    { imageUpload &&
                        <Pressable onPress={uploadPhoto} style={{ backgroundColor: "#ffffff", padding: 10, paddingHorizontal: 20, borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{ color: 'black' }}>Add photo</Text>
                        </Pressable> }
                </View>
            </View>
        </Modal>
    )
}
