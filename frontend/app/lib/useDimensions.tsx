import {Dimensions} from "react-native";
import {useEffect, useState} from "react";

const calculateWidth = () => {
    const screenWidth = Dimensions.get('window').width;
    return screenWidth / 3 - 5
}

export default function useDimensions() {
    const [photoWidth, setPhotoWidth] = useState<number>(calculateWidth)

    useEffect(() => {
        window.addEventListener("resize", () => setPhotoWidth(calculateWidth))
    }, []);

    return { photoWidth }
}