import React, { useState } from "react";
import { GestureResponderEvent, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-paper";

type StarRatingProps = {
  rating?: number;
  editable?: boolean;
  size?: number;
  onChange?: (value: number) => void;
};

export default function StarRating({
  rating = 0,
  editable = false,
  size = 28,
  onChange,
}: StarRatingProps) {
  const [current, setCurrent] = useState(rating);

  const handlePress = (index: number, half: boolean) => {
    if (!editable) return;
    const newValue = half ? index + 0.5 : index + 1;
    setCurrent(newValue);
    onChange && onChange(newValue);
  };

  // Detecta si el usuario tocó la izquierda o la derecha de la estrella
  const handleTouch = (e: GestureResponderEvent, index: number) => {
    if (!editable) return;
    const { locationX } = e.nativeEvent;
    const half = locationX < size / 2;
    handlePress(index, half);
  };

  return (
    <View style={{ flexDirection: "row" }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const diff = current - i;
        const icon =
          diff >= 1 ? "star" : diff >= 0.5 ? "star-half-full" : "star-outline";

        return (
          <TouchableOpacity
            key={i}
            activeOpacity={editable ? 0.7 : 1}
            onPressIn={(e) => handleTouch(e, i)}
          >
            <Icon source={icon} size={size} color="#FFD700" />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
