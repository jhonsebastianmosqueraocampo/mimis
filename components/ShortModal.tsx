import { LoadShortItem, ShortItem } from "@/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  HelperText,
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";

const { height } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (item: LoadShortItem | ShortItem) => void;
  editing?: ShortItem | null;
  loading: boolean;
};

export default function ShortModal({
  visible,
  onClose,
  onSave,
  editing,
  loading,
}: Props) {
  const [video, setVideo] = useState<any>();
  const [thumbnail, setThumbnail] = useState<any>();
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (editing) {
      setVideo(editing.video);
      setThumbnail(editing.thumbnail);
      setDescripcion(editing.descripcion);
      setFecha(new Date(editing.fecha));
    } else {
      setVideo(null);
      setThumbnail(null);
      setDescripcion("");
      setFecha(new Date());
    }
  }, [editing]);

  const pickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setThumbnail(result.assets[0]);
    }
  };

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
      copyToCacheDirectory: true,
    });

    if (result.assets?.length) {
      setVideo(result.assets[0]);
    }
  };

  const handleSave = () => {
    if (!video || !thumbnail || !descripcion) return;

    const payload = {
      ...(editing ?? {}),
      video,
      thumbnail,
      descripcion,
      fecha: fecha.toISOString(),
    };

    onSave(payload);
  };

  return (
    <Modal animationType="fade" visible={visible} transparent>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          {/* HEADER fijo */}
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              {editing ? "Editar short" : "Nuevo short"}
            </Text>
            <IconButton icon="close" onPress={onClose} />
          </View>

          {/* CONTENIDO SCROLLEABLE */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* THUMBNAIL */}
            <TouchableOpacity
              style={styles.thumbPicker}
              onPress={pickThumbnail}
            >
              {thumbnail ? (
                <>
                  <Image
                    source={{ uri: editing ? thumbnail : thumbnail.uri }}
                    style={styles.thumbImg}
                    progressiveRenderingEnabled
                  />
                  <View style={styles.thumbOverlay}>
                    <Text style={styles.thumbOverlayText}>
                      Cambiar thumbnail
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.thumbText}>Seleccionar thumbnail</Text>
              )}
            </TouchableOpacity>

            {/* VIDEO PREVIEW */}
            {video ? (
              <View style={styles.videoBlock}>
                <Video
                  source={{ uri: editing ? video : video.uri }}
                  style={styles.video}
                  useNativeControls
                  // resizeMode="cover"
                />
                <Button
                  mode="outlined"
                  icon="video-outline"
                  onPress={pickVideo}
                  style={styles.changeVideoBtn}
                >
                  Cambiar video
                </Button>
              </View>
            ) : (
              <Button
                mode="outlined"
                icon="video-outline"
                onPress={pickVideo}
                style={styles.field}
              >
                Seleccionar video
              </Button>
            )}

            <HelperText type="info" visible={!!video}>
              {video
                ? editing
                  ? video.split("/").pop()
                  : video.uri.split("/").pop()
                : ""}
            </HelperText>

            {/* DESCRIPCIÓN */}
            <TextInput
              mode="outlined"
              label="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
              style={styles.field}
            />

            {/* FECHA */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateField}
            >
              <Text style={styles.dateLabel}>Fecha</Text>
              <Text style={styles.dateValue}>{fecha.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={fecha}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setFecha(selectedDate);
                }}
              />
            )}

            {/* BOTÓN GUARDAR */}
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveBtn}
              disabled={!video || !thumbnail || !descripcion || loading}
              loading={loading}
            >
              Guardar short
            </Button>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
  },

  thumbPicker: {
    height: 190,
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
    marginTop: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
  thumbOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  thumbOverlayText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 12,
  },
  thumbText: {
    color: "#777",
  },

  field: {
    marginTop: 12,
  },

  dateField: {
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: "#777",
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },

  videoContainer: {
    marginTop: 12,
    borderRadius: 14,
    overflow: "hidden",
  },

  box: {
    backgroundColor: "white",
    borderRadius: 20,
    maxHeight: height * 0.85, // 🔥 CLAVE
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  videoBlock: {
    marginTop: 12,
    borderRadius: 14,
    overflow: "hidden",
  },

  video: {
    width: "100%",
    height: 180, // 🔥 altura controlada
    backgroundColor: "#000",
  },

  changeVideoBtn: {
    marginTop: 8,
  },

  saveBtn: {
    marginTop: 24,
    borderRadius: 12,
  },
});
