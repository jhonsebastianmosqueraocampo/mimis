import { useAuth } from "@/hooks/AuthContext";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
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
        <View style={[styles.drawer, { marginBottom: keyboardHeight }]}>
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
              placeholderTextColor={colors.textSecondary}
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
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceVariant ?? colors.surface + "CC",
  },

  drawer: {
    width: "100%",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },

  title: {
    textAlign: "center",
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  list: {
    marginTop: spacing.md,
    maxHeight: 300,
  },

  commentItem: {
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  user: {
    ...typography.small,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: spacing.sm ?? 2,
  },

  commentText: {
    ...typography.small,
    color: colors.textPrimary,
  },

  inputRow: {
    flexDirection: "row",
    marginTop: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },

  input: {
    flex: 1,
    backgroundColor: colors.surfaceVariant ?? colors.surface,
    padding: spacing.sm,
    borderRadius: radius.sm,
    color: colors.textPrimary,
  },
});
