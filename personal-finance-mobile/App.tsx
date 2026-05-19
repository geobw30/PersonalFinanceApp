import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, Icon } from '@rneui/themed';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { RootStackParamList, MainTabParamList } from './src/types';

import HomeScreen from './src/screens/HomeScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import AddBudgetScreen from './src/screens/AddBudgetScreen';
import EditBudgetScreen from './src/screens/EditBudgetScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import EditExpenseScreen from './src/screens/EditExpenseScreen';
import AddCategoryScreen from './src/screens/AddCategoryScreen';
import EditCategoryScreen from './src/screens/EditCategoryScreen';
import SubCategoriesScreen from './src/screens/SubCategoriesScreen';
import AddSubCategoryScreen from './src/screens/AddSubCategoryScreen';
import EditSubCategoryScreen from './src/screens/EditSubCategoryScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'help';
          if (route.name === 'Home') iconName = 'home';
          if (route.name === 'Expenses') iconName = 'receipt';
          if (route.name === 'Budgets') iconName = 'account-balance-wallet';
          if (route.name === 'Reports') iconName = 'assessment';
          if (route.name === 'Categories') iconName = 'category';
          return <Icon name={iconName} type='material' size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e88e5',
      })}
    >
      <Tab.Screen name='Home' component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name='Expenses' component={ExpensesScreen} />
      <Tab.Screen name='Budgets' component={BudgetsScreen} />
      <Tab.Screen name='Reports' component={ReportsScreen} />
      <Tab.Screen name='Categories' component={CategoriesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name='MainTabs' component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name='AddBudget' component={AddBudgetScreen} options={{ title: 'Add Budget' }} />
            <Stack.Screen name='EditBudget' component={EditBudgetScreen} options={{ title: 'Edit Budget' }} />
            <Stack.Screen name='AddExpense' component={AddExpenseScreen} options={{ title: 'Add Expense' }} />
            <Stack.Screen name='EditExpense' component={EditExpenseScreen} options={{ title: 'Edit Expense' }} />
            <Stack.Screen name='AddCategory' component={AddCategoryScreen} options={{ title: 'Add Category' }} />
            <Stack.Screen name='EditCategory' component={EditCategoryScreen} options={{ title: 'Edit Category' }} />
            <Stack.Screen name='SubCategories' component={SubCategoriesScreen} options={{ title: 'Sub Categories' }} />
            <Stack.Screen name='AddSubCategory' component={AddSubCategoryScreen} options={{ title: 'Add Sub Category' }} />
            <Stack.Screen name='EditSubCategory' component={EditSubCategoryScreen} options={{ title: 'Edit Sub Category' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
