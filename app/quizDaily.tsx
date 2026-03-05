import { useFetch } from "@/hooks/FetchContext";
import { loadRewardedAd, showRewardedAd } from "@/services/ads/rewarded";
import { AnswerResponse, QuizQuestion } from "@/types";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, ProgressBar, Snackbar, Text } from "react-native-paper";
import PrivateLayout from "./privateLayout";

const GREEN = "#1DB954";

export default function QuizDailyScreen() {
  const { getTodayQuiz, answerQuiz, validateQuizReward, claimQuizReward } =
    useFetch();

  const [loading, setLoading] = useState(true);
  const [dateKey, setDateKey] = useState("");
  const [status, setStatus] = useState<"no_quiz" | "in_progress" | "completed">(
    "no_quiz",
  );

  const [total, setTotal] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const [snack, setSnack] = useState({ visible: false, text: "" });
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const progress = useMemo(
    () => (total ? answeredCount / total : 0),
    [answeredCount, total],
  );

  useEffect(() => {
    const checkReward = async () => {
      if (status === "completed" && dateKey) {
        const r = await validateQuizReward(dateKey);
        if (r.success) {
          setRewardClaimed(r.alreadyClaimed);
        }
      }
    };

    checkReward();
  }, [status, dateKey]);

  useEffect(() => {
    loadRewardedAd();
  }, []);

  const load = async () => {
    setLoading(true);
    const r = await getTodayQuiz();

    if (!r.success || !r.quiz) {
      setSnack({ visible: true, text: r.message || "Error" });
      setLoading(false);
      return;
    }

    const q = r.quiz as any;

    setDateKey(q.dateKey);
    setStatus(q.quizStatus);
    setTotal(q.total || 0);
    setAnsweredCount(q.answeredCount || 0);
    setScore(q.score || 0);
    setQuestion(q.nextQuestion || null);
    setSelectedIndex(null);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onNext = async () => {
    if (!question || selectedIndex === null) return;

    setSending(true);

    const r = await answerQuiz({
      dateKey,
      questionId: question._id,
      selectedIndex,
    });

    if (!r.success) {
      setSnack({ visible: true, text: r.message || "Error" });
      setSending(false);
      return;
    }

    const resp = r.quiz as AnswerResponse;

    setScore(resp.score);
    setAnsweredCount(resp.answeredCount);
    setStatus(resp.status);
    setQuestion(resp.nextQuestion || null);
    setSelectedIndex(null);

    setSnack({
      visible: true,
      text: resp.isCorrect ? "✅ Correcto (+1)" : "❌ Incorrecto",
    });

    setSending(false);
  };

  if (loading) {
    return (
      <PrivateLayout>
        <View style={styles.center}>
          <Text>Cargando preguntas...</Text>
          <ProgressBar indeterminate style={{ marginTop: 12 }} />
        </View>
      </PrivateLayout>
    );
  }

  if (status === "no_quiz") {
    return (
      <PrivateLayout>
        <Card style={styles.mainCard}>
          <Text variant="titleLarge">Quiz del día</Text>
          <Text style={{ marginTop: 8 }}>Hoy no hay preguntas cargadas.</Text>
          <Button
            mode="contained"
            buttonColor={GREEN}
            style={{ marginTop: 16 }}
            onPress={load}
          >
            Reintentar
          </Button>
        </Card>
      </PrivateLayout>
    );
  }

  if (status === "completed") {
    const percentage = total ? Math.round((score / total) * 100) : 0;

    const handleReward = async () => {
      // 1. Validar primero
      const validation = await validateQuizReward(dateKey);

      if (!validation.success) {
        setSnack({
          visible: true,
          text: validation.message || "Error",
        });
        return;
      }

      if (validation.alreadyClaimed) {
        setRewardClaimed(true);
        setSnack({
          visible: true,
          text: "Ya reclamaste la recompensa hoy",
        });
        return;
      }

      // 2. Mostrar rewarded ad
      showRewardedAd(async () => {
        // 🏆 3. Reclamar recompensa en backend
        const claim = await claimQuizReward(dateKey);

        if (!claim.success) {
          setSnack({
            visible: true,
            text: claim.message || "Error reclamando recompensa",
          });
          return;
        }

        // 4. Actualizar estado
        setRewardClaimed(true);

        setSnack({
          visible: true,
          text: `🎉 Has ganado ${score} puntos`,
        });
      });
    };

    return (
      <PrivateLayout>
        <View style={styles.completedContainer}>
          <Card style={styles.completedCard}>
            <Text style={styles.completedTitle}>🎉 ¡Quiz completado!</Text>

            <Text style={styles.completedSubtitle}>Resultado final</Text>

            <View style={styles.scoreCircle}>
              <Text style={styles.scoreBig}>{score}</Text>
              <Text style={{ color: "#666" }}>/ {total}</Text>
            </View>

            <Text style={styles.percentage}>{percentage}% de aciertos</Text>

            {!rewardClaimed ? (
              <Button
                mode="contained"
                buttonColor={GREEN}
                style={{ marginTop: 24 }}
                onPress={handleReward}
              >
                🎁 Reclamar recompensa
              </Button>
            ) : (
              <View style={{ marginTop: 24, alignItems: "center" }}>
                <Text style={{ color: GREEN, fontWeight: "600" }}>
                  ✅ Recompensa reclamada
                </Text>
                <Text style={{ marginTop: 4, color: "#666" }}>
                  Vuelve mañana para un nuevo quiz
                </Text>
              </View>
            )}
          </Card>
        </View>

        <Snackbar
          visible={snack.visible}
          onDismiss={() => setSnack({ visible: false, text: "" })}
        >
          {snack.text}
        </Snackbar>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge">
          Pregunta {answeredCount + 1} / {total}
        </Text>

        <ProgressBar
          progress={progress}
          color={GREEN}
          style={styles.progress}
        />

        <Card style={styles.mainCard}>
          {!!question?.videoUrl && (
            <Video
              style={styles.video}
              source={{ uri: question.videoUrl }}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay={false}
              isLooping={false}
            />
          )}

          <View style={{ padding: 20 }}>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              {question?.questionText}
            </Text>

            {question?.options?.map((op, idx) => {
              const selected = selectedIndex === idx;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionCard,
                    selected && { borderColor: GREEN },
                  ]}
                  onPress={() => setSelectedIndex(idx)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.radio,
                      selected && { backgroundColor: GREEN },
                    ]}
                  />
                  <Text style={styles.optionText}>{op.label}</Text>
                </TouchableOpacity>
              );
            })}

            <Button
              mode="contained"
              buttonColor={GREEN}
              style={{ marginTop: 20 }}
              disabled={selectedIndex === null || sending}
              loading={sending}
              onPress={onNext}
            >
              Siguiente
            </Button>
          </View>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack({ visible: false, text: "" })}
        duration={1500}
      >
        {snack.text}
      </Snackbar>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  mainCard: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: 250,
    backgroundColor: "#000",
  },
  progress: {
    marginTop: 12,
    borderRadius: 10,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#999",
  },
  scoreText: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 8,
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  completedCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },

  completedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: GREEN,
  },

  completedSubtitle: {
    marginTop: 8,
    color: "#666",
  },

  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  scoreBig: {
    fontSize: 32,
    fontWeight: "bold",
    color: GREEN,
  },

  percentage: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
});
