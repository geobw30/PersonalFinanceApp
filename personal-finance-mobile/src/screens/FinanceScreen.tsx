import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, FAB, Text } from "@rneui/themed";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format } from "date-fns";
import {
  deleteIncome,
  deleteInvestment,
  deleteSaving,
  getFinancialSummary,
  getIncomes,
  getInvestments,
  getSavings,
} from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type {
  FinancialSummary,
  Income,
  Investment,
  RootStackParamList,
  Saving,
} from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ["Income", "Savings", "Investments"] as const;
type Tab = (typeof TABS)[number];

const formatCurrency = (amount: number) =>
  `USh ${amount.toLocaleString("en-UG")}`;

export default function FinanceScreen() {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<Tab>("Income");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showOverlay = true) => {
    if (showOverlay) setLoading(true);
    try {
      const [invRes, savRes, incRes, sumRes] = await Promise.all([
        getInvestments(),
        getSavings(),
        getIncomes(),
        getFinancialSummary(),
      ]);
      setInvestments(invRes.data);
      setSavings(savRes.data);
      setIncomes(incRes.data);
      setSummary(sumRes.data);
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
    Alert.alert("Confirm Delete", `Delete this ${label}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onConfirm },
    ]);

  const fabAction = () => {
    if (activeTab === "Income") navigation.navigate("AddIncome");
    if (activeTab === "Savings") navigation.navigate("AddSaving");
    if (activeTab === "Investments") navigation.navigate("AddInvestment");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary cards */}
        {summary && (
          <>
            <View style={styles.summaryRow}>
              <Card containerStyle={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Net Worth</Text>
                <Text style={[styles.summaryValue, { color: "#1976d2" }]}>
                  {formatCurrency(summary.netWorth)}
                </Text>
              </Card>
              <Card containerStyle={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Monthly Income</Text>
                <Text style={[styles.summaryValue, { color: "#2e7d32" }]}>
                  {formatCurrency(summary.monthlyIncome)}
                </Text>
              </Card>
            </View>
            <View style={styles.summaryRow}>
              <Card containerStyle={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Investments</Text>
                <Text style={[styles.summaryValue, { color: "#7b1fa2" }]}>
                  {formatCurrency(summary.totalInvestments)}
                </Text>
              </Card>
              <Card containerStyle={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Savings</Text>
                <Text style={[styles.summaryValue, { color: "#e65100" }]}>
                  {formatCurrency(summary.totalSavings)}
                </Text>
              </Card>
            </View>
          </>
        )}

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Income list */}
        {activeTab === "Income" &&
          (incomes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>No income entries yet.</Text>
              <Text style={styles.emptyHint}>Tap the + button to add income</Text>
            </View>
          ) : (
            <>
              {incomes.map((income) => (
                <Card key={income.id} containerStyle={styles.itemCard}>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{income.source}</Text>
                      <Text style={styles.itemMeta}>
                        {income.type} ·{" "}
                        {format(new Date(income.date), "dd MMM yyyy")}
                      </Text>
                      {income.isRecurring && (
                        <Text style={styles.itemMeta}>
                          Recurring
                          {income.frequency ? ` · ${income.frequency}` : ""}
                        </Text>
                      )}
                      {income.notes ? (
                        <Text style={styles.itemMeta}>{income.notes}</Text>
                      ) : null}
                    </View>
                    <View style={styles.itemActions}>
                      <Text style={[styles.itemAmount, { color: "#2e7d32" }]}>
                        {formatCurrency(income.amount)}
                      </Text>
                      <View style={styles.buttonRow}>
                        <Button
                          title="Edit"
                          type="outline"
                          titleStyle={styles.actionButtonTitle}
                          buttonStyle={styles.actionButton}
                          containerStyle={styles.actionButtonContainer}
                          onPress={() =>
                            navigation.navigate("EditIncome", { income })
                          }
                        />
                        <Button
                          title="Delete"
                          type="outline"
                          titleStyle={[
                            styles.actionButtonTitle,
                            styles.deleteButtonTitle,
                          ]}
                          buttonStyle={[styles.actionButton, styles.deleteButton]}
                          containerStyle={styles.actionButtonContainer}
                          onPress={() =>
                            confirmDelete("income", async () => {
                              await deleteIncome(income.id);
                              void loadData(false);
                            })
                          }
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </>
          ))}

        {/* Savings list */}
        {activeTab === "Savings" &&
          (savings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>No savings entries yet.</Text>
              <Text style={styles.emptyHint}>Tap the + button to add savings</Text>
            </View>
          ) : (
            <>
              {savings.map((saving) => {
                const progress =
                  saving.targetAmount && saving.targetAmount > 0
                    ? Math.min(
                        (saving.currentAmount / saving.targetAmount) * 100,
                        100,
                      )
                    : null;
                return (
                  <Card key={saving.id} containerStyle={styles.itemCard}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{saving.name}</Text>
                        <Text style={styles.itemMeta}>
                          {saving.type} ·{" "}
                          {format(new Date(saving.date), "dd MMM yyyy")}
                        </Text>
                        {saving.interestRate != null ? (
                          <Text style={styles.itemMeta}>
                            Rate: {saving.interestRate}%
                          </Text>
                        ) : null}
                        {saving.notes ? (
                          <Text style={styles.itemMeta}>{saving.notes}</Text>
                        ) : null}
                      </View>
                      <View style={styles.itemActions}>
                        <Text style={[styles.itemAmount, { color: "#e65100" }]}>
                          {formatCurrency(saving.currentAmount)}
                        </Text>
                        {saving.targetAmount ? (
                          <Text style={styles.itemMeta}>
                            / {formatCurrency(saving.targetAmount)}
                          </Text>
                        ) : null}
                        <View style={styles.buttonRow}>
                          <Button
                            title="Edit"
                            type="outline"
                            titleStyle={styles.actionButtonTitle}
                            buttonStyle={styles.actionButton}
                            containerStyle={styles.actionButtonContainer}
                            onPress={() =>
                              navigation.navigate("EditSaving", { saving })
                            }
                          />
                          <Button
                            title="Delete"
                            type="outline"
                            titleStyle={[
                              styles.actionButtonTitle,
                              styles.deleteButtonTitle,
                            ]}
                            buttonStyle={[
                              styles.actionButton,
                              styles.deleteButton,
                            ]}
                            containerStyle={styles.actionButtonContainer}
                            onPress={() =>
                              confirmDelete("saving", async () => {
                                await deleteSaving(saving.id);
                                void loadData(false);
                              })
                            }
                          />
                        </View>
                      </View>
                    </View>
                    {progress !== null && (
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progress}%` as any },
                          ]}
                        />
                      </View>
                    )}
                  </Card>
                );
              })}
            </>
          ))}

        {/* Investments list */}
        {activeTab === "Investments" &&
          (investments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>No investment entries yet.</Text>
              <Text style={styles.emptyHint}>Tap the + button to add investments</Text>
            </View>
          ) : (
            <>
              {investments.map((inv) => {
                const gain = inv.currentValue - inv.amount;
                return (
                  <Card key={inv.id} containerStyle={styles.itemCard}>
                    <View style={styles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{inv.name}</Text>
                        <Text style={styles.itemMeta}>
                          {format(new Date(inv.date), "dd MMM yyyy")}
                        </Text>
                        <Text style={styles.itemMeta}>
                          Cost: {formatCurrency(inv.amount)}
                        </Text>
                        {inv.returnRate != null ? (
                          <Text style={styles.itemMeta}>
                            Return: {inv.returnRate}%
                          </Text>
                        ) : null}
                        {inv.notes ? (
                          <Text style={styles.itemMeta}>{inv.notes}</Text>
                        ) : null}
                      </View>
                      <View style={styles.itemActions}>
                        <Text style={[styles.itemAmount, { color: "#7b1fa2" }]}>
                          {formatCurrency(inv.currentValue)}
                        </Text>
                        <Text
                          style={[
                            styles.itemMeta,
                            { color: gain >= 0 ? "#2e7d32" : "#d32f2f" },
                          ]}
                        >
                          {gain >= 0 ? "+" : ""}
                          {formatCurrency(gain)}
                        </Text>
                        <View style={styles.buttonRow}>
                          <Button
                            title="Edit"
                            type="outline"
                            titleStyle={styles.actionButtonTitle}
                            buttonStyle={styles.actionButton}
                            containerStyle={styles.actionButtonContainer}
                            onPress={() =>
                              navigation.navigate("EditInvestment", {
                                investment: inv,
                              })
                            }
                          />
                          <Button
                            title="Delete"
                            type="outline"
                            titleStyle={[
                              styles.actionButtonTitle,
                              styles.deleteButtonTitle,
                            ]}
                            buttonStyle={[
                              styles.actionButton,
                              styles.deleteButton,
                            ]}
                            containerStyle={styles.actionButtonContainer}
                            onPress={() =>
                              confirmDelete("investment", async () => {
                                await deleteInvestment(inv.id);
                                void loadData(false);
                              })
                            }
                          />
                        </View>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </>
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
  summaryRow: { flexDirection: "row" },
  summaryCard: { flex: 1, borderRadius: 10, margin: 6 },
  summaryLabel: { color: "#666", textAlign: "center", fontSize: 12 },
  summaryValue: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#1976d2" },
  tabText: { color: "#666", fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: "#fff" },
  emptyContainer: { alignItems: "center", marginTop: 32 },
  empty: { textAlign: "center", color: "#999", fontSize: 14 },
  emptyHint: { textAlign: "center", color: "#888", fontSize: 12, marginTop: 6 },
  totalCard: { borderRadius: 10, marginHorizontal: 10, backgroundColor: "#f8f9fa" },
  totalLabel: { textAlign: "center", color: "#666", fontSize: 12 },
  totalValue: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  itemCard: { borderRadius: 10, marginHorizontal: 10, marginVertical: 4 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  itemTitle: { fontSize: 15, fontWeight: "600" },
  itemMeta: { marginTop: 2, fontSize: 12, color: "#777" },
  itemAmount: { fontWeight: "700", textAlign: "right", fontSize: 14 },
  itemActions: { alignItems: "flex-end", gap: 4 },
  buttonRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  actionButtonContainer: { minWidth: 70 },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderColor: "#1976d2",
  },
  actionButtonTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1976d2",
  },
  deleteButton: { borderColor: "#d32f2f" },
  deleteButtonTitle: { color: "#d32f2f" },
  progressTrack: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: "#e65100", borderRadius: 3 },
});