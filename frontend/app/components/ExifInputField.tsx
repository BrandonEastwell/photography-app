import {StyleSheet, Text, TextInput, View} from "react-native";
import React, {ChangeEvent} from "react";

export default function ExifInputField({ placeholder, onChangeText, value, error } : { placeholder: string,
    onChangeText: (e: string | ChangeEvent<any>) => void, value: any, error: string | undefined }) {

    return (
        <View style={{zIndex: 0}}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    onChangeText={onChangeText}
                    value={value}
                />
            </View>
            {error && (
                <Text style={{ color: 'red', alignSelf: 'center', marginBottom: 20, fontFamily: "SpaceMono-Regular" }}>{error}</Text>
            )}
        </View>

    )
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 40,
        backgroundColor: 'rgb(227,227,227)',
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