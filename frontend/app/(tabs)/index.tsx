import {View, Text, FlatList} from "react-native";
import React, {useEffect, useState} from "react";
import Constants from 'expo-constants';
import SearchBar from "@/app/components/SearchBar";
import {ExifData, Photo, TimePeriodValue} from "@/app/lib/Types";
import PhotoCard from "@/app/components/PhotoCard";
import {useMessage} from "@/app/lib/MessagingContext";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function Index() {
    const [images, setImages] = useState<Photo[]>([])
    const { setMessage } = useMessage()

    async function searchPhotos(exif: ExifData | null = null, sort_by_time: TimePeriodValue = "this_year", sort_by_popularity = "relevance") {
        let params = new URLSearchParams()
        const hasFilters = exif ? Object.values(exif).some((value) => value !== undefined) : false
        console.log(hasFilters)
        if (hasFilters && exif) {
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
        if (!data.success) return setMessage({ message: data.error, error: true })

        setImages(data.results)
        data.message ? setMessage({ message: data.message, error: false }) : setMessage(null)
    }

    useEffect(() => {
        async function getPhotos() {
            await searchPhotos()
        }

        getPhotos()
    }, []);

    const Item = ({ photo }: { photo: Photo }) => <PhotoCard photo={photo} userId={photo.user_id} />

    return (
        <View style={{position: "relative",  height: "100%", width: "100%", backgroundColor: "#181a1b" }}>
            <SearchBar onSearch={(exif: ExifData, sort_by_time: TimePeriodValue) => searchPhotos(exif, sort_by_time)} />
            { images &&
                <FlatList columnWrapperStyle={{ justifyContent: 'space-evenly' }}
                          numColumns={3} keyExtractor={item => item.image_url} data={images}
                          renderItem={(photo) => <Item photo={photo.item} />} /> }
        </View>
    );
}
