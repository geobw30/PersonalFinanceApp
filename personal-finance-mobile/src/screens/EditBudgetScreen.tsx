import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Button, Input, Text } from '@rneui/themed';
import { format, endOfMonth, startOfMonth } from 'date-fns';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getCategories, updateBudget } from '../api/client';
import type { Category, RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EditBudgetScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { budget } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(String(budget.categoryId));
  const [amount, setAmount] = useState(String(budget.amount));
  const [month, setMonth] = useState(new Date(budget.startDate));
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void getCategories().then((res) => setCategories(res.data));
  }, []);

  const budgetName = useMemo(() => {
    const selected = categories.find((c) => c.id === Number(categoryId));
    return selected ? `${selected.name} - ${format(month, 'MMM yyyy')}` : budget.name;
  }, [categories, categoryId, month, budget.name]);

  const handleSave = async () => {
    const value = Number(amount);
    if (!categoryId || Number.isNaN(value) || value <= 0) {
      setError('Select a category and enter a valid amount.');
      return;
    }

    await updateBudget(budget.id, {
      name: budgetName,
      categoryId: Number(categoryId),
      amount: value,
      startDate: startOfMonth(month).toISOString(),
      endDate: endOfMonth(month).toISOString(),
    });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={categoryId} onValueChange={(value) => setCategoryId(String(value))}>
            <Picker.Item label='Select category' value='' />
            {categories.map((category) => (
              <Picker.Item key={category.id} label={category.name} value={String(category.id)} />
            ))}
          </Picker>
        </View>

        <Input label='Amount (UGX)' keyboardType='numeric' value={amount} onChangeText={setAmount} />

        <Text style={styles.label}>Month</Text>
        <TouchableOpacity style={styles.monthButton} onPress={() => setShowMonthPicker(true)}>
          <Text>{format(month, 'MMMM yyyy')}</Text>
        </TouchableOpacity>
        {showMonthPicker ? (
          <DateTimePicker
            value={month}
            mode='date'
            onChange={(_, date) => {
              setShowMonthPicker(false);
              if (date) setMonth(date);
            }}
          />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title='Update Budget' onPress={handleSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 10 },
  label: { color: '#777', fontSize: 14, marginBottom: 6 },
  pickerWrap: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8 },
  monthButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
  error: { color: '#d32f2f' },
});
