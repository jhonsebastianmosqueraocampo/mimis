import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { WeeklyWorldTopVideo } from "@/types";
import { Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function LoadWorldResumeVideos() {
  const {
    loadWorldTop10,
    getVideosWorldTop10,
    editWorldTop10,
    deleteWorldTop10,
  } = useFetch();

  const [videos, setVideos] = useState<WeeklyWorldTopVideo[]>([]);
  const [mode, setMode] = useState<"upload" | "edit">("upload");

  // Estados para subir
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [video, setVideo] = useState<any>(null);
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Estados para editar
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [leagueName, setLeagueName] = useState("");
  const [editLeagueName, setEditLeagueName] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<WeeklyWorldTopVideo | null>(
    null,
  );
  const [editVideo, setEditVideo] = useState<any>(null);
  const [editThumbnail, setEditThumbnail] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const getVideos = async () => {
      setLoading(true);
      try {
        const { videos, success, message } = await getVideosWorldTop10();
        if (!isMounted) return;

        if (success) {
          setVideos(videos);
        } else {
          setMessage(message!);
        }
      } catch (err) {
        if (isMounted) setMessage("Error al cargar trayectoria del jugador");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  // 📅 Calcular el próximo domingo por defecto
  useEffect(() => {
    const today = new Date();
    const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    setSelectedDate(nextSunday);
  }, []);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleConfirm = (date: Date) => {
    if (date.getDay() !== 0) {
      setMessage("⚠️ Solo puedes seleccionar domingos");
      setDatePickerVisible(false);
      return;
    }
    setSelectedDate(date);
    setDatePickerVisible(false);
    setMessage("");
  };

  const pickVideo = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: "video/*" });
    if (!res.canceled && res.assets?.length > 0) {
      setVideo(res.assets[0]);
    }
  };

  const pickThumbnail = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: "image/*" });
    if (!res.canceled && res.assets?.length > 0) {
      setThumbnail(res.assets[0]);
    }
  };

  // 🚀 Subir nuevo video
  const handleSubmit = async () => {
    if (!selectedDate || !video || !thumbnail || !leagueName.trim()) {
      setMessage(
        "⚠️ Debes seleccionar fecha, video, thumbnail y nombre de la liga",
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("week", formatDate(selectedDate));
      formData.append("leagueName", leagueName);
      formData.append("video", {
        uri: video.uri,
        name: video.name || "video.mp4",
        type: video.mimeType || "video/mp4",
      } as any);
      formData.append("thumbail", {
        uri: thumbnail.uri,
        name: thumbnail.name || "thumb.jpg",
        type: thumbnail.mimeType || "image/jpeg",
      } as any);

      const { success, message } = await loadWorldTop10(formData);

      if (success) {
        setMessage("✅ Video subido correctamente");
        setVideo(null);
        setThumbnail(null);
        setLeagueName("");
      } else {
        setMessage(message ?? "Error al cargar el video");
      }
    } catch (err) {
      setMessage("❌ Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Abrir modal de edición
  const handleOpenEdit = (video: WeeklyWorldTopVideo) => {
    setVideoToEdit(video);
    setEditLeagueName(video.leagueName || "");
    setEditModalVisible(true);
  };

  // 🗑 Eliminar video
  const handleDelete = async (id: string) => {
    const { success, message } = await deleteWorldTop10(id);
    if (success) {
      setMessage(`🗑 Video eliminado`);
    } else {
      setMessage(message ?? "Error al eliminar el video");
    }
  };

  // 🧩 Confirmar edición (simulación)
  const handleConfirmEdit = async () => {
    if (!videoToEdit) return;

    try {
      const formData = new FormData();

      // Si se cambió la fecha, podrías incluirla también
      formData.append("week", videoToEdit.week);
      formData.append("leagueName", editLeagueName.trim());
      if (editVideo) {
        formData.append("video", {
          uri: editVideo.uri,
          name: editVideo.name || "video.mp4",
          type: editVideo.mimeType || "video/mp4",
        } as any);
      }

      if (editThumbnail) {
        formData.append("thumbail", {
          uri: editThumbnail.uri,
          name: editThumbnail.name || "thumb.jpg",
          type: editThumbnail.mimeType || "image/jpeg",
        } as any);
      }

      setLoading(true);
      setMessage("");

      const { success, message } = await editWorldTop10(
        videoToEdit.id,
        formData,
      );

      if (success) {
        setMessage(`✅ Video ${videoToEdit.id} actualizado correctamente`);
      } else {
        setMessage(message ?? "❌ Error al actualizar el video");
      }
    } catch (error) {
      setMessage("❌ Error al conectar con el servidor");
    } finally {
      setLoading(false);
      setEditModalVisible(false);
    }
  };

  // Filtrar por semana si se selecciona
  const filteredVideos = selectedWeek
    ? videos.filter((v) => v.week === selectedWeek)
    : videos;

  const uniqueWeeks = Array.from(new Set(videos.map((v) => v.week)));

  if (loading) {
    return <Loading visible={loading} />;
  }

  return (
    <PrivateLayout>
      <View style={{ flex: 1, padding: 20 }}>
        <Text variant="titleLarge" style={{ marginBottom: 20 }}>
          🌍 Top 10 Mundial
        </Text>

        {/* Chips para alternar */}
        <View style={{ flexDirection: "row", marginBottom: 20, gap: 8 }}>
          <Chip
            icon="upload"
            selected={mode === "upload"}
            onPress={() => setMode("upload")}
          >
            Subir nuevo
          </Chip>
          <Chip
            icon="pencil"
            selected={mode === "edit"}
            onPress={() => setMode("edit")}
          >
            Editar / Eliminar
          </Chip>
        </View>

        {/* MODO SUBIR */}
        {mode === "upload" ? (
          <>
            <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
              <TextInput
                label="Fecha (domingo de la semana)"
                value={selectedDate ? selectedDate.toLocaleDateString() : ""}
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
                style={{ marginBottom: 20 }}
              />
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={() => setDatePickerVisible(false)}
            />

            <TextInput
              label="Nombre de la liga"
              value={leagueName}
              onChangeText={setLeagueName}
              mode="outlined"
              style={{ marginBottom: 16 }}
              placeholder="Ej: Premier League, LaLiga, Champions League..."
            />

            <Button
              icon="video"
              mode="outlined"
              onPress={pickVideo}
              style={{ marginBottom: 20 }}
            >
              {video ? "📹 Cambiar video" : "Seleccionar video"}
            </Button>

            <Button icon="image" mode="outlined" onPress={pickThumbnail}>
              {thumbnail ? "🖼 Cambiar thumbnail" : "Seleccionar thumbnail"}
            </Button>

            {thumbnail && (
              <Image
                source={{ uri: thumbnail.uri }}
                style={{
                  width: "100%",
                  height: 200,
                  marginTop: 10,
                  borderRadius: 10,
                }}
              />
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={loading}
              style={{ marginTop: 30, backgroundColor: "#1DB954" }}
            >
              {loading ? "Subiendo..." : "Subir video"}
            </Button>
          </>
        ) : (
          // MODO EDITAR / ELIMINAR
          <View style={{ flex: 1 }}>
            {/* FILTRO SEMANA */}
            <Text variant="titleMedium" style={{ marginBottom: 10 }}>
              Filtrar por semana:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {uniqueWeeks.map((week) => {
                const selected = selectedWeek === week;

                return (
                  <Chip
                    key={week}
                    compact
                    selected={selected}
                    onPress={() => setSelectedWeek(selected ? null : week)}
                    style={[
                      styles.weekChip,
                      selected && styles.weekChipSelected,
                    ]}
                    textStyle={[
                      styles.weekChipText,
                      selected && styles.weekChipTextSelected,
                    ]}
                  >
                    {week}
                  </Chip>
                );
              })}
            </ScrollView>

            {/* GRID */}
            <ScrollView contentContainerStyle={styles.grid}>
              {filteredVideos.map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                  <Card>
                    <Image
                      source={{
                        uri: editThumbnail?.uri
                          ? editThumbnail.uri
                          : item.thumbail,
                      }}
                      style={styles.thumbnail}
                    />

                    <View style={styles.actions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        iconColor="white"
                        onPress={() => handleOpenEdit(item)}
                        style={styles.editBtn}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        iconColor="white"
                        onPress={() => handleDelete(item.id)}
                        style={styles.deleteBtn}
                      />
                    </View>
                  </Card>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* MODAL DE EDICIÓN */}
        <Portal>
          <Modal
            visible={editModalVisible}
            onDismiss={() => setEditModalVisible(false)}
          >
            <SafeAreaView style={{ flex: 1 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>✏️ Editar video</Text>
                  <Text style={styles.modalSubtitle}>
                    Semana {videoToEdit?.week}
                  </Text>

                  <IconButton
                    icon="close"
                    size={22}
                    onPress={() => setEditModalVisible(false)}
                  />
                </View>

                <TextInput
                  label="Nombre de la liga"
                  value={editLeagueName}
                  onChangeText={setEditLeagueName}
                  mode="outlined"
                  style={{ marginBottom: 16 }}
                />

                {/* 🎬 VIDEO */}
                {videoToEdit && (
                  <Video
                    source={{
                      uri: editVideo?.uri ? editVideo.uri : videoToEdit.video,
                    }}
                    style={styles.video}
                    useNativeControls
                  />
                )}

                {/* 🖼 THUMBNAIL */}
                {videoToEdit && (
                  <Image
                    source={{
                      uri: editThumbnail?.uri
                        ? editThumbnail.uri
                        : videoToEdit.thumbail,
                    }}
                    style={styles.thumbnail}
                  />
                )}

                {/* Actions */}
                <Button
                  icon="video"
                  mode="outlined"
                  onPress={async () => {
                    const res = await DocumentPicker.getDocumentAsync({
                      type: "video/*",
                    });
                    if (!res.canceled && res.assets?.length > 0)
                      setEditVideo(res.assets[0]);
                  }}
                  style={styles.actionBtn}
                >
                  Cambiar video
                </Button>

                <Button
                  icon="image"
                  mode="outlined"
                  onPress={async () => {
                    const res = await DocumentPicker.getDocumentAsync({
                      type: "image/*",
                    });
                    if (!res.canceled && res.assets?.length > 0)
                      setEditThumbnail(res.assets[0]);
                  }}
                  style={styles.actionBtn}
                >
                  Cambiar thumbnail
                </Button>

                <Button
                  mode="contained"
                  onPress={handleConfirmEdit}
                  style={styles.saveBtn}
                >
                  Guardar cambios
                </Button>
              </ScrollView>
            </SafeAreaView>
          </Modal>
        </Portal>

        {loading && (
          <ActivityIndicator
            animating
            color="#1DB954"
            style={{ marginTop: 10 }}
          />
        )}
        {message ? (
          <Text
            style={{
              marginTop: 20,
              color: message.startsWith("✅") ? "green" : "orange",
            }}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </PrivateLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 20,
  },

  cardWrapper: {
    width: "50%", // 🔑 2 columnas
    padding: 6,
  },

  actions: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
  },

  editBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    marginRight: 4,
  },

  deleteBtn: {
    backgroundColor: "rgba(255,0,0,0.7)",
  },
  thumbnail: {
    width: "100%",
    height: 220,
  },
  modalContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    maxHeight: "92%", // 🔑 evita overflow
  },

  modalContent: {
    padding: 16,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#666",
  },

  video: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#000",
    marginBottom: 16,
  },

  actionBtn: {
    marginBottom: 12,
  },

  saveBtn: {
    marginTop: 20,
    backgroundColor: "#1DB954",
  },
  weekChip: {
    marginRight: 8,
    height: 32, // 🔑 reduce altura
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
  },

  weekChipSelected: {
    backgroundColor: "#1DB954", // 💚 tu color
  },

  weekChipText: {
    fontSize: 13,
    paddingHorizontal: 6, // 🔑 menos ancho
    color: "#333",
  },

  weekChipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});
