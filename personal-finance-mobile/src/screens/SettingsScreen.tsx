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
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  deleteCategory,
  deleteInvestmentType,
  deleteSubCategory,
  getCategories,
  getInvestmentTypes,
  getSubCategories,
} from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type {
  Category,
  InvestmentType,
  RootStackParamList,
  SubCategory,
} from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ["Categories", "Inv. Types", "Sub Categories"] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, keyof typeof MaterialIcons.glyphMap> = {
  Categories: "category",
  "Inv. Types": "list",
  "Sub Categories": "account-tree",
};

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<Tab>("Categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showOverlay = true) => {
    if (showOverlay) setLoading(true);
    try {
      const [catRes, invTypeRes, subCatRes] = await Promise.all([
        getCategories(),
        getInvestmentTypes(),
        getSubCategories(),
      ]);
      setCategories(catRes.data);
      setInvestmentTypes(invTypeRes.data);
      setSubCategories(subCatRes.data);
    } finally {
      if (showOverlay) setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData(false);
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const confirmDelete = (label: string, onConfirm: () => void) =>
    Alert.alert("Delete", `Delete this ${label}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onConfirm },
    ]);

  const fabAction = () => {
    if (activeTab === "Categories") navigation.navigate("AddCategory");
    if (activeTab === "Inv. Types") navigation.navigate("AddInvestmentType");
    if (activeTab === "Sub Categories") {
      navigation.navigate("AddSubCategory", {});
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <View style={styles.tabContent}>
              <MaterialIcons
                name={TAB_ICONS[tab]}
                size={16}
                color={activeTab === tab ? "#1976d2" : "#999"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === "Categories" &&
          (categories.length === 0 ? (
            <Text style={styles.empty}>No categories yet.</Text>
          ) : (
            categories.map((cat) => (
              <Card key={cat.id} containerStyle={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{cat.name}</Text>
                    {cat.description ? (
                      <Text style={styles.description}>{cat.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.btnSmall}
                      onPress={() =>
                        navigation.navigate("SubCategories", {
                          categoryId: cat.id,
                          categoryName: cat.name,
                        })
                      }
                    >
                      <Text style={styles.btnSmallText}>Subs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btn}
                      onPress={() =>
                        navigation.navigate("EditCategory", { category: cat })
                      }
                    >
                      <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnDelete}
                      onPress={() =>
                        confirmDelete("category", async () => {
                          await deleteCategory(cat.id);
                          void loadData(false);
                        })
                      }
                    >
                      <Text style={styles.btnTextDelete}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          ))}

        {activeTab === "Inv. Types" &&
          (investmentTypes.length === 0 ? (
            <Text style={styles.empty}>No investment types yet.</Text>
          ) : (
            investmentTypes.map((type) => (
              <Card key={type.id} containerStyle={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{type.name}</Text>
                    {type.description ? (
                      <Text style={styles.description}>{type.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.btn}
                      onPress={() =>
                        navigation.navigate("EditInvestmentType", {
                          investmentType: type,
                        })
                      }
                    >
                      <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnDelete}
                      onPress={() =>
                        confirmDelete("investment type", async () => {
                          await deleteInvestmentType(type.id);
                          void loadData(false);
                        })
                      }
                    >
                      <Text style={styles.btnTextDelete}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          ))}

        {activeTab === "Sub Categories" &&
          (subCategories.length === 0 ? (
            <Text style={styles.empty}>No sub categories yet.</Text>
          ) : (
            subCategories.map((sub) => (
              <Card key={sub.id} containerStyle={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{sub.name}</Text>
                    <Text style={styles.description}>
                      {sub.categoryName ?? `Category ${sub.categoryId}`}
                    </Text>
                    {sub.description ? (
                      <Text style={styles.description}>{sub.description}</Text>
                    ) : null}
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.btn}
                      onPress={() =>
                        navigation.navigate("EditSubCategory", {
                          subCategory: sub,
                        })
                      }
                    >
                      <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnDelete}
                      onPress={() =>
                        confirmDelete("sub category", async () => {
                          await deleteSubCategory(sub.id);
                          void loadData(false);
                        })
                      }
                    >
                      <Text style={styles.btnTextDelete}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      <FAB
        icon={{ name: "add", color: "#fff" }}
        color="#1976d2"
        placement="right"
        onPress={fabAction}
      />
      <LoadingOverlay visible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#1976d2" },
  tabContent: { flexDirection: "row", alignItems: "center", gap: 4 },
  tabText: { color: "#999", fontWeight: "600", fontSize: 12 },
  tabTextActive: { color: "#1976d2" },
  empty: { textAlign: "center", color: "#999", marginTop: 32, fontSize: 14 },
  card: { borderRadius: 10, marginHorizontal: 10, marginVertical: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 15, fontWeight: "700" },
  description: { color: "#666", marginTop: 4, fontSize: 12 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#1976d2",
    borderRadius: 4,
  },
  btnSmall: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#6a1b9a",
    borderRadius: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  btnSmallText: {
    color: "#fff",
    fontSize: 10,
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
});
