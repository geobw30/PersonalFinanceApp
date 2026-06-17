import React, { useEffect, useState } from "react";
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
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getInvestmentTypes, updateInvestment } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { InvestmentType, RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EditInvestmentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { investment } = route.params;

  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(investment.name);
  const [investmentTypeId, setInvestmentTypeId] = useState(
    String(investment.investmentTypeId),
  );
  const [amount, setAmount] = useState(String(investment.amount));
  const [currentValue, setCurrentValue] = useState(
    String(investment.currentValue),
  );
  const [date, setDate] = useState(new Date(investment.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [returnRate, setReturnRate] = useState(
    investment.returnRate != null ? String(investment.returnRate) : "",
  );
  const [notes, setNotes] = useState(investment.notes ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    void getInvestmentTypes()
      .then((res) => setInvestmentTypes(res.data))
      .finally(() => setLoading(false));
  }, []);

  const hasUnsavedChanges =
    name !== investment.name ||
    investmentTypeId !== String(investment.investmentTypeId) ||
    amount !== String(investment.amount) ||
    currentValue !== String(investment.currentValue) ||
    date.toDateString() !== new Date(investment.date).toDateString() ||
    returnRate !== (investment.returnRate != null ? String(investment.returnRate) : "") ||
    notes !== (investment.notes ?? "");

  const saveAndGoBack = async () => {
    if (!name.trim() || !investmentTypeId || !amount || !currentValue) {
      setError("Name, investment type, amount and current value are required.");
      return false;
    }
    const numericAmount = parseFloat(amount);
    const numericCurrentValue = parseFloat(currentValue);
    if (isNaN(numericAmount) || numericAmount < 0) {
      setError("Enter a valid non-negative amount.");
      return false;
    }
    if (isNaN(numericCurrentValue) || numericCurrentValue < 0) {
      setError("Enter a valid non-negative current value.");
      return false;
    }
    setSaving(true);
    setError("");
    try {
      await updateInvestment(investment.id, {
        name: name.trim(),
        investmentTypeId: Number(investmentTypeId),
        amount: numericAmount,
        currentValue: numericCurrentValue,
        date: date.toISOString(),
        returnRate: returnRate ? parseFloat(returnRate) : undefined,
        notes: notes.trim() || undefined,
      });
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update investment.";
      setError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const onSave = async () => {
    const success = await saveAndGoBack();
    if (success) navigation.goBack();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. What would you like to do?",
        [
          { text: "Stay", style: "cancel" as const },
          {
            text: "Discard",
            style: "destructive" as const,
            onPress: () => navigation.dispatch(e.data.action),
          },
          {
            text: "Save",
            style: "default" as const,
            onPress: () => {
              saveAndGoBack().then((success) => {
                if (success) navigation.dispatch(e.data.action);
              });
            },
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Name" value={name} onChangeText={setName} />
        <Text style={styles.label}>Investment Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={investmentTypeId}
            onValueChange={(v: string | number) => setInvestmentTypeId(String(v))}
          >
            {investmentTypes.map((t) => (
              <Picker.Item key={t.id} label={t.name} value={String(t.id)} />
            ))}
          </Picker>
        </View>
        <Input
          label="Amount (UGX)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Input
          label="Current Value (UGX)"
          value={currentValue}
          onChangeText={setCurrentValue}
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
            onChange={(_, nextDate?: Date) => {
              setShowDatePicker(false);
              if (nextDate) setDate(nextDate);
            }}
          />
        )}
        <Input
          label="Return Rate % (optional)"
          value={returnRate}
          onChangeText={setReturnRate}
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
          <Button
            title="Update Investment"
            onPress={onSave}
            disabled={saving || loading || !hasUnsavedChanges}
          />
        </View>
      </ScrollView>
      <LoadingOverlay visible={loading} />
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