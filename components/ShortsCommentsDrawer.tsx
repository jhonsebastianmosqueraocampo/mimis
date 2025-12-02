import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { ActivityIndicator, Button, Modal, Portal, Text } from "react-native-paper";

type CommentsDrawerProps = {
  visible: boolean;
  onClose: () => void;
  shortId: string;
  comments: string[];
  sendComment: (id: string, text: string) => Promise<{ success: boolean; message?: string }>;
  loading?: boolean;
};

export default function ShortsCommentsDrawer({
  visible,
  onClose,
  shortId,
  comments,
  sendComment,
  loading = false,
}: CommentsDrawerProps) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendComment(shortId, text);
    setText("");
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Comentarios</Text>

        {/* Lista de comentarios */}
        <View style={styles.list}>
          {comments.map((c, idx) => (
            <Text key={idx} style={styles.comment}>
              {c}
            </Text>
          ))}
        </View>

        {/* Input de comentario */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Escribe un comentario..."
            style={styles.input}
            value={text}
            onChangeText={setText}
          />

          <Button mode="contained" onPress={handleSend} disabled={loading}>
            {loading ? (
              <ActivityIndicator animating size="small" color="#fff" />
            ) : (
              "Enviar"
            )}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "50%",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  list: {
    marginTop: 16,
    maxHeight: 300,
  },
  comment: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  inputRow: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 10,
  },
});