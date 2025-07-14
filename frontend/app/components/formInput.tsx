import {StyleSheet, TextInput, View} from "react-native";
import React, {ChangeEvent} from "react";

export default function FormInput({ placeholder, onChangeText, onBlur, secure, value } : { placeholder: string,
    onChangeText: (e: string | ChangeEvent<any>) => void, onBlur: (e: any) => void, secure: boolean, value: string}) {

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                onChangeText={onChangeText}
                onBlur={onBlur}
                value={value}
                secureTextEntry={secure}
            />
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
    }
});