import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, Text } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { format, startOfMonth, endOfMonth, lastDayOfMonth } from 'date-fns';
import { RootStackParamList } from '../types';
import { createBudget, getCategories } from '../api/client';
import type { Category } from '../types';

type AddBudgetScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddBudget'>;

export default function AddBudgetScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string>('');
  const navigation = useNavigation<AddBudgetScreenNavigationProp>();

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate name when category or month changes
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const cat = categories.find(c => c.id.toString() === selectedCategory);
      if (cat) {
        setName(`${cat.name} - ${format(selectedMonth, 'MMM yyyy')}`);
      }
    }
  }, [selectedCategory, selectedMonth, categories]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch {
      setError('Failed to load categories');
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !amount) {
      setError('Please fill in all required fields');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    try {
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);
      await createBudget({
        name: name || `Budget - ${format(selectedMonth, 'MMM yyyy')}`,
        categoryId: parseInt(selectedCategory),
        amount: numericAmount,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create budget');
    }
  };

  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) setSelectedMonth(date);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={styles.picker}>
              <Picker.Item label="Select a category" value="" />
              {categories.map((c) => (
                <Picker.Item key={c.id} label={c.name} value={c.id.toString()} />
              ))}
            </Picker>
          </View>

          <Input
            label="Budget Name"
            value={name}
            onChangeText={setName}
            placeholder="Auto-generated from category & month"
          />

          <Input
            label="Amount (UGX) *"
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Month *</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text>{format(selectedMonth, 'MMMM yyyy')}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={selectedMonth} mode="date" display="default" onChange={handleDateChange} />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Create Budget" onPress={handleSubmit} containerStyle={styles.buttonContainer} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
  form: { padding: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#86939e' },
  pickerContainer: { borderWidth: 1, borderColor: '#e1e8ee', borderRadius: 4, marginBottom: 16 },
  picker: { height: 50 },
  dateButton: { borderWidth: 1, borderColor: '#e1e8ee', borderRadius: 4, padding: 12, marginBottom: 16 },
  buttonContainer: { marginTop: 16 },
  error: { color: 'red', marginBottom: 16 },
});


type AddBudgetScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddBudget'>;

export default function AddBudgetScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [month, setMonth] = useState(new Date());
  const [notes, setNotes] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string>('');
  const navigation = useNavigation<AddBudgetScreenNavigationProp>();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedCategory || !amount) {
        setError('Please fill in all required fields');
        return;
      }

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      await createBudget({
        category: parseInt(selectedCategory),
        amount: numericAmount,
        month,
        notes: notes || undefined,
      });

      navigation.goBack();
    } catch (error: any) {
      console.error('Error creating budget:', error);
      setError(error.response?.data?.message || 'Failed to create budget');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setMonth(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Category Picker */}
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a category" value="" />
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id.toString()}
                />
              ))}
            </Picker>
          </View>

          {/* Amount Input */}
          <Input
            label="Amount (UGX) *"
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            errorStyle={{ color: 'red' }}
            errorMessage={amount === '' ? 'Amount is required' : ''}
          />

          {/* Month Selector */}
          <Text style={styles.label}>Month *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{format(month, 'MMMM yyyy')}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={month}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Notes Input */}
          <Input
            label="Notes"
            placeholder="Add notes (optional)"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Submit Button */}
          <Button
            title="Create Budget"
            onPress={handleSubmit}
            containerStyle={styles.buttonContainer}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#86939e',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e1e8ee',
    borderRadius: 4,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#e1e8ee',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
}); 