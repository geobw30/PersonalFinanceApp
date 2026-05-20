import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createInvestmentType } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AddInvestmentTypeScreen() {
  const navigation = useNavigation<Nav>();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const onSave = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      await createInvestmentType({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Name" value={name} onChangeText={setName} />
        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Save" onPress={onSave} disabled={saving} />
      </ScrollView>
      <LoadingOverlay visible={saving} message="Saving…" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  error: { color: "#d32f2f", marginBottom: 12 },
});
