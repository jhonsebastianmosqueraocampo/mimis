import { useFetch } from "@/hooks/FetchContext";
import { NewsItem, NewsPayload } from "@/types";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Chip, Divider, Text, TextInput } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type Props = {
  visible: boolean;
  onClose: () => void;
  existingNews?: NewsItem | null;
};

const GREEN = "#2ecc71";
const ENTIDADES = ["Jugador", "Equipo", "Entrenador"];

export default function NewsForm({ visible, onClose, existingNews }: Props) {
  const { createUserNew, editUserNew } = useFetch();

  const isEdit = !!existingNews;

  const [titulo, setTitulo] = useState("");
  const [entidad, setEntidad] = useState("");
  const [fotoPrincipal, setFotoPrincipal] = useState("");
  const [urlFotoPrincipal, setUrlFotoPrincipal] = useState("");
  const [desarrolloInicialNoticia, setDesarrolloInicialNoticia] = useState("");
  const [carruselFotos, setCarruselFotos] = useState<
    { foto: string; url: string }[]
  >([]);
  const [desarrolloFinalNoticia, setDesarrolloFinalNoticia] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar datos si viene noticia existente (editar)
  useEffect(() => {
    if (existingNews) {
      setTitulo(existingNews.titulo);
      setEntidad(existingNews.entidad);
      setFotoPrincipal(existingNews.fotoPrincipal);
      setUrlFotoPrincipal(existingNews.urlFotoPrincipal);
      setDesarrolloInicialNoticia(existingNews.desarrolloInicialNoticia);
      setCarruselFotos(existingNews.carruselFotos);
      setDesarrolloFinalNoticia(existingNews.desarrolloFinalNoticia);
    } else {
      // si es crear, limpiar
      setTitulo("");
      setEntidad("");
      setFotoPrincipal("");
      setUrlFotoPrincipal("");
      setDesarrolloInicialNoticia("");
      setCarruselFotos([]);
      setDesarrolloFinalNoticia("");
    }
  }, [existingNews]);

  // ==========================
  //  Selector de imagen (galería)
  // ==========================
  const pickImage = async (onSelect: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (!result.canceled) {
      onSelect(result.assets[0].uri);
    }
  };

  const addCarruselFoto = () => {
    setCarruselFotos([...carruselFotos, { foto: "", url: "" }]);
  };

  const updateCarruselFoto = (
    index: number,
    key: "foto" | "url",
    value: string
  ) => {
    const updated = [...carruselFotos];
    updated[index][key] = value;
    setCarruselFotos(updated);
  };

  const removeCarruselFoto = (index: number) => {
    setCarruselFotos(carruselFotos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newNew: NewsPayload = {
        titulo,
        entidad,
        fotoPrincipal,
        urlFotoPrincipal,
        desarrolloInicialNoticia,
        carruselFotos,
        desarrolloFinalNoticia
      };

      const {success, message} = isEdit
        ? await editUserNew(existingNews!.id, newNew)
        : await createUserNew(newNew);

      if (!success) {
        setError(message || "No se pudo guardar la noticia.");
        setLoading(false);
        return;
      }

      setSuccess("Noticia guardada exitosamente 🎉");

      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      {/* HEADER VERDE */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEdit ? "Editar noticia" : "Crear noticia"}
        </Text>

        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* PREVIEW FOTO PRINCIPAL */}
        {fotoPrincipal ? (
          <Image
            source={{ uri: fotoPrincipal }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        ) : null}

        {/* TÍTULO */}
        <TextInput
          label="Título"
          value={titulo}
          onChangeText={setTitulo}
          mode="outlined"
          style={styles.input}
          outlineColor={GREEN}
        />

        {/* FOTO PRINCIPAL (URL + GALERÍA) */}
        <Text style={styles.label}>Foto principal</Text>

        <Button
          mode="outlined"
          icon="image"
          onPress={() => pickImage(setFotoPrincipal)}
          style={styles.outlinedButton}
          textColor={GREEN}
        >
          Seleccionar desde galería
        </Button>

        <TextInput
          label="Foto principal (URL)"
          value={fotoPrincipal}
          onChangeText={setFotoPrincipal}
          mode="outlined"
          style={styles.input}
          outlineColor={GREEN}
        />

        <TextInput
          label="URL origen de la foto"
          value={urlFotoPrincipal}
          onChangeText={setUrlFotoPrincipal}
          mode="outlined"
          style={styles.input}
          outlineColor={GREEN}
        />

        {/* ENTIDAD - SELECT CON CHIPS */}
        <Text style={styles.label}>Entidad relacionada</Text>
        <View style={styles.entityContainer}>
          {ENTIDADES.map((opt) => (
            <Chip
              key={opt}
              selected={entidad === opt}
              onPress={() => setEntidad(opt)}
              style={[
                styles.chip,
                entidad === opt && { backgroundColor: GREEN },
              ]}
              textStyle={{
                color: entidad === opt ? "white" : "black",
                fontWeight: "bold",
              }}
            >
              {opt}
            </Chip>
          ))}
        </View>

        <Divider style={{ marginVertical: 15 }} />

        {/* DESARROLLO INICIAL */}
        <TextInput
          label="Desarrollo inicial de la noticia"
          value={desarrolloInicialNoticia}
          onChangeText={setDesarrolloInicialNoticia}
          multiline
          mode="outlined"
          style={styles.input}
          outlineColor={GREEN}
        />

        {/* CARRUSEL DE FOTOS */}
        <Text style={styles.sectionTitle}>🖼 Carrusel de fotos</Text>

        {carruselFotos.map((item, i) => (
          <View key={i} style={styles.carruselItem}>
            {/* PREVIEW CARRUSEL */}
            {item.foto ? (
              <Image
                source={{ uri: item.foto }}
                style={styles.carruselImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.emptyImage}>
                <Icon name="image-off" size={40} color="#777" />
              </View>
            )}

            {/* BOTÓN GALERÍA */}
            <Button
              mode="outlined"
              icon="image"
              onPress={() =>
                pickImage((uri) => updateCarruselFoto(i, "foto", uri))
              }
              style={styles.carruselButton}
              textColor={GREEN}
            >
              Seleccionar foto desde galería
            </Button>

            {/* URL FOTO */}
            <TextInput
              label="Foto URL (opcional)"
              value={item.foto}
              onChangeText={(t) => updateCarruselFoto(i, "foto", t)}
              mode="outlined"
              style={styles.input}
              outlineColor={GREEN}
            />

            {/* URL ORIGEN */}
            <TextInput
              label="URL origen"
              value={item.url}
              onChangeText={(t) => updateCarruselFoto(i, "url", t)}
              mode="outlined"
              style={styles.input}
              outlineColor={GREEN}
            />

            {/* ELIMINAR ITEM */}
            <TouchableOpacity
              onPress={() => removeCarruselFoto(i)}
              style={styles.deleteCarruselBtn}
            >
              <Icon name="trash-can" size={22} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ))}

        <Button
          mode="outlined"
          icon="plus"
          onPress={addCarruselFoto}
          style={styles.outlinedButton}
          textColor={GREEN}
        >
          Agregar foto al carrusel
        </Button>

        <Divider style={{ marginVertical: 15 }} />

        {/* DESARROLLO FINAL */}
        <TextInput
          label="Desarrollo final de la noticia"
          value={desarrolloFinalNoticia}
          onChangeText={setDesarrolloFinalNoticia}
          multiline
          mode="outlined"
          style={styles.input}
          outlineColor={GREEN}
        />

        {/* BOTONES */}
        <Button
          mode="contained"
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: GREEN }]}
        >
          Guardar noticia
        </Button>

        <Button onPress={onClose} style={{ marginTop: 10 }}>
          Cancelar
        </Button>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  mainImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "white",
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: "#333",
  },
  entityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    borderWidth: 1,
    borderColor: GREEN,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  carruselItem: {
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    position: "relative",
  },
  carruselImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  emptyImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteCarruselBtn: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  outlinedButton: {
    borderColor: GREEN,
    marginBottom: 15,
    borderRadius: 10,
  },
  carruselButton: {
    borderColor: GREEN,
    marginBottom: 10,
    borderRadius: 10,
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 10,
  },
});
