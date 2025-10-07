import { Image, StyleSheet, Text, View } from "react-native";
import { Modal, Portal } from "react-native-paper";

export default function Loading({ visible }: { visible: boolean }) {
  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={styles.loadingContainer}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("@/assets/field.jpg")}
            style={{ width: 80, height: 80, marginBottom: 16 }}
          />
          <Text style={{ textAlign: "center" }}>
            ⚽ Cargando… Estamos organizando la alineación ideal
          </Text>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: "#fff",
    padding: 32,
    margin: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
