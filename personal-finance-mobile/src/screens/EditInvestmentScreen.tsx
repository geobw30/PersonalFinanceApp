import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Input, Text } from "@rneui/themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { Picker } from "@react-native-picker/picker";
import { getInvestmentTypes, updateInvestment } from "../api/client";
import LoadingOverlay from "../components/LoadingOverlay";
import type { InvestmentType, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "EditInvestment">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EditInvestmentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props["route"]>();
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
  const [date, setDate] = useState(investment.date.split("T")[0]);
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

  const onSave = async () => {
    if (!name.trim() || !investmentTypeId || !amount || !currentValue) {
      setError("Name, investment type, amount and current value are required.");
      return;
    }
    setSaving(true);
    try {
      await updateInvestment(investment.id, {
        name: name.trim(),
        investmentTypeId: Number(investmentTypeId),
        amount: parseFloat(amount),
        currentValue: parseFloat(currentValue),
        date,
        returnRate: returnRate ? parseFloat(returnRate) : undefined,
        notes: notes.trim() || undefined,
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
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Input
          label="Current Value"
          value={currentValue}
          onChangeText={setCurrentValue}
          keyboardType="numeric"
        />
        <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
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
        <Button
          title="Update Investment"
          onPress={onSave}
          disabled={saving || loading}
        />
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
  error: { color: "#d32f2f", marginBottom: 12 },
});
