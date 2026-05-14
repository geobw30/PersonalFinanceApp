import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from '@rneui/themed';
import { Icon } from '@rneui/base';
import { RootStackParamList } from './src/types';

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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'Home':       iconName = 'home'; break;
            case 'Expenses':   iconName = 'receipt'; break;
            case 'Budgets':    iconName = 'account-balance-wallet'; break;
            case 'Reports':    iconName = 'assessment'; break;
            case 'Categories': iconName = 'category'; break;
            default:           iconName = 'help';
          }
          return <Icon name={iconName} type="material" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="AddBudget" component={AddBudgetScreen} options={{ title: 'Add Budget' }} />
          <Stack.Screen name="EditBudget" component={EditBudgetScreen} options={{ title: 'Edit Budget' }} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Add Expense' }} />
          <Stack.Screen name="EditExpense" component={EditExpenseScreen} options={{ title: 'Edit Expense' }} />
          <Stack.Screen name="AddCategory" component={AddCategoryScreen} options={{ title: 'Add Category' }} />
          <Stack.Screen name="EditCategory" component={EditCategoryScreen} options={{ title: 'Edit Category' }} />
          <Stack.Screen
            name="SubCategories"
            component={SubCategoriesScreen}
            options={({ route }) => ({
              title: route.params?.categoryName
                ? `${route.params.categoryName} — Sub Categories`
                : 'Sub Categories',
            })}
          />
          <Stack.Screen name="AddSubCategory" component={AddSubCategoryScreen} options={{ title: 'Add Sub Category' }} />
          <Stack.Screen name="EditSubCategory" component={EditSubCategoryScreen} options={{ title: 'Edit Sub Category' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Budgets':
              iconName = 'account-balance-wallet';
              break;
            case 'Expenses':
              iconName = 'receipt';
              break;
            case 'Categories':
              iconName = 'category';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} type="material" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="MainTabs" 
            component={TabNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen name="AddBudget" component={AddBudgetScreen} />
          <Stack.Screen name="EditBudget" component={EditBudgetScreen} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
          <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
          <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
          <Stack.Screen name="EditCategory" component={EditCategoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
} 