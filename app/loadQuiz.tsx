import { useFetch } from "@/hooks/FetchContext";
import { QuestionQuiz } from "@/types";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const emptyQuestion = (): QuestionQuiz => ({
  videoUrl: "",
  questionText: "¿Quién marcó este gol?",
  options: ["", "", "", ""],
  correctIndex: 0,
});

export default function LoadQuiz() {
  const { loadQuiz } = useFetch();
  const [dateKey, setDateKey] = useState("");
  const [questions, setQuestions] = useState<QuestionQuiz[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);

  const getTodayDate = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setDateKey(`${yyyy}-${mm}-${dd}`);
  };

  const addQuestion = () => {
    if (questions.length >= 30) return;
    setQuestions([...questions, emptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const duplicateQuestion = (index: number) => {
    if (questions.length >= 30) return;
    const updated = [...questions];
    updated.splice(index + 1, 0, { ...questions[index] });
    setQuestions(updated);
  };

  const updateQuestion = (
    index: number,
    field: keyof QuestionQuiz,
    value: any,
  ) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const saveQuiz = async () => {
    if (!dateKey) {
      Alert.alert("Error", "Debes ingresar la fecha (YYYY-MM-DD)");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.videoUrl.startsWith("http")) {
        Alert.alert("Error", `Pregunta ${i + 1}: URL inválida`);
        return;
      }

      if (q.options.some((opt) => !opt.trim())) {
        Alert.alert("Error", `Pregunta ${i + 1}: opciones vacías`);
        return;
      }

      if (q.correctIndex < 0 || q.correctIndex > 3) {
        Alert.alert("Error", `Pregunta ${i + 1}: índice incorrecto inválido`);
        return;
      }
    }

    setLoading(true);

    try {
      const { success, message } = await loadQuiz(dateKey, questions);

      if (!success) {
        Alert.alert("Error", message || "Error guardando");
      } else {
        Alert.alert("Éxito", "Quiz guardado correctamente");
        setQuestions([emptyQuestion()]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cargar Quiz del Día</Text>

      <View style={styles.dateRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="YYYY-MM-DD"
          value={dateKey}
          onChangeText={setDateKey}
        />
        <TouchableOpacity style={styles.todayButton} onPress={getTodayDate}>
          <Text style={styles.buttonText}>Hoy</Text>
        </TouchableOpacity>
      </View>

      {questions.map((q, qIndex) => (
        <View key={qIndex} style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.subtitle}>Pregunta {qIndex + 1}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => duplicateQuestion(qIndex)}>
                <Text style={styles.smallAction}>Duplicar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                <Text style={styles.smallDelete}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                quality: 1,
              });

              if (!result.canceled) {
                updateQuestion(qIndex, "videoUrl", result.assets[0]);
              }
            }}
          >
            <Text>{q.videoUrl ? "Cambiar video" : "Seleccionar video"}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Texto de la pregunta</Text>
          <TextInput
            style={styles.input}
            value={q.questionText}
            onChangeText={(text) =>
              updateQuestion(qIndex, "questionText", text)
            }
          />

          {q.options.map((opt: string, optIndex: number) => (
            <TextInput
              key={optIndex}
              style={styles.input}
              placeholder={`Opción ${optIndex + 1}`}
              value={opt}
              onChangeText={(text) => updateOption(qIndex, optIndex, text)}
            />
          ))}

          <TextInput
            style={styles.input}
            placeholder="Índice correcto (0-3)"
            keyboardType="numeric"
            value={String(q.correctIndex)}
            onChangeText={(text) =>
              updateQuestion(qIndex, "correctIndex", Number(text))
            }
          />
        </View>
      ))}

      {questions.length < 30 && (
        <TouchableOpacity style={styles.addButton} onPress={addQuestion}>
          <Text style={styles.buttonText}>+ Agregar Pregunta</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveQuiz}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Guardando..." : "Guardar Quiz"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  todayButton: {
    backgroundColor: "#1DB954",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },

  subtitle: { fontSize: 16, fontWeight: "bold" },
  label: { fontWeight: "600", marginBottom: 4 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
  },

  smallAction: {
    color: "#1DB954",
    fontWeight: "600",
  },

  smallDelete: {
    color: "red",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    marginBottom: 16,
    borderRadius: 10,
  },

  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },

  addButton: {
    backgroundColor: "#1DB954",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  saveButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
