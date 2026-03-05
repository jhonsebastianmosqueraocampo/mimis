import { useFetch } from "@/hooks/FetchContext";
import React, { useState } from "react";
import { Button, Card, Text, TextInput } from "react-native-paper";
import PrivateLayout from "./privateLayout";

export default function LoadFunFact() {
  const { createFunFact } = useFetch();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;

    setLoading(true);
    const r = await createFunFact(text);
    setLoading(false);

    if (r.success) {
      setText("");
    }
  };

  return (
    <PrivateLayout>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge">Nuevo Dato Curioso</Text>

        <TextInput
          mode="outlined"
          label="Dato curioso"
          multiline
          numberOfLines={4}
          value={text}
          onChangeText={setText}
          style={{ marginTop: 12 }}
        />

        <Button
          mode="contained"
          style={{ marginTop: 16 }}
          onPress={handleSave}
          loading={loading}
        >
          Guardar
        </Button>
      </Card>
    </PrivateLayout>
  );
}
