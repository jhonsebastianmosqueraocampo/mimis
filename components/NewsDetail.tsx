import { NewsItem } from "@/types";
import React from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const GREEN = "#2ecc71";

type Props = {
  visible: boolean;
  news: NewsItem;
  onClose: () => void;
};

export default function NewsDetail({ visible, news, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide">
      {/* 🔵 Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>📰 Noticia completa</Text>

        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* 📸 Foto principal */}
        <Image
          source={{ uri: news.fotoPrincipal }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {/* INFO PRINCIPAL */}
        <View style={styles.infoBlock}>
          <Text style={styles.urlText}>{news.urlFotoPrincipal}</Text>

          <Text style={styles.metaText}>
            {news.entidad} • {news.user.name}
          </Text>

          <Text style={styles.dateText}>{news.fecha}</Text>
        </View>

        {/* 📝 Desarrollo inicial */}
        <Text style={styles.sectionTitle}>Introducción</Text>
        <Text style={styles.paragraph}>{news.desarrolloInicialNoticia}</Text>

        {/* 🖼 CARRUSEL */}
        <Text style={styles.sectionTitle}>Galería</Text>
        <ScrollView horizontal pagingEnabled style={{ marginBottom: 20 }}>
          {news.carruselFotos.map((item, i) => (
            <View key={i} style={styles.carouselItem}>
              <Image source={{ uri: item.foto }} style={styles.carouselImage} />
              <Text style={styles.urlSmall}>{item.url}</Text>
            </View>
          ))}
        </ScrollView>

        {/* 📝 Desarrollo final */}
        <Text style={styles.sectionTitle}>Conclusión</Text>
        <Text style={styles.paragraph}>{news.desarrolloFinalNoticia}</Text>

        <View style={{ height: 50 }} />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: GREEN,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  container: {
    backgroundColor: "#f7f7f7",
  },

  mainImage: {
    width: "100%",
    height: 250,
  },

  infoBlock: {
    padding: 16,
  },
  urlText: {
    color: GREEN,
    fontWeight: "600",
    marginBottom: 4,
  },
  metaText: {
    color: "#555",
    fontSize: 14,
  },
  dateText: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: GREEN,
    marginTop: 20,
    marginBottom: 6,
    paddingHorizontal: 16,
  },

  paragraph: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  carouselItem: {
    width: 350,
    marginRight: 10,
  },
  carouselImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
  urlSmall: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
});