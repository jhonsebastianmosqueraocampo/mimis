import Loading from "@/components/Loading";
import { useFetch } from "@/hooks/FetchContext";
import { User, WeeklyGoalVideo } from "@/types";
import { ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import { Image, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Menu,
  Text,
  TextInput,
} from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function LoadSyntheticVideos() {
  const {
    getSyntheticVideo,
    loadSyntheticVideo,
    editSyntheticVideo,
    deleteSyntheticVideo,
    getUsers,
  } = useFetch();

  const [mode, setMode] = useState<"upload" | "edit">("upload");

  // ---- VIDEOS DE BACKEND ----
  const [videosFromApi, setVideosFromApi] = useState<WeeklyGoalVideo[]>([]);

  // --- estados subida ---
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [video, setVideo] = useState<any>(null);
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [fixtureA, setFixtureA] = useState("");
  const [fixtureB, setFixtureB] = useState("");

  // 🔥 LISTA REAL DE USUARIOS
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User>();

  const [userMenuVisible, setUserMenuVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- estados edición ---
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<WeeklyGoalVideo | null>(null);
  const [editVideo, setEditVideo] = useState<any>(null);
  const [editThumbnail, setEditThumbnail] = useState<any>(null);
  const [editFixtureA, setEditFixtureA] = useState("");
  const [editFixtureB, setEditFixtureB] = useState("");

  const [editUser, setEditUser] = useState<User>();
  const [editUserMenuVisible, setEditUserMenuVisible] = useState(false);

  // 📌 FORMATO YYYY/MM/DD
  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${y}/${m}/${d}`;
  };

  // 📌 OBTENER ÚLTIMO DOMINGO
  const getLastSundayDate = (): Date => {
    const today = new Date();
    const daysSinceSunday = today.getDay();
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - daysSinceSunday);
    lastSunday.setHours(0, 0, 0, 0);
    return lastSunday;
  };

  const getLastSunday = (): string => formatDate(getLastSundayDate());

  const getLastSundays = (): string[] => {
    const sundays: string[] = [];
    const base = getLastSundayDate();
    for (let i = 0; i < 6; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - i * 7);
      sundays.push(formatDate(d));
    }
    return sundays;
  };

  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);

  // 🔥 CARGAR LISTA REAL DE USUARIOS
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { users, success } = await getUsers();
        if (success && users) {
          setUsersList(users);
          setSelectedUser(users[0]);
        }
      } catch {
        console.log("Error cargando usuarios");
      }
    };

    loadUsers();
  }, []);

  // ▶️ USEEFFECT INICIAL
  useEffect(() => {
    const week = getLastSunday();
    setSelectedWeek(week);
    setSelectedDate(getLastSundayDate());
    setAvailableWeeks(getLastSundays());
    fetchVideos(week);
  }, []);

  // ▶️ GET VIDEOS DEL BACK
  const fetchVideos = async (week: string) => {
    setLoading(true);
    setMessage("");
    try {
      const { videos, success, message } = await getSyntheticVideo(week);
      console.log(video);
      if (success) {
        setVideosFromApi(videos || []);
      } else {
      }
    } catch {
      setMessage(message || "❌ Error al conectar");
    } finally {
      setLoading(false);
    }
  };

  // 📅 seleccionar fecha
  const handleConfirm = (date: Date) => {
    if (date.getDay() !== 0) {
      setMessage("⚠️ Solo domingos");
      setDatePickerVisible(false);
      return;
    }
    setSelectedDate(date);
    setDatePickerVisible(false);
    const week = formatDate(date);
    setSelectedWeek(week);
    fetchVideos(week);
  };

  const pickVideo = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: "video/*" });
    if (!res.canceled) setVideo(res.assets[0]);
  };

  const pickThumbnail = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: "image/*" });
    if (!res.canceled) setThumbnail(res.assets[0]);
  };

  // ▶️ SUBIR VIDEO
  const handleSubmit = async () => {
    if (!selectedDate || !video || !thumbnail || !fixtureA || !fixtureB) {
      setMessage("⚠️ Debes completar todos los campos");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("week", selectedWeek!);
      formData.append("fixtureA", fixtureA);
      formData.append("fixtureB", fixtureB);
      formData.append("userId", selectedUser!.id);
      formData.append("userName", selectedUser!.nickName);

      formData.append("video", {
        uri: video.uri,
        name: video.name,
        type: video.mimeType,
      } as any);

      formData.append("thumbail", {
        uri: thumbnail.uri,
        name: thumbnail.name,
        type: thumbnail.mimeType,
      } as any);

      const { success, message } = await loadSyntheticVideo(formData);
      if (success) {
        setMessage("✅ Video subido");
        setFixtureA("");
        setFixtureB("");
        setVideo(null);
        setThumbnail(null);
        fetchVideos(selectedWeek!);
      } else setMessage(message || "❌ Error");
    } catch {
      setMessage("❌ Error de servidor");
    } finally {
      setLoading(false);
    }
  };

  // ▶️ EDITAR
  const handleOpenEdit = (v: WeeklyGoalVideo) => {
    setVideoToEdit(v);
    setEditFixtureA(v.fixture.teamA);
    setEditFixtureB(v.fixture.teamB);

    const userFromList = usersList.find((x) => x.id === v.user?.id);
    setEditUser(userFromList || usersList[0]);

    setEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    const { success, message } = await deleteSyntheticVideo(id);
    setMessage(success ? "🗑 Eliminado" : message || "❌ Error");
    if (success) fetchVideos(selectedWeek!);
  };

  const handleConfirmEdit = async () => {
    if (!videoToEdit) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("week", videoToEdit.week);
      formData.append("fixtureA", editFixtureA);
      formData.append("fixtureB", editFixtureB);
      formData.append("userId", editUser!.id);
      formData.append("userName", editUser!.nickName);

      if (editVideo)
        formData.append("video", {
          uri: editVideo.uri,
          name: editVideo.name,
          type: editVideo.mimeType,
        } as any);

      if (editThumbnail)
        formData.append("thumbail", {
          uri: editThumbnail.uri,
          name: editThumbnail.name,
          type: editThumbnail.mimeType,
        } as any);

      const { success, message } = await editSyntheticVideo(
        videoToEdit.id,
        formData,
      );

      setMessage(success ? "✅ Actualizado" : message || "❌ Error");

      fetchVideos(selectedWeek!);
    } finally {
      setLoading(false);
      setEditModalVisible(false);
    }
  };

  // ▶️ LISTA FINAL
  const filteredVideos = videosFromApi;

  if (loading) {
    return (
      <Loading
        visible={loading}
        title="Cargando"
        subtitle="Pronto tendrás la información"
      />
    );
  }

  return (
    <PrivateLayout>
      <View style={{ flex: 1, padding: 20 }}>
        <Text variant="titleLarge" style={{ marginBottom: 20 }}>
          ⚽ Gestión de Videos Semanales - Cancha Sintética
        </Text>

        {/* Chips modo */}
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

        {/* Fecha */}
        <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
          <TextInput
            label="Fecha (domingo)"
            value={selectedDate ? selectedWeek! : ""}
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

        {/* ---- MODO SUBIR ---- */}
        {mode === "upload" ? (
          <ScrollView>
            <Menu
              visible={userMenuVisible}
              onDismiss={() => setUserMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setUserMenuVisible(true)}
                  style={{ marginBottom: 15 }}
                >
                  👤 {selectedUser?.nickName ?? "Seleccionar usuario"}
                </Button>
              }
            >
              {usersList.map((u, index) => (
                <Menu.Item
                  key={index}
                  title={u.nickName}
                  onPress={() => {
                    setSelectedUser(u);
                    setUserMenuVisible(false);
                  }}
                />
              ))}
            </Menu>

            <TextInput
              label="Equipo A"
              value={fixtureA}
              onChangeText={setFixtureA}
              style={{ marginBottom: 10 }}
            />
            <TextInput
              label="Equipo B"
              value={fixtureB}
              onChangeText={setFixtureB}
              style={{ marginBottom: 20 }}
            />

            <Button icon="video" mode="outlined" onPress={pickVideo}>
              {video ? "Cambiar video" : "Seleccionar video"}
            </Button>
            {video && (
              <View
                style={{ marginTop: 10, borderRadius: 10, overflow: "hidden" }}
              >
                <Video
                  source={{ uri: video.uri }}
                  style={{ width: "100%", height: 220 }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                />
              </View>
            )}
            <Button
              icon="image"
              mode="outlined"
              onPress={pickThumbnail}
              style={{ marginTop: 10 }}
            >
              {thumbnail ? "Cambiar thumbnail" : "Seleccionar thumbnail"}
            </Button>

            {thumbnail && (
              <Image
                source={{ uri: thumbnail.uri }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 10,
                  marginTop: 10,
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
          </ScrollView>
        ) : (
          // ---- MODO EDIT ----
          <ScrollView style={{ flex: 1 }}>
            {/* GRID DOBLE COLUMNA */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                paddingVertical: 20,
              }}
            >
              {filteredVideos.map((item) => (
                <View key={item.id} style={{ width: "48%", marginBottom: 10 }}>
                  <Card>
                    <Card.Cover
                      source={{
                        uri: item.thumbail,
                      }}
                    />
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
                        style={{
                          backgroundColor: "rgba(255,0,0,0.6)",
                        }}
                      />
                    </View>
                  </Card>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* ---- MODAL EDITAR ---- */}
        <Modal visible={editModalVisible} animationType="slide">
          <View style={{ flex: 1, padding: 20 }}>
            <Text variant="titleLarge" style={{ marginBottom: 20 }}>
              ✏️ Editar video - {videoToEdit?.week}
            </Text>

            <TextInput
              label="Equipo A"
              value={editFixtureA}
              onChangeText={setEditFixtureA}
              style={{ marginBottom: 10 }}
            />

            <TextInput
              label="Equipo B"
              value={editFixtureB}
              onChangeText={setEditFixtureB}
              style={{ marginBottom: 20 }}
            />

            <Menu
              visible={editUserMenuVisible}
              onDismiss={() => setEditUserMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setEditUserMenuVisible(true)}
                  style={{ marginBottom: 15 }}
                >
                  👤 {editUser?.nickName ?? "Seleccionar usuario"}
                </Button>
              }
            >
              {usersList.map((u, index) => (
                <Menu.Item
                  key={index}
                  title={u.nickName}
                  onPress={() => {
                    setEditUser(u);
                    setEditUserMenuVisible(false);
                  }}
                />
              ))}
            </Menu>

            <Button
              icon="video"
              mode="outlined"
              onPress={async () => {
                const res = await DocumentPicker.getDocumentAsync({
                  type: "video/*",
                });
                if (!res.canceled) setEditVideo(res.assets[0]);
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
                if (!res.canceled) setEditThumbnail(res.assets[0]);
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

        {loading && <ActivityIndicator animating color="#1DB954" />}
        {!!message && (
          <Text
            style={{
              marginTop: 20,
              color: message.startsWith("✅")
                ? "green"
                : message.startsWith("❌")
                  ? "red"
                  : "orange",
            }}
          >
            {message}
          </Text>
        )}
      </View>
    </PrivateLayout>
  );
}
