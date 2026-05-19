import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createCategory } from '../api/client';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AddCategoryScreen() {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const onSave = async () => {
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    await createCategory({ name: name.trim(), description: description.trim() || undefined });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Input label='Name' value={name} onChangeText={setName} />
        <Input label='Description' value={description} onChangeText={setDescription} multiline />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title='Save Category' onPress={onSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  error: { color: '#d32f2f', marginBottom: 12 },
});
