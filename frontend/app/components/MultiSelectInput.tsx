import {Animated, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import React, {ChangeEvent, useState} from "react";
import ScrollView = Animated.ScrollView;


export default function MultiSelectInput({ placeholder, onChangeText, value, error, items, editable, zIndex } : { placeholder: string,
    onChangeText: (e: string | ChangeEvent<any>) => void, value: any, error: string | undefined, items: string[], editable: boolean, zIndex: number}) {
    const [showOptions, setShowOptions] = useState<boolean>(false)
    const [options, setOptions] = useState<string[]>(items)

    const onChange = (text: string) => {
        if (editable) {
            const filteredOptions = items.filter((value) => {
                return value.toLowerCase().startsWith(text.toLowerCase())
            })
            setOptions(filteredOptions)
        }
        onChangeText(text)
    }

    return (
        <View style={{ position: "relative", zIndex: zIndex }}>
            <View style={styles.inputContainer}>
                <View style={{ paddingHorizontal: 10, borderRadius: 6, height: 40, width: '100%' }}>
                    <TextInput
                        editable={editable}
                        onFocus={() => setShowOptions(true)}
                        onBlur={() => setTimeout(() => setShowOptions(false), 50)} // delay hiding
                        style={styles.input}
                        placeholder={placeholder}
                        onChangeText={onChange}
                        value={value}
                    />
                </View>
            </View>
            { showOptions &&
                <ScrollView style={{ position: "absolute", paddingTop: 10, maxHeight: 250, width: '100%', top: 40,
                    borderRadius: 6, backgroundColor: 'black', zIndex: zIndex }}>
                    { options.map((option) => (
                        <Pressable key={option} onPress={() => onChange(option)} style={{ flexDirection: "row",
                            paddingHorizontal: 10, borderRadius: 6, height: 40, width: '100%', justifyContent: "center"}}>
                            <Text style={{flex: 1, height: '100%', justifyContent: "center", fontFamily: "SpaceMono-Regular",
                                color: "white"}}>{ option }</Text>
                        </Pressable>
                    ))}
                </ScrollView> }
            {error && (
                <Text style={{ color: 'red', alignSelf: 'center', marginBottom: 20, fontFamily: "SpaceMono-Regular" }}>{error}</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: 'auto',
        minHeight: 40,
        backgroundColor: 'rgb(227,227,227)',
        borderRadius: 6,
        marginBottom: 15
    },
    input: {
        flex: 1,
        height: '100%',
        fontFamily: "SpaceMono-Regular",
    }
});