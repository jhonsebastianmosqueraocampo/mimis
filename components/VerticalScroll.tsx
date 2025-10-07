import React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { Card, Paragraph, Title } from "react-native-paper";
import type { VerticalScrollProps } from "../types";

export default function VerticalScroll({
  listItems,
  actionGeneralList,
}: VerticalScrollProps) {
  return (
    <View style={styles.container}>
      {listItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay noticias disponibles</Text>
        </View>
      ) : (
        listItems.map((item, index) => (
          <Card
            key={item.id || index}
            style={styles.card}
            mode="elevated"
            onPress={() => Linking.openURL(item.pathTo)}
          >
            <Card.Content>
              <Title style={styles.title}>{item.title}</Title>
              {item.source && (
                <Paragraph style={styles.source}>{item.source}</Paragraph>
              )}
              {item.date && (
                <Text style={styles.date}>
                  {new Date(item.date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              )}
            </Card.Content>
          </Card>
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