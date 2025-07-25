import {Pressable, Text, View} from "react-native";
import LocationInput from "@/app/components/LocationInput";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import * as yup from "yup";
import {ExifData, ExifDataError, ExifField} from "@/app/lib/Types";
import InputField from "@/app/components/InputField";
import Constants from "expo-constants";
import AntDesign from "@expo/vector-icons/AntDesign";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

const exifSchema = yup.object().shape({
    Make: yup.string().typeError("Must be a string"),
    Model: yup.string().typeError("Must be a string"),
    LensModel: yup.string().typeError("Must be a string"),
    FocalLength: yup.number().typeError("Must be a number"),
    Flash: yup.string(),
    FNumber: yup.number().typeError("Must be a number"),
    ISOSpeedRatings: yup.number().typeError("Must be a number"),
    ShutterSpeedValue: yup.number().typeError("Must be a number")
});

const defaultExifDataError: ExifDataError = {
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

const exifFormFields: ExifField = {
    Make: { editable: true, type: "Dropdown", zIndex: 10 },
    Model: { editable: true, type: "Dropdown", zIndex: 20 },
    LensModel: { editable: true, type: "Text", zIndex: 0 },
    FocalLength: {editable: true, type: "Text", zIndex: 0 },
    Flash: { editable: false,  type: "Dropdown",  zIndex: 10 },
    FNumber: { editable: true,  type: "Text",  zIndex: 0 },
    ISOSpeedRatings: { editable: true,  type: "Text",  zIndex: 0 },
    ShutterSpeedValue: { editable: true,  type: "Text",  zIndex: 0 },
}

export default function ExifForm({ setExif, exif, onSubmit, formMode, onClose } : {
    setExif: Dispatch<SetStateAction<ExifData | null>>;
    exif: ExifData;
    onSubmit: () => void;
    onClose: () => void;
    formMode: "Filtering" | "Photo"
}) {
    const [errors, setErrors] = useState<ExifDataError>(defaultExifDataError);
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

    const validateField = async (field: keyof ExifData, value: string | React.ChangeEvent<any>) => {
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

    const onExifFieldChange = async (field: keyof ExifData, value: string | React.ChangeEvent<any>) => {
        setExif(prevState => ({...prevState, [field]: value !== "" ? value : undefined}))
        value !== "" && await validateField(field, value)

        const firstError = Object.entries(errors).find(([field, error]) => error !== undefined)

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
        cameraMakes && cameraModels && (
            <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: 'rgba(12,12,12,0.90)', justifyContent: "center", zIndex: 100 }}>
                <View style={{ width: "100%", height: "100%", maxWidth: 430, padding: 30, flexDirection: "column", justifyContent: "center", marginHorizontal: "auto" }}>
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ padding: 7.5, borderRadius: 15, flexDirection: "row", gap: 10, zIndex: 100, width: "100%", justifyContent: "flex-end" }}>
                            <AntDesign onPress={onClose} name="close" size={24} color="white" />
                        </View>
                        <Text style={{ fontSize: 24, marginBottom: 10, fontFamily: "SpaceMono-Regular", color: 'rgba(229,229,229,0.97)'}}>
                            { formMode === "Photo" ? "Add Missing Attributes" : "Search Filters" }</Text>
                        { formMode == "Photo" && <Text style={{ fontSize: 16, fontFamily: "SpaceMono-Regular",
                            color: 'rgba(229,229,229,0.97)'}}>These attributes help your photo appear in more search results.</Text> }
                    </View>

                    <LocationInput setExif={setExif}></LocationInput>


                    <InputField placeholder="Camera Model" onChangeText={(text) => onExifFieldChange("Model", text)}
                                value={exif.Model ?? ''} items={cameraModels} zIndex={10} editable={true}
                                error={errors.Model} type={"Dropdown"} />

                    <InputField placeholder="Lens Model" onChangeText={(text) => onExifFieldChange("LensModel", text)}
                                value={exif.LensModel ?? ''} error={errors.LensModel} items={[]} editable={true}
                                type={"Text"} zIndex={0} />

                    <InputField placeholder="Focal Length" onChangeText={(text) => onExifFieldChange("FocalLength", text)}
                                value={exif.FocalLength ?? ''} error={errors.FocalLength} items={[]} editable={true}
                                type={"Text"} zIndex={0} />

                    <InputField placeholder="Flash" onChangeText={(text) => onExifFieldChange("Flash", text)}
                                value={exif.Flash ?? ''} items={["Yes", "No"]} zIndex={10} editable={false}
                                error={errors.Flash} type={"Dropdown"} />

                    <InputField placeholder="FNumber" onChangeText={(text) => onExifFieldChange("FNumber", text)}
                                value={exif.FNumber ?? ''} error={errors.FNumber} items={[]} editable={true}
                                type={"Text"} zIndex={0} />

                    <InputField placeholder="ISO Speed" onChangeText={(text) => onExifFieldChange("ISOSpeedRatings", text)}
                                value={exif.ISOSpeedRatings ?? ''} error={errors.ISOSpeedRatings} items={[]} editable={true}
                                type={"Text"} zIndex={0} />

                    <InputField placeholder="Shutter Speed" onChangeText={(text) => onExifFieldChange("ShutterSpeedValue", text)}
                                value={exif.ShutterSpeedValue ?? ''} error={errors.ShutterSpeedValue} items={[]} editable={true}
                                type={"Text"} zIndex={0} />

                    <Pressable onPress={onFormSubmit} style={{ backgroundColor: "#ffffff", padding: 10, paddingHorizontal: 20,
                        borderRadius: 15, flexDirection: "row", gap: 10, justifyContent: "center", alignItems: "center", marginTop: 20}}>
                        <Text style={{ color: 'black' }}>{ formMode === "Photo" ? "Preview Photo" : "Search Photos" }</Text>
                    </Pressable>
                </View>
            </View>
        )
    )
}