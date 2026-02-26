import { AddressForm } from "@/types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  findNodeHandle,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import {
  Button,
  Divider,
  IconButton,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";

type AddressModalProps = {
  visible: boolean;
  initial?: AddressForm;
  onClose: () => void;
  onSave: (addr: AddressForm) => void;
};

const isAddressValid = (a: AddressForm) => {
  // básico y claro (ajústalo)
  return (
    a.recipientName.trim().length >= 2 &&
    a.phone.trim().length >= 7 &&
    a.city.trim().length >= 2 &&
    a.neighborhood.trim().length >= 2 &&
    a.streetNumber.trim().length >= 1 &&
    a.streetNumber2.trim().length >= 1
  );
};

export function AddressModal({
  visible,
  initial,
  onClose,
  onSave,
}: AddressModalProps) {
  const [form, setForm] = useState<AddressForm>(
    initial ?? {
      recipientName: "",
      phone: "",
      city: "",
      neighborhood: "",
      streetType: "Calle",
      streetNumber: "",
      streetNumber2: "",
      complement: "",
      references: "",
      mapsUrl: "",
    },
  );

  useEffect(() => {
    if (visible) {
      setForm(
        initial ?? {
          recipientName: "",
          phone: "",
          city: "",
          neighborhood: "",
          streetType: "Calle",
          streetNumber: "",
          streetNumber2: "",
          complement: "",
          references: "",
          mapsUrl: "",
        },
      );
    }
  }, [visible, initial]);
  const scrollRef = useRef<ScrollView>(null);

  const ok = useMemo(() => isAddressValid(form), [form]);

  const openMaps = async () => {
    // abre Maps para que el usuario ubique y copie el link si quiere
    // (cuando quieras, lo mejoramos para capturar ubicación actual)
    await Linking.openURL("https://www.google.com/maps");
  };

  const scrollToInput = (reactNode: any) => {
    const node = findNodeHandle(reactNode);
    if (!node || !scrollRef.current) return;

    scrollRef.current.scrollTo({ y: 300, animated: true });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        animationType="slide"
        transparent
      >
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardContainer}
          >
            <View style={styles.modalBox}>
              {/* HEADER */}
              <View style={styles.header}>
                <Text style={styles.title}>📍 Dirección de entrega</Text>
                <IconButton icon="close" size={22} onPress={onClose} />
              </View>

              {/* SCROLL */}
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  mode="outlined"
                  label="Nombre de quien recibe"
                  value={form.recipientName}
                  onChangeText={(v) =>
                    setForm((p) => ({ ...p, recipientName: v }))
                  }
                  style={styles.input}
                />

                <TextInput
                  mode="outlined"
                  label="Teléfono"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
                  style={styles.input}
                />

                <Divider style={styles.divider} />

                <TextInput
                  mode="outlined"
                  label="Ciudad"
                  value={form.city}
                  onChangeText={(v) => setForm((p) => ({ ...p, city: v }))}
                  style={styles.input}
                />

                <TextInput
                  mode="outlined"
                  label="Barrio"
                  value={form.neighborhood}
                  onChangeText={(v) =>
                    setForm((p) => ({ ...p, neighborhood: v }))
                  }
                  style={styles.input}
                />

                <Text style={styles.sectionLabel}>Tipo de vía</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 12 }}
                >
                  <SegmentedButtons
                    value={form.streetType}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        streetType: v as AddressForm["streetType"],
                      }))
                    }
                    buttons={[
                      { value: "Calle", label: "Calle" },
                      { value: "Carrera", label: "Cra" },
                      { value: "Avenida", label: "Av" },
                      { value: "Diagonal", label: "Diag" },
                      { value: "Transversal", label: "Transv" },
                    ]}
                  />
                </ScrollView>

                <View style={styles.row}>
                  <TextInput
                    mode="outlined"
                    label={form.streetType}
                    keyboardType="number-pad"
                    value={form.streetNumber}
                    onChangeText={(v) =>
                      setForm((p) => ({ ...p, streetNumber: v }))
                    }
                    style={[styles.input, { flex: 1 }]}
                  />

                  <TextInput
                    mode="outlined"
                    label="#"
                    keyboardType="default"
                    value={form.streetNumber2}
                    onChangeText={(v) => {
                      const clean = v.replace(/[^0-9\- ]/g, "");
                      setForm((p) => ({ ...p, streetNumber2: clean }));
                    }}
                    style={[styles.input, { flex: 1 }]}
                  />
                </View>

                <TextInput
                  mode="outlined"
                  label="Complemento"
                  value={form.complement}
                  onChangeText={(v) =>
                    setForm((p) => ({ ...p, complement: v }))
                  }
                  style={styles.input}
                />

                <TextInput
                  mode="outlined"
                  label="Referencias"
                  value={form.references}
                  onChangeText={(v) =>
                    setForm((p) => ({ ...p, references: v }))
                  }
                  multiline
                  style={styles.input}
                  onFocus={(e) => scrollToInput(e.target)}
                />

                <TextInput
                  mode="outlined"
                  label="Link Google Maps (opcional)"
                  value={form.mapsUrl ?? ""}
                  onChangeText={(v) => setForm((p) => ({ ...p, mapsUrl: v }))}
                  style={styles.input}
                  onFocus={(e) => scrollToInput(e.target)}
                />

                <Button mode="text" onPress={openMaps}>
                  Abrir Google Maps
                </Button>
              </ScrollView>
              <View style={styles.footer}>
                <Button mode="outlined" onPress={onClose} style={{ flex: 1 }}>
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => onSave(form)}
                  disabled={!ok}
                  style={{ flex: 1 }}
                >
                  Guardar
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    width: "100%",
    justifyContent: "flex-end",
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalBox: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
    paddingHorizontal: 20, // 👈 espacio lateral correcto
    paddingTop: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  input: {
    marginBottom: 12,
  },

  divider: {
    marginVertical: 12,
  },

  sectionLabel: {
    marginBottom: 6,
    opacity: 0.7,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  footer: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
});
