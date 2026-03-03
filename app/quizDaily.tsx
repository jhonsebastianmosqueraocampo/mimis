import { useFetch } from "@/hooks/FetchContext";
import { loadRewardedAd, showRewardedAd } from "@/services/ads/rewarded";
import { AnswerResponse, QuizQuestion } from "@/types";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  Button,
  Card,
  ProgressBar,
  RadioButton,
  Snackbar,
  Text,
} from "react-native-paper";

export default function QuizDailyScreen() {
  const { getTodayQuiz, answerQuiz } = useFetch();

  const [loading, setLoading] = useState(true);
  const [dateKey, setDateKey] = useState<string>("");
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
  const [rewardShown, setRewardShown] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const progress = useMemo(
    () => (total ? answeredCount / total : 0),
    [answeredCount, total],
  );

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

    if (q.status === "no_quiz") {
      setStatus("no_quiz");
      setTotal(0);
      setAnsweredCount(0);
      setScore(0);
      setQuestion(null);
    } else {
      setStatus(q.status);
      setTotal(q.total);
      setAnsweredCount(q.answeredCount);
      setScore(q.score);
      setQuestion(q.nextQuestion);
    }

    setSelectedIndex(null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (status === "completed" && !rewardShown) {
      triggerReward();
    }
  }, [status]);

  const onNext = async () => {
    if (!question || selectedIndex === null) return;

    setSending(true);
    const r = await answerQuiz({
      dateKey,
      questionId: question._id,
      selectedIndex,
    });

    if (!r.success || !r.quiz) {
      setSnack({ visible: true, text: r.message || "Error" });
      setSending(false);
      return;
    }

    const resp = r.quiz as AnswerResponse;

    setSnack({
      visible: true,
      text: resp.isCorrect ? "✅ Correcto (+1)" : "❌ Incorrecto",
    });
    setScore(resp.score);
    setAnsweredCount(resp.answeredCount);
    setStatus(resp.status);
    setQuestion(resp.nextQuestion);
    setSelectedIndex(null);

    setSending(false);
  };

  const triggerReward = async () => {
    setRewardShown(true);
    setFinalizing(true);

    showRewardedAd(async () => {
      setSnack({
        visible: true,
        text: `🎉 Has ganado ${score} puntos`,
      });

      setFinalizing(false);
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text variant="titleMedium">Cargando preguntas...</Text>
        <ProgressBar indeterminate style={{ marginTop: 12 }} />
      </View>
    );
  }

  if (status === "no_quiz") {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Card style={{ padding: 12 }}>
          <Text variant="titleLarge">Quiz del día</Text>
          <Text style={{ marginTop: 8 }}>Hoy no hay preguntas cargadas.</Text>
          <Button style={{ marginTop: 12 }} mode="contained" onPress={load}>
            Reintentar
          </Button>
        </Card>
        <Snackbar
          visible={snack.visible}
          onDismiss={() => setSnack({ visible: false, text: "" })}
        >
          {snack.text}
        </Snackbar>
      </View>
    );
  }

  if (status === "completed") {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Card style={{ padding: 16, borderRadius: 16 }}>
          <Text variant="titleLarge">🎉 ¡Quiz completado!</Text>

          <Text style={{ marginTop: 12 }}>Respuestas correctas:</Text>

          <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 6 }}>
            {score} / {total}
          </Text>

          {finalizing ? (
            <View style={{ marginTop: 20 }}>
              <Text>🎥 Mostrando recompensa...</Text>
              <ProgressBar indeterminate style={{ marginTop: 10 }} />
            </View>
          ) : (
            <Button style={{ marginTop: 20 }} mode="contained" onPress={load}>
              Volver mañana
            </Button>
          )}
        </Card>

        <Snackbar
          visible={snack.visible}
          onDismiss={() => setSnack({ visible: false, text: "" })}
        >
          {snack.text}
        </Snackbar>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ paddingHorizontal: 4, marginBottom: 10 }}>
        <Text variant="titleLarge">¿Quién marcó este gol?</Text>
        <Text style={{ marginTop: 2, opacity: 0.7 }}>
          Pregunta {answeredCount + 1} / {total} · Puntos: {score}
        </Text>
        <ProgressBar
          progress={progress}
          style={{ marginTop: 10, borderRadius: 10 }}
        />
      </View>

      <Card style={{ overflow: "hidden" }}>
        {!!question?.videoUrl && (
          <Video
            style={{ width: "100%", height: 240, backgroundColor: "#000" }}
            source={{ uri: question.videoUrl }}
            posterSource={
              question.posterUrl ? { uri: question.posterUrl } : undefined
            }
            usePoster={!!question.posterUrl}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
            isLooping
          />
        )}

        <View style={{ padding: 12 }}>
          <Text variant="titleMedium">
            {question?.questionText || "¿Quién marcó este gol?"}
          </Text>

          <RadioButton.Group
            onValueChange={(v) => setSelectedIndex(Number(v))}
            value={selectedIndex === null ? "" : String(selectedIndex)}
          >
            {question?.options?.map((op, idx) => (
              <Card
                key={idx}
                style={{ marginTop: 10, padding: 10, borderRadius: 12 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <RadioButton value={String(idx)} />
                  <Text variant="bodyLarge">{op.label}</Text>
                </View>
              </Card>
            ))}
          </RadioButton.Group>

          <Button
            mode="contained"
            style={{ marginTop: 14 }}
            disabled={selectedIndex === null || sending}
            loading={sending}
            onPress={onNext}
          >
            Siguiente
          </Button>
        </View>
      </Card>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack({ visible: false, text: "" })}
      >
        {snack.text}
      </Snackbar>
    </View>
  );
}
