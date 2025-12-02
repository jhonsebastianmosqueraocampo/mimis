import { LoadShortItem, ShortItem } from "@/types";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    Image,
    Modal,
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

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (item: LoadShortItem) => void;
  editing?: ShortItem | null;
};

export default function ShortModal({
  visible,
  onClose,
  onSave,
  editing,
}: Props) {
  const [video, setVideo] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    if (editing) {
      setVideo(editing.video);
      setThumbnail(editing.thumbnail);
      setDescripcion(editing.descripcion);
      setFecha(editing.fecha);
    } else {
      setVideo("");
      setThumbnail("");
      setDescripcion("");
      setFecha(new Date().toISOString().slice(0, 10));
    }
  }, [editing]);

  const pickThumbnail = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setThumbnail(result.assets[0].uri);
    }
  };

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*",
      copyToCacheDirectory: true,
    });

    if (result.assets && result.assets.length > 0) {
      setVideo(result.assets[0].uri);
    }
  };

  const handleSave = () => {
  if (!video || !thumbnail || !descripcion) return;

  const item: LoadShortItem | ShortItem = editing
    ? { ...editing, video, thumbnail, descripcion, fecha } // mantiene el ID
    : { video, thumbnail, descripcion, fecha };            // sin ID → nuevo

  onSave(item);
};

  return (
    <Modal animationType="slide" visible={visible} transparent>
      <View style={styles.backdrop}>
        <View style={styles.box}>

          {/* Cerrar */}
          <View style={styles.closeRow}>
            <IconButton icon="close" onPress={onClose} />
          </View>

          <Text variant="titleLarge" style={styles.title}>
            {editing ? "Editar Short" : "Nuevo Short"}
          </Text>

          {/* Thumbnail */}
          <TouchableOpacity onPress={pickThumbnail} style={styles.thumbPicker}>
            {thumbnail ? (
              <Image source={{ uri: thumbnail }} style={styles.thumbImg} />
            ) : (
              <Text style={styles.thumbText}>Seleccionar Thumbnail</Text>
            )}
          </TouchableOpacity>

          {/* Video */}
          <Button
            mode="outlined"
            icon="video"
            onPress={pickVideo}
            style={{ marginTop: 10 }}
          >
            {video ? "Cambiar video" : "Seleccionar video"}
          </Button>
          <HelperText type="info" visible={!!video}>
            {video ? video.split("/").pop() : ""}
          </HelperText>

          {/* Descripción */}
          <TextInput
            mode="outlined"
            label="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            style={{ marginTop: 10 }}
          />

          {/* Fecha */}
          <TextInput
            mode="outlined"
            label="Fecha"
            value={fecha}
            onChangeText={setFecha}
            style={{ marginTop: 10 }}
          />

          <Button
            mode="contained"
            onPress={handleSave}
            style={{ marginTop: 20 }}
            disabled={!video || !thumbnail || !descripcion}
          >
            Guardar
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  box: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
  },
  closeRow: {
    alignItems: "flex-end",
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
  },
  thumbPicker: {
    width: "100%",
    height: 180,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  thumbText: {
    color: "#777",
  },
});