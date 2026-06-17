import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { createInvestment, getInvestmentTypes } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { InvestmentType, RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AddInvestmentScreen() {
  const navigation = useNavigation<Nav>();
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [investmentTypeId, setInvestmentTypeId] = useState("");
  const [amount, setAmount] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [returnRate, setReturnRate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void getInvestmentTypes()
      .then((res) => {
        setInvestmentTypes(res.data);
        if (res.data.length > 0) setInvestmentTypeId(String(res.data[0].id));
      })
      .finally(() => setLoading(false));
  }, []);

  const onSave = async () => {
    if (!name.trim() || !investmentTypeId || !amount || !currentValue) {
      setError("Name, investment type, amount and current value are required.");
      return;
    }
    const numericAmount = parseFloat(amount);
    const numericCurrentValue = parseFloat(currentValue);
    if (isNaN(numericAmount) || numericAmount < 0) {
      setError("Enter a valid non-negative amount.");
      return;
    }
    if (isNaN(numericCurrentValue) || numericCurrentValue < 0) {
      setError("Enter a valid non-negative current value.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createInvestment({
        name: name.trim(),
        investmentTypeId: Number(investmentTypeId),
        amount: numericAmount,
        currentValue: numericCurrentValue,
        date: date.toISOString(),
        returnRate: returnRate ? parseFloat(returnRate) : undefined,
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create investment.";
      setError(msg);
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
        <Text style={styles.label}>Investment Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={investmentTypeId}
            onValueChange={(v) => setInvestmentTypeId(String(v))}
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
            onChange={(_, nextDate) => {
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
            title="Save Investment"
            onPress={onSave}
            disabled={saving || loading}
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