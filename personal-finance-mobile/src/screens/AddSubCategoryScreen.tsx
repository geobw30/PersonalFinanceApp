import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createSubCategory, getCategories } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { Category, RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AddSubCategoryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const routeCategoryId: number = route.params?.categoryId ?? 0;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    routeCategoryId > 0 ? String(routeCategoryId) : "",
  );
  const [loadingCategories, setLoadingCategories] = useState(
    routeCategoryId === 0,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (routeCategoryId === 0) {
      void getCategories()
        .then((res) => {
          setCategories(res.data);
          if (res.data.length > 0)
            setSelectedCategoryId(String(res.data[0].id));
        })
        .finally(() => setLoadingCategories(false));
    }
  }, [routeCategoryId]);

  const onSave = async () => {
    const finalCategoryId =
      routeCategoryId > 0 ? routeCategoryId : Number(selectedCategoryId);
    if (!name.trim() || !finalCategoryId) {
      setError("Category and sub category name are required.");
      return;
    }
    setSaving(true);
    try {
      await createSubCategory({
        categoryId: finalCategoryId,
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
        {routeCategoryId === 0 && (
          <>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedCategoryId}
                onValueChange={(v) => setSelectedCategoryId(String(v))}
              >
                {categories.map((cat) => (
                  <Picker.Item
                    key={cat.id}
                    label={cat.name}
                    value={String(cat.id)}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}
        <Input label="Name" value={name} onChangeText={setName} />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title="Save Sub Category"
          onPress={onSave}
          disabled={saving || loadingCategories}
        />
      </ScrollView>
      <LoadingOverlay visible={loadingCategories} />
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
