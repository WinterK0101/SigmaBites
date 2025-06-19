import React from "react";
import { Text } from "react-native";

const HighlightedText = ({ text, highlights, style, highlightStyle }) => {
    const parts = text.split(new RegExp(`(${highlights.join("|")})`, "gi"));

    return (
        <Text style={style}>
            {parts.map((part, index) => {
                const isHighlight = highlights.some(
                    word => word.toLowerCase() === part.toLowerCase()
                );
                return (
                    <Text
                        key={index}
                        style={isHighlight ? highlightStyle : null}
                    >
                        {part}
                    </Text>
                );
            })}
        </Text>
    );
};

export default HighlightedText;