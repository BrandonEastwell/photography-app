import {Animated, View, Text, FlatList} from "react-native";
import React, {useEffect, useState} from "react";
import ScrollView = Animated.ScrollView;
import Constants from 'expo-constants';
import SearchBar from "@/app/components/SearchBar";
import {ExifData, Photo, TimePeriodValue} from "@/app/lib/Types";
import PhotoCard from "@/app/components/PhotoCard";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function Index() {
    const [images, setimages] = useState<Photo[]>([])
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function searchPhotos(exif: ExifData | null = null, sort_by_time: TimePeriodValue = "this_year", sort_by_popularity = "relevance") {
        let params = new URLSearchParams()

        if (exif) {
            const location = exif.GPSLatitude && exif.GPSLongitude ? exif.GPSLatitude + "," + exif.GPSLongitude : null
            location && params.set("location", location)

            exif.Make && params.set("Make", exif.Make)
            exif.Model && params.set("Model", exif.Model)
            exif.LensModel && params.set("LensModel", exif.LensModel)
            exif.FNumber && params.set("FNumber", exif.FNumber)
            exif.ISOSpeedRatings && params.set("ISOSpeedRatings", String(exif.ISOSpeedRatings))
            exif.FocalLength && params.set("FocalLength", String(exif.FocalLength))
            exif.ShutterSpeedValue && params.set("ShutterSpeedValue", exif.ShutterSpeedValue)
            exif.Flash && params.set("Flash", exif.Flash == "Yes" ? "true" : "false")
        }

        params.set("sort_by_time", sort_by_time)
        params.set("sort_by_popularity", sort_by_popularity)

        let url = new URL(`${apiUrl}/api/media/photos?${params}`)
        const res = await fetch(url, {
            method: "GET"
        })

        const data = await res.json()
        if (!data.success) return setError(data.error)

        setimages(data.results)
        data.message ? setMessage(data.message) : setMessage(null)
        setError(null)
    }

    useEffect(() => {
        async function getPhotos() {
            await searchPhotos()
        }

        getPhotos()
    }, []);

    const Item = ({ photo }: { photo: Photo }) => (
        <PhotoCard photo={photo} />
    )

    return (
        <View style={{position: "relative",  height: "100%", width: "100%", backgroundColor: "#181a1b" }}>
            <SearchBar onSearch={(exif: ExifData | null, sort_by_time: TimePeriodValue) => searchPhotos(exif, sort_by_time)} />
            { message && <Text style={{ color: "white", fontSize: 12, padding: 15, fontFamily: "SpaceMono-Regular" , flexDirection: "row", flexWrap: "wrap" }}>{message}</Text> }
            { error && <Text style={{ color: "red", fontSize: 12, padding: 15, fontFamily: "SpaceMono-Regular" , flexDirection: "row", flexWrap: "wrap" }}>{error}</Text> }
            { images && <FlatList numColumns={3} keyExtractor={item => item.image_url} data={images} renderItem={(photo) => <Item photo={photo.item} />} /> }
        </View>
    );
}
