import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, FAB, Icon, Text } from '@rneui/themed';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { deleteBudget, getBudgetsByMonth } from '../api/client';
import type { Budget, RootStackParamList } from '../types';

const formatCurrency = (amount: number) => `USh ${amount.toLocaleString('en-UG')}`;

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function BudgetsScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const loadData = useCallback(async () => {
    const { data } = await getBudgetsByMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
    setBudgets(data);
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const total = useMemo(() => budgets.reduce((sum, b) => sum + b.amount, 0), [budgets]);

  return (
    <View style={styles.container}>
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>
          <Icon name='chevron-left' type='material' />
        </TouchableOpacity>
        <Text style={styles.monthText}>{format(selectedDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>
          <Icon name='chevron-right' type='material' />
        </TouchableOpacity>
      </View>

      <Card containerStyle={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Budget</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </Card>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {budgets.map((budget) => (
          <Card key={budget.id} containerStyle={styles.itemCard}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{budget.category?.name || budget.name}</Text>
                <Text style={styles.amount}>{formatCurrency(budget.amount)}</Text>
                <Text style={styles.meta}>{format(new Date(budget.startDate), 'dd MMM')} - {format(new Date(budget.endDate), 'dd MMM')}</Text>
              </View>
              <View style={styles.actions}>
                <Icon name='edit' type='material' color='#1976d2' onPress={() => navigation.navigate('EditBudget', { budget })} />
                <Icon name='delete' type='material' color='#d32f2f' onPress={async () => { await deleteBudget(budget.id); await loadData(); }} />
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <FAB icon={{ name: 'add', color: '#fff' }} color='#1976d2' placement='right' onPress={() => navigation.navigate('AddBudget')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  monthText: { fontSize: 18, fontWeight: '700' },
  totalCard: { borderRadius: 10 },
  totalLabel: { textAlign: 'center', color: '#666' },
  totalValue: { textAlign: 'center', fontSize: 24, fontWeight: '700', color: '#1976d2' },
  itemCard: { borderRadius: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  amount: { marginTop: 4, fontSize: 16, color: '#1976d2', fontWeight: '700' },
  meta: { marginTop: 4, fontSize: 12, color: '#777' },
  actions: { gap: 12, alignItems: 'center', justifyContent: 'space-between', minHeight: 56 },
});
