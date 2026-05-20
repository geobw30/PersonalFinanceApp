import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Card, FAB, Icon, Text } from "@rneui/themed";
import LoadingOverlay from "../components/LoadingOverlay";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { deleteCategory, getCategories } from "../api/client";
import type { Category, RootStackParamList } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CategoriesScreen() {
  const navigation = useNavigation<Nav>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (showOverlay = true) => {
    if (showOverlay) setLoading(true);
    try {
      const { data } = await getCategories();
      setCategories(data);
    } finally {
      if (showOverlay) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData(false);
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const onDelete = (category: Category) => {
    Alert.alert("Delete Category", `Delete ${category.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCategory(category.id);
          await loadData();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {categories.map((category) => (
          <Card key={category.id} containerStyle={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{category.name}</Text>
                {category.description ? (
                  <Text style={styles.description}>{category.description}</Text>
                ) : null}
              </View>
              <View style={styles.actions}>
                <Icon
                  name="segment"
                  type="material"
                  color="#6a1b9a"
                  onPress={() =>
                    navigation.navigate("SubCategories", {
                      categoryId: category.id,
                      categoryName: category.name,
                    })
                  }
                />
                <Icon
                  name="edit"
                  type="material"
                  color="#1976d2"
                  onPress={() =>
                    navigation.navigate("EditCategory", { category })
                  }
                />
                <Icon
                  name="delete"
                  type="material"
                  color="#d32f2f"
                  onPress={() => onDelete(category)}
                />
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
      <FAB
        icon={{ name: "add", color: "#fff" }}
        color="#1976d2"
        placement="right"
        onPress={() => navigation.navigate("AddCategory")}
      />
      <LoadingOverlay visible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  card: { borderRadius: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700" },
  description: { color: "#666", marginTop: 4 },
  actions: {
    minHeight: 90,
    justifyContent: "space-between",
    alignItems: "center",
  },
});
