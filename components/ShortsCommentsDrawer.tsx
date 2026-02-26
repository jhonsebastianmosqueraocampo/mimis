import { useAuth } from "@/hooks/AuthContext";
import { ShortItem, User } from "@/types";
import React, { useEffect, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Button, Modal, Portal, Text } from "react-native-paper";

type CommentItem = {
  user: User;
  comment: string;
};

type CommentsDrawerProps = {
  visible: boolean;
  onClose: () => void;
  shortId: string;
  comments: CommentItem[];
  sendComment: (
    id: string,
    text: string,
  ) => Promise<{ success: boolean; message?: string }>;
  loading?: boolean;
  setShorts: React.Dispatch<React.SetStateAction<ShortItem[]>>;
};

export default function ShortsCommentsDrawer({
  visible,
  onClose,
  shortId,
  comments,
  sendComment,
  loading = false,
  setShorts,
}: CommentsDrawerProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 🎯 Escuchar teclado
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;

    const newComment: CommentItem = {
      user: user!,
      comment: text,
    };

    // ⚡ 1. UI inmediata
    setShorts((prev) =>
      prev.map((s) =>
        s.id === shortId
          ? {
              ...s,
              comentarios: [...s.comentarios, newComment],
            }
          : s,
      ),
    );

    setText("");

    try {
      // 📡 2. backend
      await sendComment(shortId, text);
    } catch (e) {
      // 🔙 rollback si falla
      setShorts((prev) =>
        prev.map((s) =>
          s.id === shortId
            ? {
                ...s,
                comentarios: s.comentarios.slice(0, -1),
              }
            : s,
        ),
      );
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Drawer */}
        <View
          style={[
            styles.drawer,
            { marginBottom: keyboardHeight }, // 👈 se mueve con el teclado
          ]}
        >
          <Text style={styles.title}>Comentarios</Text>

          {/* Lista */}
          <View style={styles.list}>
            {comments.map((c, idx) => (
              <View key={idx} style={styles.commentItem}>
                <Text style={styles.user}>{c.user?.nickName ?? "Usuario"}</Text>
                <Text style={styles.commentText}>{c.comment}</Text>
              </View>
            ))}
          </View>

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Escribe un comentario..."
              placeholderTextColor="#888"
              style={styles.input}
              value={text}
              onChangeText={setText}
            />

            <Button mode="contained" onPress={handleSend} disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end", // 🔑 SIEMPRE abajo
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  drawer: {
    width: "100%",
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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

  commentItem: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  user: {
    fontWeight: "600",
    fontSize: 13,
    color: "#1DB954",
    marginBottom: 2,
  },

  commentText: {
    fontSize: 14,
    color: "#222",
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
    padding: 10,
    borderRadius: 10,
    color: "#222",
  },
});
