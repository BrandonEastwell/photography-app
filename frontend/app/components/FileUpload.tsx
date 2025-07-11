import {Entypo, Feather} from "@expo/vector-icons";
import { Modal, Pressable, View, Text } from "react-native";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {ImagePickerAsset} from "expo-image-picker";

export default function FileUpload() {
    const [showUpload, setShowUpload] = useState(false)
    const [imageUpload, setImageUpload] = useState<ImagePickerAsset | undefined>(undefined)
    const [exif, setExif] = useState<Record<string, any> | null>(null);

    function clickHandler() {
        setShowUpload((prevState) => !prevState)
    }

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            exif: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUpload(result.assets[0])
            setExif(result.assets[0].exif || null);
            console.log('EXIF:', result.assets[0].exif);
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
        <>
            <Pressable onPress={clickHandler} style={{ justifyContent: 'center', alignItems: 'center', flex: 1, padding: 5 }}>
                <Entypo name="circle-with-plus" size={24} color="#ffffff" />
            </Pressable>

            <Modal visible={showUpload} transparent onRequestClose={() => setShowUpload(false)}>
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
        </>
    )
}
