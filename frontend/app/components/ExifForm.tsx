import {Text, View} from "react-native";
import LocationInput from "@/app/components/LocationInput";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import * as yup from "yup";
import {ExifData, ExifDataError, ExifFieldProperties, ExifFields} from "@/app/lib/Types";
import InputField from "@/app/components/InputField";
import Constants from "expo-constants";
import AntDesign from "@expo/vector-icons/AntDesign";
import AnimatedButton from "@/app/components/AnimatedButton";
import {EMPTY_EXIF_DATA} from "@/app/lib/Constants";
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

const initExifFormFields: ExifFields = {
    Make: { editable: true, type: "Dropdown", zIndex: 20, items: [], placeholder: "Camera Make" },
    Model: { editable: true, type: "Dropdown", zIndex: 10, items: [], placeholder: "Camera Model" },
    LensModel: { editable: true, type: "Text", zIndex: 0, items: [], placeholder: "Lens" },
    FocalLength: {editable: true, type: "Text", zIndex: 0, items: [], placeholder: "Focal Length" },
    Flash: { editable: false,  type: "Dropdown",  zIndex: 10 , items: ["Yes", "No"], placeholder: "Flash" },
    FNumber: { editable: true,  type: "Text",  zIndex: 0, items: [], placeholder: "FNumber" },
    ISOSpeedRatings: { editable: true,  type: "Text",  zIndex: 0, items: [], placeholder: "ISO Speed" },
    ShutterSpeedValue: { editable: true,  type: "Text",  zIndex: 0, items: [], placeholder: "Shutter Speed" },
}

export default function ExifForm({ setExif, exif, onSubmit, formMode, onClear, onClose } : {
    setExif: Dispatch<SetStateAction<ExifData>>;
    exif: ExifData;
    onSubmit: (exif?: ExifData) => void;
    onClear?: () => void;
    onClose: () => void;
    formMode: "Filtering" | "Photo"
}) {
    const [errors, setErrors] = useState<ExifDataError>(defaultExifDataError);
    const [exifFormFields, setExifFormFields] = useState<ExifFields>(initExifFormFields);
    const [currentErrorField, setCurrentErrorField] = useState<keyof ExifFields | null>(null);
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        const getCameras = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/media/cameras`, {
                    method: "GET"
                })

                const data = await res.json()
                if (data.items && data.items > 0) {
                    const filtered = data.results.filter((item: { model: string; make: string; }) =>
                        item.model !== "undefined" && item.make !== "undefined")

                    const cameraMakes = filtered.map((camera: { make: string; }) => camera.make)
                    const cameraModels = filtered.map((camera: { model: string; }) => camera.model)

                    setExifFormFields(prev => ({
                        ...prev,
                        Make: { ...prev.Make, items: Array.from(new Set<string>(cameraMakes)) } as ExifFieldProperties,
                        Model: { ...prev.Model, items: Array.from(new Set<string>(cameraModels)) } as ExifFieldProperties,
                    }))
                }
            } catch (e) {
                console.error(e)
            }

            setLoading(true)
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
        value !== "" ? await validateField(field, value) : setErrors(prev => ({ ...prev, [field]: undefined }));

        const firstError = Object.entries(errors).find(([field, error]) => error !== undefined)
        if (firstError) setCurrentErrorField(firstError[0] as keyof ExifFields);
    }

    const onFormSubmit = async () => {
        try {
            await exifSchema.validate(exif)
            await onSubmit()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        loading && (
            <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: 'rgba(12,12,12,0.90)', justifyContent: "center", zIndex: 100 }}>
                <View style={{ width: "100%", height: "100%", maxWidth: 430, padding: 30, flexDirection: "column", justifyContent: "center", marginHorizontal: "auto" }}>
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ padding: 7.5, borderRadius: 15, flexDirection: "row", gap: 10, zIndex: 100, width: "100%", justifyContent: "flex-end" }}>
                            <AntDesign hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
                                       onPress={onClose} name="close" size={24} color="white" />
                        </View>
                        <Text style={{ fontSize: 24, marginBottom: 10, fontFamily: "SpaceMono-Regular", color: 'rgba(229,229,229,0.97)'}}>
                            { formMode === "Photo" ? "Add Missing Attributes" : "Search Filters" }</Text>
                        { formMode == "Photo" && <Text style={{ fontSize: 16, fontFamily: "SpaceMono-Regular",
                            color: 'rgba(229,229,229,0.97)'}}>These attributes help your photo appear in more search results.</Text> }
                    </View>

                    {/*<LocationInput setExif={setExif}></LocationInput>*/}

                    { Object.entries(exif).map(([field]) => {
                        if (field in exifFormFields) {
                            return <InputField key={field}
                                placeholder={exifFormFields[field as keyof ExifData]?.placeholder ?? ""}
                                onChangeText={(text) => onExifFieldChange(field as keyof ExifData, text)}
                                value={exif[field as keyof ExifData] ?? ''}
                                items={exifFormFields[field as keyof ExifData]?.items ?? []}
                                zIndex={exifFormFields[field as keyof ExifData]?.zIndex ?? 0}
                                editable={exifFormFields[field as keyof ExifData]?.editable ?? true}
                                error={errors[field as keyof ExifData]}
                                type={exifFormFields[field as keyof ExifData]?.type ?? "Text"}
                                showError={field === currentErrorField}
                            />
                        }
                    })}

                    <AnimatedButton onClick={onFormSubmit} styles={{
                        padding: 10,
                        paddingHorizontal: 20,
                        borderRadius: 15,
                        flexDirection: "row",
                        gap: 10,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 20
                    }} defaultBgColor={"#ffffff"} hoverBgColor={"#ECECECD0"} hoverToPressedBgColor={"rgba(162,162,162,0.82)"}>
                        <Text style={{ color: 'black' }}>{ formMode === "Photo" ? "Preview Photo" : "Search Photos" }</Text>
                    </AnimatedButton>
                    { onClear &&
                        <AnimatedButton onClick={onClear} styles={{
                            padding: 10,
                            paddingHorizontal: 20,
                            borderRadius: 15,
                            flexDirection: "row",
                            gap: 10,
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: 20
                        }} defaultBgColor={"#ffffff"} hoverBgColor={"#ECECECD0"} hoverToPressedBgColor={"rgba(162,162,162,0.82)"}>
                            <Text style={{ color: 'black' }}>Clear Filters</Text>
                        </AnimatedButton>
                    }
                </View>
            </View>
        )
    )
}