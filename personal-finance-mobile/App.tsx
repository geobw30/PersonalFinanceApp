import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ThemeProvider } from "@rneui/themed";
import { Icon } from "@rneui/themed";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { RootStackParamList, MainTabParamList } from "./src/types";

import HomeScreen from "./src/screens/HomeScreen";
import BudgetsScreen from "./src/screens/BudgetsScreen";
import ExpensesScreen from "./src/screens/ExpensesScreen";
import FinanceScreen from "./src/screens/FinanceScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import ReportsScreen from "./src/screens/ReportsScreen";
import AddBudgetScreen from "./src/screens/AddBudgetScreen";
import EditBudgetScreen from "./src/screens/EditBudgetScreen";
import AddExpenseScreen from "./src/screens/AddExpenseScreen";
import EditExpenseScreen from "./src/screens/EditExpenseScreen";
import AddCategoryScreen from "./src/screens/AddCategoryScreen";
import EditCategoryScreen from "./src/screens/EditCategoryScreen";
import SubCategoriesScreen from "./src/screens/SubCategoriesScreen";
import AddSubCategoryScreen from "./src/screens/AddSubCategoryScreen";
import EditSubCategoryScreen from "./src/screens/EditSubCategoryScreen";
import AddInvestmentScreen from "./src/screens/AddInvestmentScreen";
import EditInvestmentScreen from "./src/screens/EditInvestmentScreen";
import AddSavingScreen from "./src/screens/AddSavingScreen";
import EditSavingScreen from "./src/screens/EditSavingScreen";
import AddIncomeScreen from "./src/screens/AddIncomeScreen";
import EditIncomeScreen from "./src/screens/EditIncomeScreen";
import AddInvestmentTypeScreen from "./src/screens/AddInvestmentTypeScreen";
import EditInvestmentTypeScreen from "./src/screens/EditInvestmentTypeScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#1e88e5",
        tabBarInactiveTintColor: "#607d8b",
        tabBarStyle: {
          height: 64,
          paddingTop: 4,
          paddingBottom: 6,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Icon name="dashboard" type="material" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="receipt" type="material" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="account-balance" type="material" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Finance"
        component={FinanceScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="savings" type="material" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="report" type="material" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="settings" type="material" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddBudget"
              component={AddBudgetScreen}
              options={{ title: "Add Budget" }}
            />
            <Stack.Screen
              name="EditBudget"
              component={EditBudgetScreen}
              options={{ title: "Edit Budget" }}
            />
            <Stack.Screen
              name="AddExpense"
              component={AddExpenseScreen}
              options={{ title: "Add Expense" }}
            />
            <Stack.Screen
              name="EditExpense"
              component={EditExpenseScreen}
              options={{ title: "Edit Expense" }}
            />
            <Stack.Screen
              name="AddCategory"
              component={AddCategoryScreen}
              options={{ title: "Add Category" }}
            />
            <Stack.Screen
              name="EditCategory"
              component={EditCategoryScreen}
              options={{ title: "Edit Category" }}
            />
            <Stack.Screen
              name="SubCategories"
              component={SubCategoriesScreen}
              options={{ title: "Sub Categories" }}
            />
            <Stack.Screen
              name="AddSubCategory"
              component={AddSubCategoryScreen}
              options={{ title: "Add Sub Category" }}
            />
            <Stack.Screen
              name="EditSubCategory"
              component={EditSubCategoryScreen}
              options={{ title: "Edit Sub Category" }}
            />
            <Stack.Screen
              name="AddInvestment"
              component={AddInvestmentScreen}
              options={{ title: "Add Investment" }}
            />
            <Stack.Screen
              name="EditInvestment"
              component={EditInvestmentScreen}
              options={{ title: "Edit Investment" }}
            />
            <Stack.Screen
              name="AddSaving"
              component={AddSavingScreen}
              options={{ title: "Add Saving" }}
            />
            <Stack.Screen
              name="EditSaving"
              component={EditSavingScreen}
              options={{ title: "Edit Saving" }}
            />
            <Stack.Screen
              name="AddIncome"
              component={AddIncomeScreen}
              options={{ title: "Add Income" }}
            />
            <Stack.Screen
              name="EditIncome"
              component={EditIncomeScreen}
              options={{ title: "Edit Income" }}
            />
            <Stack.Screen
              name="AddInvestmentType"
              component={AddInvestmentTypeScreen}
              options={{ title: "Add Investment Type" }}
            />
            <Stack.Screen
              name="EditInvestmentType"
              component={EditInvestmentTypeScreen}
              options={{ title: "Edit Investment Type" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
