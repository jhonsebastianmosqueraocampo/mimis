import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Card, Chip, Divider, ProgressBar, Text } from "react-native-paper";

export default function MatchAnalysisPost() {
  // 🔹 Mocks de datos — en el futuro vendrán de OpenAI o backend
  const tacticalSummary =
    "El partido fue intenso desde el inicio. El equipo local dominó la posesión, pero el visitante fue más efectivo en la definición. El mediocampo fue clave: los interiores controlaron los tiempos y generaron presión alta. En la segunda mitad, los cambios tácticos del entrenador visitante equilibraron el juego y cerraron los espacios.";

  const keyPoints = [
    "Presión alta del visitante",
    "Dominio del mediocampo local",
    "Transiciones rápidas por las bandas",
    "Poca efectividad del 9 titular",
    "Portero visitante determinante",
  ];

  const highlights = [
    { label: "Posesión", valueHome: 62, valueAway: 38 },
    { label: "Ocasiones claras", valueHome: 4, valueAway: 2 },
    { label: "Tiros al arco", valueHome: 7, valueAway: 5 },
    { label: "xG (Goles esperados)", valueHome: 1.8, valueAway: 1.1 },
  ];

  const aiCommentary = [
    {
      author: "Analista IA",
      text: "El equipo visitante mostró una línea defensiva sólida y una estructura táctica compacta. Supo cerrar los espacios interiores y forzó al rival a jugar por los costados.",
      icon: "robot-excited-outline",
    },
    {
      author: "Asistente Técnico",
      text: "El cambio al minuto 70 cambió el ritmo del partido. Los ingresos desde el banco ofrecieron frescura y control en el mediocampo.",
      icon: "account-tie",
    },
  ];

  const globalRating = 7.9; // 🔸 Mock rating global (de 1 a 10)
  const ratingColor =
    globalRating >= 8 ? "#1DB954" : globalRating >= 6.5 ? "#FFC107" : "#E53935";

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Encabezado */}
      <Text variant="headlineSmall" style={styles.title}>
        Análisis del Partido
      </Text>

      {/* Rating global */}
      <Card style={styles.cardRating}>
        <Card.Content style={styles.ratingContent}>
          <MaterialCommunityIcons name="chart-line" size={36} color={ratingColor} />
          <View>
            <Text style={styles.ratingLabel}>Índice de Rendimiento</Text>
            <Text style={[styles.ratingValue, { color: ratingColor }]}>
              {globalRating.toFixed(1)} / 10
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Resumen táctico */}
      <Card style={styles.card}>
        <Card.Title
          title="Resumen táctico"
          left={(props) => (
            <MaterialCommunityIcons {...props} name="strategy" color="#1DB954" />
          )}
        />
        <Card.Content>
          <Text style={styles.summaryText}>{tacticalSummary}</Text>
        </Card.Content>
      </Card>

      {/* Puntos clave */}
      <Card style={styles.card}>
        <Card.Title
          title="Puntos Clave"
          left={(props) => (
            <MaterialCommunityIcons {...props} name="lightbulb-on-outline" color="#FFD600" />
          )}
        />
        <Card.Content style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {keyPoints.map((point, idx) => (
            <Chip
              key={idx}
              style={styles.chip}
              textStyle={{ color: "#fff" }}
              icon="check-circle-outline"
            >
              {point}
            </Chip>
          ))}
        </Card.Content>
      </Card>

      {/* Destacados visuales */}
      <Card style={styles.card}>
        <Card.Title
          title="Indicadores Destacados"
          left={(props) => (
            <MaterialCommunityIcons {...props} name="chart-bar" color="#2196F3" />
          )}
        />
        <Card.Content>
          {highlights.map((h, idx) => {
            const total = h.valueHome + h.valueAway;
            const progress = total > 0 ? h.valueHome / total : 0.5;
            return (
              <View key={idx} style={{ marginBottom: 12 }}>
                <View style={styles.statHeader}>
                  <Text style={styles.statTextLeft}>{h.valueHome}</Text>
                  <Text style={styles.statLabel}>{h.label}</Text>
                  <Text style={styles.statTextRight}>{h.valueAway}</Text>
                </View>
                <ProgressBar
                  progress={progress}
                  color="#1DB954"
                  style={{ height: 8, borderRadius: 4 }}
                />
              </View>
            );
          })}
        </Card.Content>
      </Card>

      {/* Comentarios IA */}
      <Card style={styles.card}>
        <Card.Title
          title="Comentarios del Análisis"
          left={(props) => (
            <MaterialCommunityIcons {...props} name="message-text-outline" color="#6A1B9A" />
          )}
        />
        <Card.Content>
          {aiCommentary.map((c, idx) => (
            <View key={idx} style={styles.commentBlock}>
              <View style={styles.commentHeader}>
                <Avatar.Icon
                  size={32}
                  icon={c.icon}
                  style={{ backgroundColor: "#6A1B9A" }}
                />
                <Text style={styles.commentAuthor}>{c.author}</Text>
              </View>
              <Text style={styles.commentText}>{c.text}</Text>
              {idx < aiCommentary.length - 1 && <Divider style={{ marginVertical: 10 }} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

/* 🎨 Estilos */
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fafafa",
  },
  title: {
    fontWeight: "bold",
    color: "#1DB954",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  cardRating: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#f1f8e9",
  },
  ratingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingLabel: {
    fontWeight: "600",
    color: "#333",
  },
  ratingValue: {
    fontWeight: "bold",
    fontSize: 20,
  },
  summaryText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    textAlign: "justify",
  },
  chip: {
    backgroundColor: "#1DB954",
    margin: 4,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: {
    color: "#222",
    fontWeight: "600",
    fontSize: 13,
  },
  statTextLeft: {
    color: "#1B5E20",
    fontWeight: "600",
  },
  statTextRight: {
    color: "#E53935",
    fontWeight: "600",
  },
  commentBlock: {
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  commentAuthor: {
    fontWeight: "600",
    color: "#333",
  },
  commentText: {
    color: "#555",
    fontSize: 13,
    lineHeight: 18,
  },
});