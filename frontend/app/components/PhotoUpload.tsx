import {Modal, Pressable, View, Text} from "react-native";
import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {ImagePickerAsset} from "expo-image-picker";
import {ExifData} from "@/app/lib/Types";
import ExifForm from "@/app/components/ExifForm";


export default function PhotoUpload({ setShowUpload } : { setShowUpload: Dispatch<SetStateAction<boolean>>  }) {
    const [imageUpload, setImageUpload] = useState<ImagePickerAsset | undefined>(undefined);
    const [exif, setExif] = useState<ExifData | undefined>(undefined);
    const [showExifForm, setShowExifForm] = useState<boolean>(false)
    const exifRef = useRef(exif)

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

    return (
        <Modal visible={!!imageUpload} transparent>
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
                                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 }}>
                                            <Text style={{ color: "white" }}>{key}</Text>
                                            <View style={{ backgroundColor: 'rgb(227,227,227)', borderRadius: 6, padding: 5 }}>
                                                <Text style={{  }}>{value}</Text>
                                            </View>
                                        </View>
                                    )
                                }})}
                        </View>
                        <Pressable onPress={uploadPhoto} style={{ backgroundColor: "#ffffff", padding: 10, paddingHorizontal: 20,
                            borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 20}}>
                            <Text style={{ color: 'black' }}>Upload Photo</Text>
                        </Pressable>
                    </>
                }
            </View>
        </Modal>
    )
}