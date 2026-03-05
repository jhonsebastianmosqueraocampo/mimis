import { useFetch } from "@/hooks/FetchContext";
import { loadRewardedAd, showRewardedAd } from "@/services/ads/rewarded";
import { AnswerResponse, QuizQuestion } from "@/types";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, ProgressBar, Snackbar, Text } from "react-native-paper";
import PrivateLayout from "./privateLayout";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { g } from "@/theme/styles";
import { typography } from "@/theme/typography";

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
          <Text style={g.body}>Cargando preguntas...</Text>
          <ProgressBar
            indeterminate
            style={styles.progress}
            color={colors.primary}
          />
        </View>
      </PrivateLayout>
    );
  }

  if (status === "no_quiz") {
    return (
      <PrivateLayout>
        <Card style={styles.mainCard}>
          <Text style={g.title}>Quiz del día</Text>
          <Text style={[g.bodySecondary, { marginTop: spacing.sm }]}>
            Hoy no hay preguntas cargadas.
          </Text>
          <Button
            mode="contained"
            style={{ marginTop: spacing.md }}
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

      showRewardedAd(async () => {
        const claim = await claimQuizReward(dateKey);

        if (!claim.success) {
          setSnack({
            visible: true,
            text: claim.message || "Error reclamando recompensa",
          });
          return;
        }

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

            <Text style={[g.bodySecondary, styles.completedSubtitle]}>
              Resultado final
            </Text>

            <View style={styles.scoreCircle}>
              <Text style={styles.scoreBig}>{score}</Text>
              <Text style={g.bodySecondary}>/ {total}</Text>
            </View>

            <Text style={styles.percentage}>{percentage}% de aciertos</Text>

            {!rewardClaimed ? (
              <Button
                mode="contained"
                style={{ marginTop: spacing.xl }}
                onPress={handleReward}
              >
                🎁 Reclamar recompensa
              </Button>
            ) : (
              <View style={{ marginTop: spacing.xl, alignItems: "center" }}>
                <Text
                  style={{
                    color: colors.success,
                    fontFamily: typography.subtitle.fontFamily,
                  }}
                >
                  ✅ Recompensa reclamada
                </Text>
                <Text style={[g.bodySecondary, { marginTop: spacing.xs }]}>
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
        <Text style={g.titleLarge}>
          Pregunta {answeredCount + 1} / {total}
        </Text>

        <ProgressBar
          progress={progress}
          color={colors.primary}
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

          <View style={{ padding: spacing.lg }}>
            <Text style={[g.subtitle, { marginBottom: spacing.md }]}>
              {question?.questionText}
            </Text>

            {question?.options?.map((op, idx) => {
              const selected = selectedIndex === idx;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionCard,
                    selected && { borderColor: colors.primary },
                  ]}
                  onPress={() => setSelectedIndex(idx)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.radio,
                      selected && { backgroundColor: colors.primary },
                    ]}
                  />
                  <Text style={styles.optionText}>{op.label}</Text>
                </TouchableOpacity>
              );
            })}

            <Button
              mode="contained"
              style={{ marginTop: spacing.lg }}
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },

  mainCard: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  video: {
    width: "100%",
    height: 250,
    backgroundColor: "#000",
  },

  progress: {
    marginTop: spacing.sm,
    borderRadius: radius.sm,
  },

  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },

  optionText: {
    marginLeft: spacing.sm,
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },

  completedContainer: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },

  completedCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },

  completedTitle: {
    ...typography.titleLarge,
    color: colors.primary,
  },

  completedSubtitle: {
    marginTop: spacing.xs,
  },

  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },

  scoreBig: {
    fontSize: 32,
    fontFamily: typography.title.fontFamily,
    color: colors.primary,
  },

  percentage: {
    marginTop: spacing.sm,
    fontFamily: typography.subtitle.fontFamily,
    color: colors.textPrimary,
  },
});
