import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { updateSubCategory } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EditSubCategoryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { subCategory } = route.params;
  const [name, setName] = useState(subCategory.name);
  const [description, setDescription] = useState(subCategory.description || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const hasUnsavedChanges =
    name !== subCategory.name || description !== (subCategory.description || "");

  const saveAndGoBack = async () => {
    if (!name.trim()) {
      setError("Sub category name is required.");
      return false;
    }
    setSaving(true);
    setError("");
    try {
      await updateSubCategory(subCategory.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update sub category.";
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
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.buttonRow}>
          <Button
            title="Update Sub Category"
            onPress={onSave}
            disabled={saving || !hasUnsavedChanges}
          />
        </View>
      </ScrollView>
      <LoadingOverlay visible={saving} message="Saving…" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  error: { color: "#d32f2f", marginBottom: 12 },
  buttonRow: { marginTop: 12 },
});