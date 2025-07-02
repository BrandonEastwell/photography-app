import {View} from "react-native";
import {useEffect, useState} from "react";
import { Image } from 'expo-image';

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

    async function searchPhotos(location = null, sort_by_time = "this_year", sort_by_popularity = "relevance") {
        let params = new URLSearchParams()
        location && params.set("location", location)
        params.set("sort_by_time", sort_by_time)
        params.set("sort_by_popularity", sort_by_popularity)
        let url = new URL(`http://127.0.0.1:8000/api/media/photos?${params}`)

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

    console.log(images)

    return (
        <View
            style={{
                flex: 1,
                alignItems: "center"
            }}
        >
            { images &&
                images.map((image: image, index) => (
                    <Image key={index} source={image.image_url} style={{ width: 320, height: 440, borderRadius: 18 }} />
                ))
            }
        </View>
    );
}
