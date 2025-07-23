import {Animated, View} from "react-native";
import React, {useEffect, useState} from "react";
import { Image } from 'expo-image';
import ScrollView = Animated.ScrollView;
import Constants from 'expo-constants';
import HeaderBar from "@/app/components/HeaderBar";
import {ExifData, TimePeriodValue} from "@/app/lib/Types";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

interface image {
    ISO: number | null
    camera_make: string | null
    camera_model: string | null
    distance: number | null
    focal_length: number | null
    image_url: string | null
    lens: string | null
    relevance_score: number | null
    shutter_speed: string | null
    user_id: number | null
    votes: number | null
}

export default function Index() {
    const [images, setImages] = useState<image[]>([])

    async function searchPhotos(exif: ExifData | null = null, sort_by_time: TimePeriodValue = "this_year", sort_by_popularity = "relevance") {
        let params = new URLSearchParams()

        if (exif) {
            const location = exif.GPSLatitude && exif.GPSLongitude ? exif.GPSLatitude + "," + exif.GPSLongitude : null
            location && params.set("location", location)

            exif.Make && params.set("Make", exif.Make)
            exif.Model && params.set("Model", exif.Model)
            exif.LensModel && params.set("LensModel", exif.LensModel)
            exif.FNumber && params.set("FNumber", exif.FNumber)
            exif.ISOSpeedRatings && params.set("ISOSpeedRatings", exif.ISOSpeedRatings)
            exif.FocalLength && params.set("FocalLength", String(exif.FocalLength))
            exif.ShutterSpeedValue && params.set("ShutterSpeedValue", exif.ShutterSpeedValue)
            exif.Flash && params.set("Flash", String(exif.Flash))
        }

        params.set("sort_by_time", sort_by_time)
        params.set("sort_by_popularity", sort_by_popularity)

        let url = new URL(`${apiUrl}/api/media/photos?${params}`)
        const res = await fetch(url, {
            method: "GET"
        })

        return await res.json()
    }

    useEffect(() => {
        async function getPhotos() {
            let res = await searchPhotos()
            setImages(res.results)
        }

        getPhotos()
    }, []);


    return (
        <View style={{position: "relative",  height: "100%", width: "100%", backgroundColor: "#181a1b" }}>
            <HeaderBar onSearch={(exif: ExifData | null, sort_by_time: string) => searchPhotos(exif, sort_by_time)} />
            <ScrollView>
                <View style={{
                    flex: 1,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center"
                }}>
                    { images &&
                        images.map((image: image, index) => (
                            <Image key={index} source={image.image_url} style={{ width: "32%", height: 200, margin: 2.5, zIndex: 50 }} />
                        ))
                    }
                </View>
            </ScrollView>
        </View>

    );
}
