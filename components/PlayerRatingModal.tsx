// components/PlayerRatingModal.tsx
import { PlayerRating } from "@/types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
    Avatar,
    Button,
    Dialog,
    Portal,
    Text,
    TextInput,
} from "react-native-paper";


export type RatingModalPlayer = {
  playerId: number;
  name: string;
  photo: string;
  teamId: number;
};

type PlayerRatingModalProps = {
  visible: boolean;
  onClose: () => void;

  player: RatingModalPlayer;

  existingRating?: PlayerRating;
  onSave: (rating: PlayerRating) => void;
};

export default function PlayerRatingModal({
  visible,
  onClose,
  player,
  existingRating,
  onSave,
}: PlayerRatingModalProps) {
  const [rating, setRating] = useState(
    existingRating?.rating?.toString() || ""
  );
  const [title, setTitle] = useState(existingRating?.title || "");
  const [description, setDescription] = useState(
    existingRating?.description || ""
  );

  // resetear cuando cambia el jugador
  useEffect(() => {
    setRating(existingRating?.rating?.toString() || "");
    setTitle(existingRating?.title || "");
    setDescription(existingRating?.description || "");
  }, [player]);

  const handleSave = () => {
    if (!rating) return;

    const finalRating: PlayerRating = {
      playerId: player.playerId,
      teamId: player.teamId,
      rating: parseFloat(rating),
      title,
      description,
    };

    onSave(finalRating);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title>Calificar jugador</Dialog.Title>

        <Dialog.Content>
          <View style={styles.playerRow}>
            <Avatar.Image source={{ uri: player.photo }} size={50} />
            <View style={{ marginLeft: 12 }}>
              <Text variant="titleMedium">{player.name}</Text>
              <Text variant="bodySmall">Equipo ID: {player.teamId}</Text>
            </View>
          </View>

          <TextInput
            label="Calificación (0-10)"
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Título"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={onClose}>Cancelar</Button>
          <Button onPress={handleSave} mode="contained">
            Guardar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 14,
  },
  input: {
    marginTop: 8,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
});