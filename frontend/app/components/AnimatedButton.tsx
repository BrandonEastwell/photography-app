import {Animated, Pressable, PressableStateCallbackType, StyleProp, ViewStyle} from "react-native";
import React, {useRef, useState} from "react";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AnimatedButton({ children, onClick, defaultBgColor, styles } : {
    onClick: () => void
    defaultBgColor: string
    styles?: StyleProp<ViewStyle>
    children: React.ReactNode
}) {
    const [isHovered, setIsHovered] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.timing(animation, {
            toValue: 1,
            duration: 0,
            useNativeDriver: false,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(animation, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    const backgroundColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: isHovered
            ? ['#212121', '#000']  // hover-to-pressed
            : [defaultBgColor, '#212121'], // normal-to-pressed
    });

    return (
        <AnimatedPressable onPressIn={handlePressIn}
                           onPressOut={handlePressOut}
                           onHoverIn={() => setIsHovered(true)}
                           onHoverOut={() => setIsHovered(false)}
                           onPress={onClick}
                           style={[styles, { backgroundColor, paddingVertical: 10, paddingHorizontal: 15,
                               borderRadius: 10, flexDirection: "row", gap: 10, alignItems: "center" }]}>
            { children }
        </AnimatedPressable>
    )
}