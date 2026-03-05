import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
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
                <Icon name="close" size={26} color={colors.textOnPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.container}
              showsVerticalScrollIndicator={false}
            >
              {/* 📸 Imagen principal */}
              <Image
                source={{
                  uri: news.fotoPrincipal,
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
                        uri: item.url ?? "",
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
    backgroundColor: colors.surface,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: colors.surfaceVariant ?? colors.surface,
    borderTopLeftRadius: radius.xl ?? 20,
    borderTopRightRadius: radius.xl ?? 20,
    overflow: "hidden",
  },

  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
  },

  headerText: {
    ...typography.title,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },

  container: {
    flex: 1,
  },

  mainImage: {
    width: "100%",
    height: 240,
  },

  infoBlock: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },

  urlText: {
    fontWeight: "600",
    marginBottom: spacing.xs ?? 4,
    ...typography.small,
    color: colors.primary,
  },

  metaText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  dateText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs ?? 4,
  },

  sectionTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs ?? 6,
    paddingHorizontal: spacing.md,
  },

  paragraph: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },

  carouselContainer: {
    paddingHorizontal: spacing.md,
  },

  carouselItem: {
    width: width - spacing.xl * 2,
    marginRight: spacing.sm,
  },

  carouselImage: {
    width: "100%",
    height: 200,
    borderRadius: radius.md,
  },

  urlSmall: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs ?? 6,
  },
});
