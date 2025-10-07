import { SwiperListProps } from "@/types";
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
export default function NewsSwiperList({ list, action }: SwiperListProps) {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => action(item.id)}
      style={styles.card}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.img }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ paddingBottom: 15, height: 170 }}>
      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16 }}
        snapToInterval={200}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.6,
    height: 150,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
  },
  image: {
    height: 120,
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "BubbleSans",
    textAlign: "center",
    paddingTop: 8,
    paddingBottom: 8,
    color: "#333",
  },
});