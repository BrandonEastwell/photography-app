import {Pressable, Text, View} from "react-native";
import LocationInput from "@/app/components/LocationInput";
import ExifInputField from "@/app/components/ExifInputField";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import * as yup from "yup";
import {ExifData, ExifDataErrors} from "@/app/lib/Types";
import MultiSelectInput from "@/app/components/MultiSelectInput";
import Constants from "expo-constants";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

const exifSchema = yup.object().shape({
    Make: yup.string(),
    Model: yup.string(),
    LensModel: yup.string(),
    FocalLength: yup.string(),
    Flash: yup.string(),
    FNumber: yup.string(),
    ISOSpeedRatings: yup.string(),
    ShutterSpeedValue: yup.string()
});

export default function ExifForm({ setExif, initExif, exif, onSubmit } : {
    setExif: Dispatch<SetStateAction<ExifData | undefined>>;
    initExif: ExifData | undefined;
    exif: ExifData | undefined;
    onSubmit: () => void;
}) {
    const [errors, setErrors] = useState<ExifDataErrors | undefined>(undefined);
    const [cameraMakes, setCameraMakes] = useState<string[] | null>(null)
    const [cameraModels, setCameraModels] = useState<string[] | null>(null)

    useEffect(() => {
        const getCameras = async () => {
            const res = await fetch(`${apiUrl}/api/media/cameras`, {
                method: "GET"
            })

            const data = await res.json()
            if (data.items && data.items > 0) {
                const filtered = data.results.filter((item: { model: string; make: string; }) =>
                    item.model !== "undefined" && item.make !== "undefined")
                const cameraMakes = filtered.map((camera: { make: string; }) => camera.make)
                const cameraModels = filtered.map((camera: { model: string; }) => camera.model)
                setCameraMakes(Array.from(new Set<string>(cameraMakes)))
                setCameraModels(Array.from(new Set<string>(cameraModels)))
            }
        }

        getCameras()
    }, []);

    const validateField = async (field: string, value: string | React.ChangeEvent<any>) => {
        try {
            const fieldSchema = exifSchema.fields[field as keyof typeof exifSchema.fields] as yup.Schema
            await fieldSchema.validate(value)
            setErrors(prev => ({ ...prev, [field]: undefined }));
            return true
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                setErrors(prev => ({ ...prev, [field]: error.message }));
            }
            return false
        }
    }

    const onExifFieldChange = async (field: string, value: string | React.ChangeEvent<any>) => {
        setExif(prevState => ({...prevState, [field]: value}))
        await validateField(field, value)
    }

    const onFormSubmit = async () => {
        try {
            await exifSchema.validate(exif)
            onSubmit()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: 'rgba(12,12,12,0.80)', justifyContent: "center" }}>
            <View style={{ width: "100%", height: "100%", maxWidth: 430, padding: 30, flexDirection: "column", justifyContent: "center", marginHorizontal: "auto" }}>
                <Text style={{ fontSize: 24, marginBottom: 10, fontFamily: "SpaceMono-Regular",
                    color: 'rgba(229,229,229,0.97)'}}>Add Missing Attributes</Text>
                <Text style={{ fontSize: 16, marginBottom: 40, fontFamily: "SpaceMono-Regular",
                    color: 'rgba(229,229,229,0.97)'}}>These attributes help your photo appear in more search results.</Text>

                { (initExif?.GPSLatitude === undefined || initExif?.GPSLongitude === undefined)  &&
                    <LocationInput setExif={setExif}></LocationInput>
                }

                { initExif?.Make === undefined && cameraMakes && <MultiSelectInput placeholder="Camera Make"
                                                                                   onChangeText={(text) => onExifFieldChange("Make", text)}
                                                                                   value={exif?.Make ?? ''}
                                                                                   error={errors?.Make}
                                                                                   items={cameraMakes} zIndex={20} /> }

                { initExif?.Model === undefined && cameraModels && <MultiSelectInput placeholder="Camera Model"
                                                                                     onChangeText={(text) => onExifFieldChange("Model", text)}
                                                                                     value={exif?.Model ?? ''}
                                                                                     error={errors?.Model}
                                                                                     items={cameraModels} zIndex={10} /> }

                { initExif?.LensModel === undefined && <ExifInputField placeholder="Lens Model"
                                                                               onChangeText={(text) => onExifFieldChange("LensModel", text)}
                                                                               value={exif?.LensModel ?? ''}
                                                                               error={errors?.LensModel} /> }

                { initExif?.FocalLength === undefined && <ExifInputField placeholder="Focal Length"
                                                                                 onChangeText={(text) => onExifFieldChange("FocalLength", text)}
                                                                                 value={exif?.FocalLength ?? ''}
                                                                                 error={errors?.FocalLength} /> }

                { initExif?.Flash === undefined && <ExifInputField placeholder="Flash"
                                                                           onChangeText={(text) => onExifFieldChange("Flash", text)}
                                                                           value={exif?.Flash ?? ''}
                                                                           error={errors?.Flash} /> }

                { initExif?.FNumber === undefined && <ExifInputField placeholder="FNumber"
                                                                             onChangeText={(text) => onExifFieldChange("FNumber", text)}
                                                                             value={exif?.FNumber ?? ''}
                                                                             error={errors?.FNumber} /> }

                { initExif?.ISOSpeedRatings === undefined && <ExifInputField placeholder="ISO Speed"
                                                                             onChangeText={(text) => onExifFieldChange("ISOSpeedRating", text)}
                                                                             value={exif?.ISOSpeedRatings ?? ''}
                                                                             error={errors?.ISOSpeedRatings} /> }

                { initExif?.ShutterSpeedValue === undefined && <ExifInputField placeholder="Shutter Speed"
                                                                               onChangeText={(text) => onExifFieldChange("ShutterSpeedValue", text)}
                                                                               value={exif?.ShutterSpeedValue ?? ''}
                                                                               error={errors?.ShutterSpeedValue} /> }

                <Pressable onPress={onFormSubmit} style={{ backgroundColor: "#ffffff", padding: 10, paddingHorizontal: 20,
                    borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 20}}>
                    <Text style={{ color: 'black' }}>Preview Photo</Text>
                </Pressable>
            </View>
        </View>
    )
}