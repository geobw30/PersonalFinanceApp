import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Text, FAB, Icon } from '@rneui/themed';
import { format } from 'date-fns';
import { RootStackParamList } from '../types';
import { getExpensesByMonth, deleteExpense } from '../api/client';
import type { Expense } from '../types';

type ExpensesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Expenses'>;

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<ExpensesScreenNavigationProp>();

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await getExpensesByMonth(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1
      );
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [fetchExpenses])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  }, [fetchExpenses]);

  const handleDelete = async (expenseId: number) => {
    try {
      await deleteExpense(expenseId);
      await fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handlePreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const formatCurrency = (amount: number) => {
    return `USh ${amount.toLocaleString('en-UG')}`;
  };

  // Group expenses by date
  const groupedExpenses = expenses.reduce((groups: Record<string, Expense[]>, expense) => {
    const date = format(new Date(expense.date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={handlePreviousMonth}>
          <Icon name="chevron-left" type="material" />
        </TouchableOpacity>
        <Text h4>{format(selectedDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={handleNextMonth}>
          <Icon name="chevron-right" type="material" />
        </TouchableOpacity>
      </View>

      {/* Total Expenses */}
      <Card containerStyle={styles.totalCard}>
        <Card.Title>Total Expenses</Card.Title>
        <Text h3 style={styles.totalAmount}>
          {formatCurrency(expenses.reduce((total, expense) => total + expense.amount, 0))}
        </Text>
      </Card>

      {/* Expense List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {Object.entries(groupedExpenses).map(([date, dayExpenses]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>
              {format(new Date(date), 'EEEE, MMMM d')}
            </Text>
            {dayExpenses.map((expense) => (
              <Card key={expense.id} containerStyle={styles.expenseCard}>
                <View style={styles.expenseHeader}>
                  <View style={styles.expenseInfo}>
                    <Text h4>{expense.description}</Text>
                    <Text style={styles.categoryText}>{expense.category?.name}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('EditExpense', { expense })}
                      style={styles.actionButton}
                    >
                      <Icon name="edit" type="material" size={20} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(expense.id)}
                      style={styles.actionButton}
                    >
                      <Icon name="delete" type="material" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text h3 style={styles.amount}>
                  {formatCurrency(expense.amount)}
                </Text>
                {expense.notes && (
                  <Text style={styles.notes}>{expense.notes}</Text>
                )}
              </Card>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Add Expense FAB */}
      <FAB
        icon={{ name: 'add', color: 'white' }}
        color="#2196F3"
        placement="right"
        onPress={() => navigation.navigate('AddExpense')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  totalCard: {
    margin: 16,
    borderRadius: 8,
  },
  totalAmount: {
    textAlign: 'center',
    color: '#2196F3',
  },
  scrollView: {
    flex: 1,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  expenseCard: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  amount: {
    color: '#F44336',
    marginVertical: 8,
  },
  notes: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
}); 