import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import { updateSaving } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EditSaving">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const SAVING_TYPES = [
  "Emergency Fund",
  "Retirement",
  "Goal-Based",
  "General",
  "Other",
];

export default function EditSavingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props["route"]>();
  const { saving: savingItem } = route.params;

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(savingItem.name);
  const [type, setType] = useState(savingItem.type);
  const [currentAmount, setCurrentAmount] = useState(
    String(savingItem.currentAmount),
  );
  const [targetAmount, setTargetAmount] = useState(
    savingItem.targetAmount != null ? String(savingItem.targetAmount) : "",
  );
  const [date, setDate] = useState(savingItem.date.split("T")[0]);
  const [interestRate, setInterestRate] = useState(
    savingItem.interestRate != null ? String(savingItem.interestRate) : "",
  );
  const [notes, setNotes] = useState(savingItem.notes ?? "");
  const [error, setError] = useState("");

  const onSave = async () => {
    if (!name.trim() || !currentAmount) {
      setError("Name and current amount are required.");
      return;
    }
    setSaving(true);
    try {
      await updateSaving(savingItem.id, {
        name: name.trim(),
        type,
        currentAmount: parseFloat(currentAmount),
        targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
        date,
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        notes: notes.trim() || undefined,
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
        <Text style={styles.label}>Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={type}
            onValueChange={(v) => setType(String(v))}
          >
            {SAVING_TYPES.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>
        <Input
          label="Current Amount"
          value={currentAmount}
          onChangeText={setCurrentAmount}
          keyboardType="numeric"
        />
        <Input
          label="Target Amount (optional)"
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="numeric"
        />
        <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <Input
          label="Interest Rate % (optional)"
          value={interestRate}
          onChangeText={setInterestRate}
          keyboardType="numeric"
        />
        <Input
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
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
  label: {
    color: "#86939e",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 10,
    marginBottom: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 12,
  },
  error: { color: "#d32f2f", marginBottom: 12 },
});
