import {StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import React, {ChangeEvent, useState} from "react";
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function FormInput({ placeholder, onChangeText, onBlur, secure, value } : { placeholder: string,
    onChangeText: (e: string | ChangeEvent<any>) => void, onBlur: (e: any) => void, secure: boolean, value: string}) {
    const [show, setShow] = useState(secure)

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                onChangeText={onChangeText}
                onBlur={onBlur}
                value={value}
                secureTextEntry={show}
            />
            {secure &&
                <TouchableOpacity onPress={() => setShow(!show)}>
                    <FontAwesome name={show ? "eye" : "eye-slash"} size={24} color="black" />
                </TouchableOpacity>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 50,
        backgroundColor: '#f1f1f1',
        borderRadius: 6,
        paddingHorizontal: 10,
        marginBottom: 15
    },
    input: {
        flex: 1,
        height: '100%',
        fontFamily: "SpaceMono-Regular",
    }
});