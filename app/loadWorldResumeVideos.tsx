import { useFetch } from "@/hooks/FetchContext";
import { WeeklyWorldTopVideo } from "@/types";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
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
  Text,
  TextInput,
} from "react-native-paper";
import PrivateLayout from "./privateLayout";


export default function LoadWorldResumeVideos() {
  const { loadWorldTop10, getVideosWorldTop10, editWorldTop10, deleteWorldTop10 } = useFetch();

  const [ videos, setVideos ] = useState<WeeklyWorldTopVideo[]>([])
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<WeeklyWorldTopVideo | null>(null);
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

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

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
    if (!selectedDate || !video || !thumbnail) {
      setMessage("⚠️ Debes seleccionar fecha, video y thumbnail");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("week", formatDate(selectedDate));
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

      const { success, message } = await editWorldTop10(videoToEdit.id, formData);

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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {uniqueWeeks.map((week) => (
                <Chip
                  key={week}
                  selected={selectedWeek === week}
                  onPress={() =>
                    setSelectedWeek(selectedWeek === week ? null : week)
                  }
                  style={{ marginRight: 8 }}
                >
                  {week}
                </Chip>
              ))}
            </ScrollView>

            {/* GRID */}
            <FlatList
              data={filteredVideos}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={{ paddingVertical: 20 }}
              renderItem={({ item }) => (
                <View style={{ flex: 1, margin: 5 }}>
                  <Card>
                    <Card.Cover source={{ uri: item.thumbail }} />
                    <View
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        flexDirection: "row",
                      }}
                    >
                      <IconButton
                        icon="pencil"
                        size={20}
                        iconColor="white"
                        onPress={() => handleOpenEdit(item)}
                        style={{
                          backgroundColor: "rgba(0,0,0,0.6)",
                          marginRight: 4,
                        }}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        iconColor="white"
                        onPress={() => handleDelete(item.id)}
                        style={{ backgroundColor: "rgba(255,0,0,0.6)" }}
                      />
                    </View>
                  </Card>
                </View>
              )}
            />
          </View>
        )}

        {/* MODAL DE EDICIÓN */}
        <Modal visible={editModalVisible} animationType="slide">
          <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
            <Text variant="titleLarge" style={{ marginBottom: 20 }}>
              ✏️ Editar video de la semana {videoToEdit?.week}
            </Text>

            {videoToEdit && (
              <Image
                source={{ uri: videoToEdit.thumbail }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 10,
                  marginBottom: 20,
                }}
              />
            )}

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
              style={{ marginBottom: 10 }}
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
            >
              Cambiar thumbnail
            </Button>

            <Button
              mode="contained"
              onPress={handleConfirmEdit}
              style={{ marginTop: 30, backgroundColor: "#1DB954" }}
            >
              Guardar cambios
            </Button>

            <Button
              mode="text"
              onPress={() => setEditModalVisible(false)}
              style={{ marginTop: 10 }}
            >
              Cancelar
            </Button>
          </View>
        </Modal>

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
