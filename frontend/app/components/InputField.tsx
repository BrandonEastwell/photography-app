import {Animated, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import ScrollView = Animated.ScrollView;


export default function InputField({ placeholder, onChangeText, value, error, items, editable, type, zIndex, showError } : {
    placeholder: string,
    onChangeText: (e: string | ChangeEvent<any>) => void,
    value: any,
    error: string | undefined,
    items: string[],
    editable: boolean,
    type: "Dropdown" | "Text"
    zIndex: number
    showError: boolean
}) {

    const [showOptions, setShowOptions] = useState<boolean>(false)
    const [options, setOptions] = useState<string[]>(items)
    const borderColorAnimated = useRef(new Animated.Value(0)).current;

    const onChange = (text: string) => {
        if (editable) {
            const filteredOptions = items.filter((value) => {
                return value.toLowerCase().startsWith(text.toLowerCase())
            })
            setOptions(filteredOptions)
        }
        onChangeText(text)
    }

    useEffect(() => {
        if (error) fadeInOutline()
        else fadeOutOutline()
    }, [error]);

    const fadeInOutline = () => {
        Animated.timing(borderColorAnimated, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false
        }).start()
    }

    const fadeOutOutline = () => {
        Animated.timing(borderColorAnimated, {
            toValue: 0,
            duration: 600,
            useNativeDriver: false
        }).start()
    }

    const borderColor = borderColorAnimated.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,0,0,0)', 'rgba(255,0,0,1)'],
    });

    return (
        <View style={{ position: "relative", zIndex: zIndex, marginBottom: 20 }}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                height: 40,
                backgroundColor: 'rgb(227,227,227)',
                borderRadius: 6
            }}>
                <Animated.View style={{ paddingHorizontal: 10, borderRadius: 6, height: 40, width: '100%', borderWidth: 2, borderColor }}>
                    { type === "Dropdown" &&
                        <TextInput
                            editable={editable}
                            onFocus={() => setShowOptions(true)}
                            onBlur={() => setTimeout(() => setShowOptions(false), 50)} // delay hiding
                            style={styles.input}
                            placeholder={placeholder}
                            onChangeText={onChange}
                            value={value}
                        />
                    }
                    { type === "Text" &&
                        <TextInput
                            editable={editable}
                            style={styles.input}
                            placeholder={placeholder}
                            onChangeText={onChangeText}
                            value={value}
                        />
                    }
                </Animated.View>
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
                </ScrollView>
            }
            { showError && error && (
                <Text style={{ color: 'red', paddingHorizontal: 5, paddingTop: 2.5, fontFamily: "SpaceMono-Regular" }}>{error}</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
        flex: 1,
        height: '100%',
        fontFamily: "SpaceMono-Regular",
        color: "black",
        outlineWidth: 0,
        paddingVertical: 0,
        textAlignVertical: "center"
    }
});