import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import pluralize from "@/utils/Pluralize";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Checkbox,
  Divider,
  List,
  Modal,
  Portal,
  RadioButton,
  Text,
  useTheme,
} from "react-native-paper";
import type { NotificationSettingProps } from "../types";

export default function NotificationSetting({
  selectedItems,
  handleToggle,
  list,
  labelDescription,
  settingSelectedTitle,
  handleChange,
  selectedSettingsValue,
}: NotificationSettingProps) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const controlProps = (value: string) => ({
    status: selectedSettingsValue === value ? "checked" : "unchecked",
    onPress: () => handleChange(value),
  });

  return (
    <>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text variant="bodyMedium" style={styles.label}>
          {pluralize(2, labelDescription)}
        </Text>

        <RadioButton.Group
          onValueChange={handleChange}
          value={selectedSettingsValue}
        >
          <View style={styles.radioRow}>
            <RadioButton value="todos" color={theme.colors.primary} />
            <Text style={styles.radioLabel}>
              Recibir de todos mis {pluralize(2, labelDescription)}
            </Text>
          </View>

          <View style={styles.radioRow}>
            <RadioButton value="personalizado" color={theme.colors.primary} />
            <Text style={styles.radioLabel}>Personalizada</Text>

            {selectedSettingsValue === "personalizado" && (
              <Button
                mode="outlined"
                onPress={() => setVisible(true)}
                style={styles.selectButton}
                labelStyle={{ fontSize: 12 }}
              >
                Elegir {labelDescription}
              </Button>
            )}
          </View>
        </RadioButton.Group>
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={styles.selectedTitle}>{settingSelectedTitle}</Text>
        <ScrollView horizontal>
          {selectedItems.map((item) => (
            <View key={item.id} style={styles.selectedItem}>
              <Image source={{ uri: item.img }} style={styles.icon} />
              <Text style={{ fontSize: 12 }}>{item.title}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <Divider />

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>
            Selecciona tus {pluralize(2, labelDescription)}
          </Text>
          <Text style={styles.modalSubtitle}>
            {selectedItems.length}{" "}
            {pluralize(selectedItems.length, labelDescription)}{" "}
            {pluralize(selectedItems.length, "seleccionado")}
          </Text>

          <ScrollView style={{ maxHeight: 240 }}>
            {list.map((item) => (
              <List.Item
                key={item.id}
                title={item.title}
                left={() => (
                  <Image
                    source={{ uri: item.img }}
                    style={styles.checkboxIcon}
                  />
                )}
                right={() => (
                  <Checkbox
                    status={
                      selectedItems.some((t) => t.id === item.id)
                        ? "checked"
                        : "unchecked"
                    }
                    onPress={() => handleToggle(item)}
                    color={theme.colors.primary}
                  />
                )}
              />
            ))}
          </ScrollView>

          <Button
            mode="contained"
            onPress={() => setVisible(false)}
            style={styles.closeButton}
          >
            Cerrar
          </Button>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontFamily: typography.title.fontFamily,
    fontSize: 15,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  radioLabel: {
    fontFamily: typography.title.fontFamily,
    fontWeight: "600",
    fontSize: 14,
    color: colors.text,
    marginRight: 8,
  },
  selectButton: {
    borderColor: colors.primary,
    marginLeft: 8,
  },
  selectedTitle: {
    fontWeight: "bold",
    fontFamily: typography.title.fontFamily,
    marginBottom: 4,
  },
  selectedItem: {
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  checkboxIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
    borderRadius: 4,
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
  },
});
