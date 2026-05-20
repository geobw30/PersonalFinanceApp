import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, FAB, Icon, Text } from "@rneui/themed";
import LoadingOverlay from "../components/LoadingOverlay";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { deleteSubCategory, getSubCategoriesByCategory } from "../api/client";
import type { RootStackParamList, SubCategory } from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SubCategoriesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const categoryId: number = route.params?.categoryId;
  const categoryName: string = route.params?.categoryName || "Category";
  const [items, setItems] = useState<SubCategory[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(
    async (showOverlay = true) => {
      if (!categoryId) {
        setError("Invalid category ID");
        return;
      }
      if (showOverlay) setLoading(true);
      try {
        setError("");
        const { data } = await getSubCategoriesByCategory(categoryId);
        setItems(data || []);
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load sub categories.";
        setError(errorMsg);
        setItems([]);
      } finally {
        if (showOverlay) setLoading(false);
      }
    },
    [categoryId],
  );

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

  const onDelete = (item: SubCategory) => {
    Alert.alert("Delete Sub Category", `Delete ${item.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSubCategory(item.id);
          await loadData();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{categoryName}</Text>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!error && items.length === 0 ? (
          <Text style={styles.empty}>No sub categories found.</Text>
        ) : null}
        {items.map((item) => (
          <Card key={item.id} containerStyle={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.description}>{item.description}</Text>
                ) : null}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() =>
                    navigation.navigate("EditSubCategory", {
                      subCategory: item,
                    })
                  }
                >
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnDelete}
                  onPress={() => onDelete(item)}
                >
                  <Text style={styles.btnTextDelete}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
      {categoryId ? (
        <FAB
          icon={{ name: "add", color: "#fff" }}
          color="#1976d2"
          placement="right"
          onPress={() =>
            navigation.navigate("AddSubCategory", { categoryId, categoryName })
          }
        />
      ) : null}
      <LoadingOverlay visible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  heading: {
    paddingHorizontal: 16,
    paddingTop: 12,
    fontWeight: "700",
    color: "#555",
  },
  card: { borderRadius: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700" },
  description: { color: "#777", marginTop: 4 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#1976d2",
    borderRadius: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  btnDelete: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#d32f2f",
    borderRadius: 4,
  },
  btnTextDelete: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  error: { textAlign: "center", color: "#d32f2f", marginTop: 18 },
  empty: { textAlign: "center", color: "#999", marginTop: 32 },
});
