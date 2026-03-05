import { useFetch } from "@/hooks/FetchContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { QuestionQuiz } from "@/types";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import PrivateLayout from "./privateLayout";

const emptyQuestion = (): QuestionQuiz => ({
  videoUrl: "",
  questionText: "¿Quién marcó este gol?",
  options: ["", "", "", ""],
  correctIndex: 0,
});

export default function LoadQuiz() {
  const { loadQuiz } = useFetch();

  const [dateKey, setDateKey] = useState("");
  const [questions, setQuestions] = useState<any[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState(false);

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

    setQuestions(questions.filter((_, i) => i !== index));
  };

  const duplicateQuestion = (index: number) => {
    if (questions.length >= 30) return;

    const updated = [...questions];
    updated.splice(index + 1, 0, { ...questions[index] });

    setQuestions(updated);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];

    updated[index][field] = value;

    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];

    updated[qIndex].options[optIndex] = value;

    setQuestions(updated);
  };

  const pickVideo = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      const updated = [...questions];

      updated[index].videoUrl = asset.uri;
      updated[index].videoFile = asset;

      setQuestions(updated);
    }
  };

  const saveQuiz = async () => {
    if (!dateKey) {
      Alert.alert("Error", "Debes seleccionar la fecha");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("dateKey", dateKey);

      formData.append(
        "questions",
        JSON.stringify(
          questions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctIndex: q.correctIndex,
          })),
        ),
      );

      questions.forEach((q, index) => {
        formData.append(`video_${index}`, {
          uri: q.videoFile.uri,
          name: q.videoFile.fileName || `video_${index}.mp4`,
          type: q.videoFile.mimeType || "video/mp4",
        } as any);
      });

      const { success } = await loadQuiz(formData);

      if (!success) {
        Alert.alert("Error", "Error guardando");
      } else {
        Alert.alert("Éxito", "Quiz guardado");
        setQuestions([emptyQuestion()]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }

    setLoading(false);
  };

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={[g.title, { marginBottom: spacing.md }]}>
          Cargar Quiz del Día
        </Text>

        {/* FECHA */}

        <View
          style={{
            flexDirection: "row",
            gap: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          <Pressable
            style={[
              g.card,
              {
                flex: 1,
                padding: spacing.sm,
                borderColor: dateKey ? colors.primary : "#444",
                borderWidth: 1,
              },
            ]}
            onPress={() => setShow(true)}
          >
            <Text>{dateKey ? dateKey : "Seleccionar fecha del quiz"}</Text>
          </Pressable>

          <TouchableOpacity
            onPress={getTodayDate}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.md,
              justifyContent: "center",
              borderRadius: radius.md,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Hoy</Text>
          </TouchableOpacity>
        </View>

        <DateTimePicker
          isVisible={show}
          mode="date"
          onConfirm={(selectedDate: Date) => {
            setShow(false);
            setDateKey(selectedDate.toISOString().split("T")[0]);
          }}
          onCancel={() => setShow(false)}
        />

        {/* PREGUNTAS */}

        {questions.map((q, qIndex) => (
          <View
            key={qIndex}
            style={[
              g.card,
              {
                padding: spacing.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: spacing.sm,
              }}
            >
              <Text style={{ fontWeight: "700" }}>Pregunta {qIndex + 1}</Text>

              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <TouchableOpacity onPress={() => duplicateQuestion(qIndex)}>
                  <Text style={{ color: colors.primary }}>Duplicar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeQuestion(qIndex)}>
                  <Text style={{ color: "red" }}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* VIDEO */}

            <TouchableOpacity
              onPress={() => pickVideo(qIndex)}
              style={{
                borderWidth: 1,
                borderColor: q.videoUrl ? colors.primary : "#444",
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.sm,
              }}
            >
              {q.videoUrl ? (
                <Text style={{ color: colors.primary }}>✅ Video cargado</Text>
              ) : (
                <Text style={{ opacity: 0.7 }}>Seleccionar video</Text>
              )}
            </TouchableOpacity>

            <TextInput
              value={q.questionText}
              onChangeText={(text) =>
                updateQuestion(qIndex, "questionText", text)
              }
              style={[
                g.card,
                { padding: spacing.sm, marginBottom: spacing.sm },
              ]}
            />

            {q.options.map((opt: string, optIndex: number) => (
              <TextInput
                key={optIndex}
                value={opt}
                placeholder={`Opción ${optIndex + 1}`}
                onChangeText={(text) => updateOption(qIndex, optIndex, text)}
                style={[
                  g.card,
                  { padding: spacing.sm, marginBottom: spacing.sm },
                ]}
              />
            ))}

            <TextInput
              keyboardType="numeric"
              value={String(q.correctIndex)}
              placeholder="Respuesta correcta (0-3)"
              onChangeText={(text) =>
                updateQuestion(qIndex, "correctIndex", Number(text))
              }
              style={[g.card, { padding: spacing.sm }]}
            />
          </View>
        ))}

        {questions.length < 30 && (
          <TouchableOpacity
            onPress={addQuestion}
            style={{
              backgroundColor: colors.primary,
              padding: spacing.md,
              borderRadius: radius.md,
              marginBottom: spacing.md,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              + Agregar Pregunta
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={saveQuiz}
          disabled={loading}
          style={{
            backgroundColor: "#000",
            padding: spacing.md,
            borderRadius: radius.md,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            {loading ? "Guardando..." : "Guardar Quiz"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </PrivateLayout>
  );
}
