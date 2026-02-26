import AdBanner from "@/services/ads/AdBanner";
import React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { Card, Paragraph, Title } from "react-native-paper";
import type { VerticalScrollProps } from "../types";

export default function VerticalScroll({ listItems }: VerticalScrollProps) {
  return (
    <View style={styles.container}>
      {listItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay información disponible</Text>
        </View>
      ) : (
        listItems.map((item, index) => (
          <React.Fragment key={index}>
            {/* Cada 4 noticias insertamos banner */}
            {index > 0 && index % 4 === 0 && (
              <View style={{ marginVertical: 10 }}>
                <AdBanner />
              </View>
            )}

            <Card
              style={styles.card}
              mode="elevated"
              onPress={() => Linking.openURL(item.pathTo)}
            >
              <Card.Content>
                <Title style={styles.title}>{item.title}</Title>
                {item.source && (
                  <Paragraph style={styles.source}>{item.source}</Paragraph>
                )}
                {item.date && <Text style={styles.date}>{item.date}</Text>}
              </Card.Content>
            </Card>
          </React.Fragment>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
  },
  card: {
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 3, // sombra en Android
    shadowColor: "#000", // sombra en iOS
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1e293b", // azul grisáceo elegante
  },
  source: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
});
