import {Entypo} from "@expo/vector-icons";
import {Pressable} from "react-native";

export default function FileUpload() {
    function clickHandler() {
    }

    return (
        <Pressable onPress={clickHandler} style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Entypo name="circle-with-plus" size={24} color="black" />
        </Pressable>
    )
}
