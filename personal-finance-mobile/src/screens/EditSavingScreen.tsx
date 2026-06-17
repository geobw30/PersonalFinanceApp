import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
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
  const [date, setDate] = useState(new Date(savingItem.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [interestRate, setInterestRate] = useState(
    savingItem.interestRate != null ? String(savingItem.interestRate) : "",
  );
  const [notes, setNotes] = useState(savingItem.notes ?? "");
  const [error, setError] = useState("");

  const hasUnsavedChanges =
    name !== savingItem.name ||
    type !== savingItem.type ||
    currentAmount !== String(savingItem.currentAmount) ||
    targetAmount !== (savingItem.targetAmount != null ? String(savingItem.targetAmount) : "") ||
    date.toDateString() !== new Date(savingItem.date).toDateString() ||
    interestRate !== (savingItem.interestRate != null ? String(savingItem.interestRate) : "") ||
    notes !== (savingItem.notes ?? "");

  const saveAndGoBack = async () => {
    if (!name.trim() || !currentAmount) {
      setError("Name and current amount are required.");
      return false;
    }
    const numericCurrent = parseFloat(currentAmount);
    if (isNaN(numericCurrent) || numericCurrent < 0) {
      setError("Enter a valid non-negative current amount.");
      return false;
    }
    setSaving(true);
    setError("");
    try {
      await updateSaving(savingItem.id, {
        name: name.trim(),
        type,
        currentAmount: numericCurrent,
        targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
        date: date.toISOString(),
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        notes: notes.trim() || undefined,
      });
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update saving.";
      setError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      if (!hasUnsavedChanges) return false;

      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. What would you like to do?",
        [
          { text: "Stay", style: "cancel" as const },
          {
            text: "Discard",
            style: "destructive" as const,
            onPress: () => navigation.goBack(),
          },
          {
            text: "Save",
            style: "default" as const,
            onPress: () => {
              saveAndGoBack().then((success) => {
                if (success) navigation.goBack();
              });
            },
          },
        ],
      );
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [navigation, hasUnsavedChanges]);

  const onSave = async () => {
    const success = await saveAndGoBack();
    if (success) navigation.goBack();
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
          label="Current Amount (UGX)"
          value={currentAmount}
          onChangeText={setCurrentAmount}
          keyboardType="numeric"
        />
        <Input
          label="Target Amount (UGX, optional)"
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{format(date, "dd MMM yyyy")}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(_, nextDate) => {
              setShowDatePicker(false);
              if (nextDate) setDate(nextDate);
            }}
          />
        )}
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
        <View style={styles.buttonRow}>
          <Button title="Update" onPress={onSave} disabled={saving || !hasUnsavedChanges} />
        </View>
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
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 10,
  },
  error: { color: "#d32f2f", marginBottom: 12 },
  buttonRow: { marginTop: 12 },
});