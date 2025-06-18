import React from "react";
import { Text } from "react-native";

const HighlightedText = ({ text, highlights }) => {
    const parts = text.split(new RegExp(`(${highlights.join("|")})`, "gi"));

    return (
        <Text>
            {parts.map((part, index) => {
                const isHighlight = highlights.some(
                    word => word.toLowerCase() === part.toLowerCase()
                );
                return (
                    <Text
                        key={index}
                        style={isHighlight ? { color: "orange", fontWeight: "bold" } : {}}
                    >
                        {part}
                    </Text>
                );
            })}
        </Text>
    );
};

export default HighlightedText;
