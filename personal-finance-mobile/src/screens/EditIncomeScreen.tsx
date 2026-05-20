import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import { updateIncome } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EditIncome">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const INCOME_TYPES = [
  "Salary",
  "Freelance",
  "Investment Returns",
  "Business",
  "Rental",
  "Other",
];
const FREQUENCIES = ["Monthly", "Weekly", "Bi-Weekly", "Annually", "One-Time"];

export default function EditIncomeScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props["route"]>();
  const { income } = route.params;

  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState(income.source);
  const [type, setType] = useState(income.type);
  const [amount, setAmount] = useState(String(income.amount));
  const [date, setDate] = useState(income.date.split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(income.isRecurring);
  const [frequency, setFrequency] = useState(
    income.frequency ?? FREQUENCIES[0],
  );
  const [notes, setNotes] = useState(income.notes ?? "");
  const [error, setError] = useState("");

  const onSave = async () => {
    if (!source.trim() || !amount) {
      setError("Source and amount are required.");
      return;
    }
    setSaving(true);
    try {
      await updateIncome(income.id, {
        source: source.trim(),
        type,
        amount: parseFloat(amount),
        date,
        isRecurring,
        frequency: isRecurring ? frequency : undefined,
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
        <Input label="Source" value={source} onChangeText={setSource} />
        <Text style={styles.label}>Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={type}
            onValueChange={(v) => setType(String(v))}
          >
            {INCOME_TYPES.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>
        <Input
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Recurring</Text>
          <Switch value={isRecurring} onValueChange={setIsRecurring} />
        </View>
        {isRecurring && (
          <>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={frequency}
                onValueChange={(v) => setFrequency(String(v))}
              >
                {FREQUENCIES.map((f) => (
                  <Picker.Item key={f} label={f} value={f} />
                ))}
              </Picker>
            </View>
          </>
        )}
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 16,
  },
  switchLabel: { fontSize: 14, color: "#333" },
  error: { color: "#d32f2f", marginBottom: 12 },
});
