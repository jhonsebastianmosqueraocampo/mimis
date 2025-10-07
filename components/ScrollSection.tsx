import { ScrollSectionProps } from "@/types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CircleSwiperList from "./CircleSwiperList";
import NewsSwiperList from "./NewsSwiperList";
import SquareSwiperList from "./SquareSwiperList";

export default function ScrollSection({
  title,
  list,
  shape = "square",
  action,
}: ScrollSectionProps) {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {list.length > 5 && (
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        )}
      </View>
      {shape === "square" ? (
        <SquareSwiperList list={list} action={action} />
      ) : shape === "circle" ? (
        <CircleSwiperList list={list} action={action} />
      ) : (
        <NewsSwiperList list={list} action={action} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1DB954",
  },
  seeAll: {
    fontSize: 14,
    color: "#1DB954",
    fontWeight: "600",
  },
});