import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { updateInvestmentType } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EditInvestmentType">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EditInvestmentTypeScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props["route"]>();
  const { investmentType } = route.params;

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(investmentType.name);
  const [description, setDescription] = useState(
    investmentType.description ?? "",
  );
  const [error, setError] = useState("");

  const onSave = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      await updateInvestmentType(investmentType.id, {
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
        <Button title="Update" onPress={onSave} disabled={saving} />
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
