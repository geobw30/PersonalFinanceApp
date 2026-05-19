import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, FAB, Icon, Text } from '@rneui/themed';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { deleteSubCategory, getSubCategoriesByCategory } from '../api/client';
import type { RootStackParamList, SubCategory } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SubCategoriesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const categoryId: number = route.params?.categoryId;
  const categoryName: string = route.params?.categoryName || 'Category';
  const [items, setItems] = useState<SubCategory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!categoryId) return;
    const { data } = await getSubCategoriesByCategory(categoryId);
    setItems(data);
  }, [categoryId]);

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

  const onDelete = (item: SubCategory) => {
    Alert.alert('Delete Sub Category', `Delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
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
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {items.map((item) => (
          <Card key={item.id} containerStyle={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.name}</Text>
                {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              </View>
              <View style={styles.actions}>
                <Icon name='edit' type='material' color='#1976d2' onPress={() => navigation.navigate('EditSubCategory', { subCategory: item })} />
                <Icon name='delete' type='material' color='#d32f2f' onPress={() => onDelete(item)} />
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
      {categoryId ? (
        <FAB
          icon={{ name: 'add', color: '#fff' }}
          color='#1976d2'
          placement='right'
          onPress={() => navigation.navigate('AddSubCategory', { categoryId, categoryName })}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  heading: { paddingHorizontal: 16, paddingTop: 12, fontWeight: '700', color: '#555' },
  card: { borderRadius: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
  description: { color: '#777', marginTop: 4 },
  actions: { minHeight: 52, justifyContent: 'space-between', alignItems: 'center' },
});
