import {Animated, SafeAreaView, View} from "react-native";
import {useEffect, useState} from "react";
import { Image } from 'expo-image';
import { Dimensions } from 'react-native';
import ScrollView = Animated.ScrollView;

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
    const screenWidth = Dimensions.get('window').width;

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

    return (
        <ScrollView>
            <View style={{
                flex: 1,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center"
            }}>
                { images &&
                    images.map((image: image, index) => (
                        <Image key={index} source={image.image_url} style={{ width: screenWidth / 3 - 5, height: 175, margin: 2.5 }} />
                    ))
                }
            </View>
        </ScrollView>
    );
}
