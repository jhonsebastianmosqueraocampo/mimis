import { useAuth } from "@/hooks/AuthContext";
import { useFetch } from "@/hooks/FetchContext";
import { CarruselFoto, NewsItem } from "@/types";
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
import {
  Button,
  Chip,
  Divider,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Loading from "./Loading";

type Props = {
  visible: boolean;
  onClose: () => void;
  existingNews?: NewsItem | null;
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
};

const GREEN = "#2ecc71";
const ENTIDADES = ["Jugador", "Equipo", "Entrenador"];

const getImageUri = (foto: string | ImagePicker.ImagePickerAsset): string => {
  // Imagen recién seleccionada (local)
  if (typeof foto !== "string") {
    return foto.uri;
  }

  // Imagen del backend (solo filename)
  return `http://192.168.10.16:3001/api/userNews/image/${foto}`;
};

export default function NewsForm({
  visible,
  onClose,
  existingNews,
  setNews,
}: Props) {
  const { createUserNew, editUserNew } = useFetch();
  const { user } = useAuth();

  const isEdit = !!existingNews;

  const [titulo, setTitulo] = useState("");
  const [entidad, setEntidad] = useState("");
  const [fotoPrincipal, setFotoPrincipal] = useState<any>(null);
  const [urlFotoPrincipal, setUrlFotoPrincipal] = useState("");
  const [desarrolloInicialNoticia, setDesarrolloInicialNoticia] = useState("");
  const [carruselFotos, setCarruselFotos] = useState<CarruselFoto[]>([]);
  const [desarrolloFinalNoticia, setDesarrolloFinalNoticia] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================
  // CARGA EN EDICIÓN
  // ==========================
  useEffect(() => {
    if (existingNews) {
      setTitulo(existingNews.titulo);
      setEntidad(existingNews.entidad);
      setFotoPrincipal(
        `http://192.168.10.16:3001/api/userNews/image/${existingNews.fotoPrincipal}`,
      );
      setUrlFotoPrincipal(existingNews.urlFotoPrincipal);
      setDesarrolloInicialNoticia(existingNews.desarrolloInicialNoticia);
      setCarruselFotos(existingNews.carruselFotos);
      setDesarrolloFinalNoticia(existingNews.desarrolloFinalNoticia);
    } else {
      setTitulo("");
      setEntidad("");
      setFotoPrincipal(null);
      setUrlFotoPrincipal("");
      setDesarrolloInicialNoticia("");
      setCarruselFotos([]);
      setDesarrolloFinalNoticia("");
    }
  }, [existingNews]);

  // ==========================
  // IMAGE PICKER
  // ==========================
  const pickImage = async (
    onSave: (asset: ImagePicker.ImagePickerAsset) => void,
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (!result.canceled) {
      onSave(result.assets[0]);
    }
  };

  // ==========================
  // CARRUSEL HELPERS
  // ==========================
  const addCarruselFoto = () => {
    setCarruselFotos((prev) => [...prev, { foto: "", url: "" }]);
  };

  const updateCarruselFoto = (
    index: number,
    key: "foto" | "url",
    value: ImagePicker.ImagePickerAsset | string,
  ) => {
    setCarruselFotos((prev) => {
      const copy = [...prev];
      copy[index][key] = value as any;
      return copy;
    });
  };

  const removeCarruselFoto = (index: number) => {
    setCarruselFotos((prev) => prev.filter((_, i) => i !== index));
  };

  // ==========================
  // GUARDAR
  // ==========================
  const handleSave = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("titulo", titulo);
      formData.append("entidad", entidad);
      formData.append("urlFotoPrincipal", urlFotoPrincipal);
      formData.append("desarrolloInicialNoticia", desarrolloInicialNoticia);
      formData.append("desarrolloFinalNoticia", desarrolloFinalNoticia);

      // FOTO PRINCIPAL (ya estaba bien)
      if (fotoPrincipal?.uri) {
        formData.append("fotoPrincipal", {
          uri: fotoPrincipal.uri,
          name: fotoPrincipal.fileName || "principal.jpg",
          type: fotoPrincipal.mimeType || "image/jpeg",
        } as any);
      }

      // ===== CARRUSEL =====
      const carruselMeta: { foto: string; url: string }[] = [];

      carruselFotos.forEach((item, index) => {
        if (typeof item.foto === "string") {
          // Imagen existente
          carruselMeta.push({
            foto: item.foto,
            url: item.url,
          });
        } else {
          // Imagen nueva
          const field = `carrusel_${index}`;

          carruselMeta.push({
            foto: field,
            url: item.url,
          });

          formData.append(field, {
            uri: item.foto.uri,
            name: item.foto.fileName || `${field}.jpg`,
            type: item.foto.mimeType || "image/jpeg",
          } as any);
        }
      });

      formData.append("carruselFotos", JSON.stringify(carruselMeta));

      const result = isEdit
        ? await editUserNew(existingNews!.id!, formData)
        : await createUserNew(formData);

      if (!result?.success) {
        setLoading(false);
        return;
      }

      setLoading(false);
      onClose();
    } catch (e) {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading visible title="Cargando" subtitle="Guardando noticia…" />;
  }

  // ==========================
  // RENDER
  // ==========================
  return (
    <Portal>
      <Modal visible={visible} animationType="slide">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEdit ? "Editar noticia" : "Crear noticia"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container}>
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

          {fotoPrincipal && (
            <Image
              source={{
                uri:
                  typeof fotoPrincipal === "string"
                    ? fotoPrincipal
                    : fotoPrincipal.uri,
              }}
              style={styles.mainImage}
            />
          )}

          <TextInput
            label="Título"
            value={titulo}
            onChangeText={setTitulo}
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="outlined"
            icon="image"
            onPress={() => pickImage(setFotoPrincipal)}
            style={styles.outlinedButton}
          >
            Seleccionar foto principal
          </Button>

          <TextInput
            label="URL origen de la foto"
            value={urlFotoPrincipal}
            onChangeText={setUrlFotoPrincipal}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Desarrollo inicial"
            value={desarrolloInicialNoticia}
            onChangeText={setDesarrolloInicialNoticia}
            multiline
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>🖼 Carrusel de fotos</Text>

          {carruselFotos.map((item, i) => {
            const uri = item.foto ? getImageUri(item.foto) : null;

            return (
              <View key={i} style={styles.carruselItem}>
                {uri ? (
                  <Image
                    source={{ uri }}
                    style={styles.carruselImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.emptyImage}>
                    <Icon name="image-off" size={40} color="#777" />
                  </View>
                )}

                <Button
                  mode="outlined"
                  icon="image"
                  onPress={() =>
                    pickImage((asset) => updateCarruselFoto(i, "foto", asset))
                  }
                  style={styles.carruselButton}
                >
                  Seleccionar foto
                </Button>

                <TextInput
                  label="URL origen"
                  value={item.url}
                  onChangeText={(t) => updateCarruselFoto(i, "url", t)}
                  mode="outlined"
                  style={styles.input}
                />
              </View>
            );
          })}

          <Button
            mode="outlined"
            icon="plus"
            onPress={addCarruselFoto}
            style={styles.outlinedButton}
          >
            Agregar foto al carrusel
          </Button>

          <Divider style={{ marginVertical: 15 }} />

          <TextInput
            label="Desarrollo final"
            value={desarrolloFinalNoticia}
            onChangeText={setDesarrolloFinalNoticia}
            multiline
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
          >
            Guardar noticia
          </Button>

          <Button onPress={onClose} style={{ marginBottom: 40 }}>
            Cancelar
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

// estilos: los tuyos, sin cambios
const styles = StyleSheet.create({
  header: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  container: { padding: 20, backgroundColor: "#f7f7f7" },
  mainImage: { width: "100%", height: 200, borderRadius: 12, marginBottom: 16 },
  input: { marginBottom: 15, backgroundColor: "white" },
  sectionTitle: { fontWeight: "bold", marginBottom: 10 },
  carruselItem: {
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  carruselImage: { width: "100%", height: 150, borderRadius: 10 },
  emptyImage: {
    height: 150,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  outlinedButton: { marginBottom: 15 },
  carruselButton: { marginBottom: 10 },
  deleteCarruselBtn: { position: "absolute", top: 10, right: 10 },
  saveButton: { marginTop: 10 },
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
});
