import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Button, Input, Text } from "@rneui/themed";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createBudget, getCategories } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { Category, RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const getUtcMonthRange = (value: Date) => {
  const year = value.getFullYear();
  const month = value.getMonth();
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0));
  return { startDate, endDate };
};

export default function AddBudgetScreen() {
  const navigation = useNavigation<Nav>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    void getCategories()
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  }, []);

  const budgetName = useMemo(() => {
    const selected = categories.find((c) => c.id === Number(categoryId));
    return selected
      ? `${selected.name} - ${format(month, "MMM yyyy")}`
      : `Budget - ${format(month, "MMM yyyy")}`;
  }, [categories, categoryId, month]);

  const handleSave = async () => {
    const value = Number(amount);
    if (!categoryId || Number.isNaN(value) || value <= 0) {
      setError("Select a category and enter a valid amount.");
      return;
    }

    setSaving(true);
    try {
      const { startDate, endDate } = getUtcMonthRange(month);
      await createBudget({
        name: budgetName,
        categoryId: Number(categoryId),
        amount: value,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
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
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={categoryId}
            onValueChange={(value) => setCategoryId(String(value))}
          >
            <Picker.Item label="Select category" value="" />
            {categories.map((category) => (
              <Picker.Item
                key={category.id}
                label={category.name}
                value={String(category.id)}
              />
            ))}
          </Picker>
        </View>

        <Input
          label="Amount (UGX)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Month</Text>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => setShowMonthPicker(true)}
        >
          <Text>{format(month, "MMMM yyyy")}</Text>
        </TouchableOpacity>
        {showMonthPicker ? (
          <DateTimePicker
            value={month}
            mode="date"
            onChange={(_, date) => {
              setShowMonthPicker(false);
              if (date) setMonth(date);
            }}
          />
        ) : null}

        <Input label="Budget Name" value={budgetName} disabled />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Save Budget" onPress={handleSave} disabled={saving} />
      </ScrollView>
      <LoadingOverlay visible={loading} />
      <LoadingOverlay visible={saving} message="Saving…" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, gap: 10 },
  label: { color: "#777", fontSize: 14, marginBottom: 6 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  monthButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  error: { color: "#d32f2f" },
});
