import { NewsItem } from "@/types";
import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Portal } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const GREEN = "#2ecc71";
const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  news: NewsItem;
  onClose: () => void;
};

export default function NewsDetail({ visible, news, onClose }: Props) {
  return (
    <Portal>
      <Modal visible={visible} animationType="slide" transparent>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* 🔵 Header fijo */}
            <View style={styles.header}>
              <Text style={styles.headerText}>
                📰 detalle de la noticia Noticia
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={26} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.container}
              showsVerticalScrollIndicator={false}
            >
              {/* 📸 Imagen principal */}
              <Image
                source={{
                  uri: `http://192.168.10.16:3001/api/userNews/image/${news.fotoPrincipal}`,
                }}
                style={styles.mainImage}
                resizeMode="cover"
              />

              {/* INFO */}
              <View style={styles.infoBlock}>
                <Text style={styles.urlText}>{news.urlFotoPrincipal}</Text>

                <Text style={styles.metaText}>
                  {news.entidad} • {news.user.name}
                </Text>

                <Text style={styles.dateText}>{news.fecha}</Text>
              </View>

              {/* Introducción */}
              <Text style={styles.sectionTitle}>Introducción</Text>
              <Text style={styles.paragraph}>
                {news.desarrolloInicialNoticia}
              </Text>

              {/* Carrusel */}
              <Text style={styles.sectionTitle}>Galería</Text>
              <ScrollView
                horizontal
                pagingEnabled
                snapToInterval={width - 48}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContainer}
              >
                {news.carruselFotos.map((item, i) => (
                  <View key={i} style={styles.carouselItem}>
                    <Image
                      source={{
                        uri: `http://192.168.10.16:3001/api/userNews/image/${item.foto}`,
                      }}
                      style={styles.carouselImage}
                    />
                    <Text style={styles.urlSmall}>{item.url}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Conclusión */}
              <Text style={styles.sectionTitle}>Conclusión</Text>
              <Text style={styles.paragraph}>
                {news.desarrolloFinalNoticia}
              </Text>

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  header: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
  },

  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  container: {
    flex: 1,
  },

  mainImage: {
    width: "100%",
    height: 240,
  },

  infoBlock: {
    padding: 16,
    backgroundColor: "#fff",
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
    fontSize: 17,
    fontWeight: "700",
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
  },

  carouselContainer: {
    paddingHorizontal: 16,
  },

  carouselItem: {
    width: width - 48,
    marginRight: 12,
  },

  carouselImage: {
    width: "100%",
    height: 200,
    borderRadius: 14,
  },

  urlSmall: {
    color: "#666",
    fontSize: 12,
    marginTop: 6,
  },
});
