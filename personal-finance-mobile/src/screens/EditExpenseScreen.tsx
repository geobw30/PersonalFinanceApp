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
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Button, Input, Text } from "@rneui/themed";
import { format } from "date-fns";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getCategories,
  getSubCategoriesByCategory,
  updateExpense,
} from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { Category, RootStackParamList, SubCategory } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EditExpenseScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { expense } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categoryId, setCategoryId] = useState(String(expense.categoryId));
  const [subCategoryId, setSubCategoryId] = useState(
    expense.subCategoryId ? String(expense.subCategoryId) : "",
  );
  const [description, setDescription] = useState(expense.description || "");
  const [amount, setAmount] = useState(String(expense.amount ?? ""));
  const [notes, setNotes] = useState(expense.notes || "");
  const [date, setDate] = useState(new Date(expense.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    void getCategories()
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setSubCategories([]);
      setSubCategoryId("");
      return;
    }
    void getSubCategoriesByCategory(Number(categoryId)).then((res) =>
      setSubCategories(res.data),
    );
  }, [categoryId]);

  const canSave = useMemo(
    () => categoryId && description.trim() && Number(amount) > 0,
    [categoryId, description, amount],
  );

  const hasUnsavedChanges =
    categoryId !== String(expense.categoryId) ||
    subCategoryId !== String(expense.subCategoryId ?? "") ||
    description !== (expense.description || "") ||
    amount !== String(expense.amount ?? "") ||
    date.toDateString() !== new Date(expense.date).toDateString() ||
    notes !== (expense.notes || "");

  const saveAndGoBack = async () => {
    if (!canSave) {
      setError("Fill all required fields with valid values.");
      return false;
    }
    setSaving(true);
    setError("");
    try {
      await updateExpense(expense.id, {
        categoryId: Number(categoryId),
        subCategoryId: subCategoryId ? Number(subCategoryId) : undefined,
        amount: Number(amount),
        date: date.toISOString(),
        description: description.trim(),
        notes: notes.trim() || undefined,
      });
      return true;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update expense.";
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
  }, [navigation, hasUnsavedChanges, onSave]);

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
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, [navigation, hasUnsavedChanges]);

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

        <Text style={styles.label}>Sub Category (optional)</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={subCategoryId}
            onValueChange={(value) => setSubCategoryId(String(value))}
          >
            <Picker.Item label="Select sub category" value="" />
            {subCategories.map((subCategory) => (
              <Picker.Item
                key={subCategory.id}
                label={subCategory.name}
                value={String(subCategory.id)}
              />
            ))}
          </Picker>
        </View>

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
        />
        <Input
          label="Amount (UGX)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
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

        <Input label="Notes" value={notes} onChangeText={setNotes} multiline />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.buttonRow}>
          <Button
            title="Update Expense"
            onPress={onSave}
            disabled={saving || !hasUnsavedChanges}
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
  content: { padding: 16, gap: 10 },
  label: { color: "#777", fontSize: 14, marginBottom: 6 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  error: { color: "#d32f2f" },
  buttonRow: { marginTop: 12 },
});
