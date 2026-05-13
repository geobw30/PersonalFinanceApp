# Personal Finance Application Documentation

## Overview

The Personal Finance Application is a comprehensive financial management system consisting of three interconnected projects:

1. **Personal Finance Client** - React-based web application
2. **Personal Finance API** - .NET 9 backend API
3. **Personal Finance Mobile** - React Native mobile application (in progress)

This application helps users track their finances, manage budgets, monitor expenses, and plan for investments and savings.

## Architecture

### System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                            Personal Finance Client                            │
│                        (React + TypeScript + Vite)                            │
└───────────────────────────────────────────────────────────────────────────────┘
                                ↑ HTTP/HTTPS
┌───────────────────────────────────────────────────────────────────────────────┐
│                            Personal Finance API                              │
│                            (.NET 9 + EF Core)                                │
└───────────────────────────────────────────────────────────────────────────────┘
                                ↑ SQL Server
┌───────────────────────────────────────────────────────────────────────────────┐
│                            PersonalFinanceDb                                │
│                                (SQL Server)                                  │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                        Personal Finance Mobile                                │
│                        (React Native + Expo)                                 │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Table of Contents

1. [Personal Finance Client](#personal-finance-client)
   - [Technology Stack](#technology-stack)
   - [Project Structure](#project-structure)
   - [Features](#features)
   - [Configuration](#configuration)
   - [API Integration](#api-integration)
   - [Theming](#theming)
   - [State Management](#state-management)

2. [Personal Finance API](#personal-finance-api)
   - [Technology Stack](#technology-stack-1)
   - [Project Structure](#project-structure-1)
   - [Database Schema](#database-schema)
   - [API Endpoints](#api-endpoints)
   - [Configuration](#configuration-1)
   - [Data Seeding](#data-seeding)

3. [Personal Finance Mobile](#personal-finance-mobile)
   - [Technology Stack](#technology-stack-2)
   - [Project Structure](#project-structure-2)
   - [Navigation](#navigation)

4. [Common Types and Models](#common-types-and-models)
   - [Categories](#categories)
   - [Budgets](#budgets)
   - [Expenses](#expenses)
   - [Investments](#investments)
   - [Savings](#savings)
   - [Income](#income)

5. [Setup and Installation](#setup-and-installation)
   - [Prerequisites](#prerequisites)
   - [Database Setup](#database-setup)
   - [API Setup](#api-setup)
   - [Client Setup](#client-setup)
   - [Mobile Setup](#mobile-setup)

6. [Running the Application](#running-the-application)
   - [Development Mode](#development-mode)
   - [Production Mode](#production-mode)

7. [API Documentation](#api-documentation)
   - [Authentication](#authentication)
   - [Rate Limiting](#rate-limiting)
   - [Error Handling](#error-handling)

8. [Future Enhancements](#future-enhancements)

---

## Personal Finance Client

### Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Context API
- **Routing**: React Router v6
- **Styling**: Emotion (MUI's styling solution)
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Charts**: Recharts

### Project Structure

```
personal-finance-client/
├── public/                  # Static files
│   ├── vite.svg             # Vite logo
│   └── logo.png             # Application logo
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── theme.ts             # Theme configuration
│   ├── vite-env.d.ts        # Vite environment types
│   │
│   ├── api/                 # API service layer
│   │   └── client.ts        # Axios API client configuration
│   │
│   ├── components/          # Reusable components
│   │   ├── Layout.tsx       # Main layout component
│   │   ├── ExpenseDialog.tsx # Dialog for expense management
│   │   ├── IncomeDialog.tsx  # Dialog for income management
│   │   ├── InvestmentDialog.tsx # Dialog for investment management
│   │   ├── SavingsDialog.tsx # Dialog for savings management
│   │   ├── ConfirmDialog.tsx # Confirmation dialog
│   │   └── ...              # Other components
│   │
│   ├── contexts/            # React context providers
│   │   ├── ThemeContext.tsx # Theme management
│   │   └── ToastContext.tsx # Toast notifications
│   │
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Budgets.tsx      # Budget management
│   │   ├── Expenses.tsx     # Expense tracking
│   │   ├── Finance.tsx      # Financial overview
│   │   ├── Reports.tsx      # Reporting and analytics
│   │   ├── Settings.tsx     # User settings
│   │   └── ...              # Other pages
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # All application types
│   │
│   └── index.css            # Global styles
│
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # App-specific TypeScript config
├── tsconfig.node.json       # Node-specific TypeScript config
├── vite.config.ts           # Vite configuration
├── eslint.config.js         # ESLint configuration
├── package.json             # Project dependencies
└── README.md                # Project documentation
```

### Features

1. **Dashboard**: Overview of financial health with key metrics
2. **Budget Management**: Create, edit, and track budgets by category
3. **Expense Tracking**: Record and categorize expenses with detailed notes
4. **Financial Overview**: View investments, savings, and income
5. **Reports & Analytics**: Visualize spending patterns and financial trends
6. **Settings**: User preferences and application configuration
7. **Responsive Design**: Works on desktop, tablet, and mobile devices
8. **Dark/Light Mode**: User-selectable theme
9. **Toast Notifications**: Feedback for user actions

### Configuration

The client application uses Vite for configuration. Key configuration files:

- **`vite.config.ts`**: Vite build configuration
- **`tsconfig.app.json`**: TypeScript configuration for the application
- **`theme.ts`**: Material-UI theme configuration with dark/light modes

### API Integration

The client communicates with the API using Axios. The API client is configured in `src/api/client.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5254/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    return Promise.reject(error);
  }
);

export default api;
```

### Theming

The application supports both light and dark themes through Material-UI's theming system:

```typescript
// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const getTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#2196F3',
      },
      secondary: {
        main: '#4CAF50',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });
};
```

### State Management

The application uses React Context for state management:

1. **ThemeContext**: Manages the application theme (light/dark)
2. **ToastContext**: Handles toast notifications for user feedback

Example usage:

```typescript
// In a component
const { mode, toggleTheme } = useTheme();
const { showToast } = useToast();
```

## Personal Finance API

### Technology Stack

- **Framework**: ASP.NET Core 9.0
- **Language**: C#
- **ORM**: Entity Framework Core 9.0
- **Database**: SQL Server
- **Authentication**: JWT (planned)
- **Documentation**: Swagger/OpenAPI
- **Validation**: Data Annotations

### Project Structure

```
PersonalFinanceApi/
├── Controllers/             # API controllers
│   ├── BudgetsController.cs
│   ├── CategoriesController.cs
│   ├── ExpensesController.cs
│   ├── FinancialSummaryController.cs
│   ├── IncomesController.cs
│   ├── InvestmentsController.cs
│   ├── InvestmentTypesController.cs
│   └── SavingsController.cs
│
├── Data/                   # Data access layer
│   ├── ApplicationDbContext.cs # EF Core DbContext
│   └── SeedData.cs          # Database seeding
│
├── DTOs/                   # Data Transfer Objects
│   ├── BudgetDtos.cs
│   ├── CategoryDtos.cs
│   ├── ExpenseDtos.cs
│   ├── InvestmentDtos.cs
│   ├── SavingDto.cs
│   └── ...                  # Other DTOs
│
├── Models/                 # Domain models
│   ├── Budget.cs
│   ├── Category.cs
│   ├── Expense.cs
│   ├── Income.cs
│   ├── Investment.cs
│   ├── InvestmentType.cs
│   └── Saving.cs
│
├── Migrations/             # EF Core migrations
│   ├── 20250530065214_InitialCreate.cs
│   └── ...                  # Other migrations
│
├── AutoMapperProfile.cs    # AutoMapper configuration
├── Program.cs              # Application entry point
├── appsettings.json        # Configuration
├── appsettings.Development.json # Dev configuration
└── PersonalFinanceApi.csproj # Project file
```

### Database Schema

The application uses SQL Server with Entity Framework Core for data persistence. The main entities are:

1. **Category**: Represents expense/income categories
2. **Budget**: Monthly/periodic budget allocations
3. **Expense**: Individual expense records
4. **Investment**: Investment portfolio tracking
5. **InvestmentType**: Types of investments (Stocks, Bonds, etc.)
6. **Saving**: Savings goals and tracking
7. **Income**: Income sources and records

### API Endpoints

#### Categories Controller

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/api/categories` | Get all categories | None |
| GET | `/api/categories/{id}` | Get a specific category | `id` (int) |
| POST | `/api/categories` | Create a new category | Category DTO |
| PUT | `/api/categories/{id}` | Update a category | `id` (int), Category DTO |
| DELETE | `/api/categories/{id}` | Delete a category | `id` (int) |

#### Budgets Controller

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/api/budgets` | Get all budgets | None |
| GET | `/api/budgets/{id}` | Get a specific budget | `id` (int) |
| GET | `/api/budgets/month/{year}/{month}` | Get budgets for a specific month | `year` (int), `month` (int) |
| POST | `/api/budgets` | Create a new budget | CreateBudgetDto |
| PUT | `/api/budgets/{id}` | Update a budget | `id` (int), UpdateBudgetDto |
| DELETE | `/api/budgets/{id}` | Delete a budget | `id` (int) |

#### Expenses Controller

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/api/expenses` | Get all expenses | None |
| GET | `/api/expenses/{id}` | Get a specific expense | `id` (int) |
| GET | `/api/expenses/month/{year}/{month}` | Get expenses for a specific month | `year` (int), `month` (int) |
| GET | `/api/expenses/summary/{year}/{month}` | Get monthly expense summary | `year` (int), `month` (int) |
| POST | `/api/expenses` | Create a new expense | CreateExpenseDto |
| PUT | `/api/expenses/{id}` | Update an expense | `id` (int), UpdateExpenseDto |
| DELETE | `/api/expenses/{id}` | Delete an expense | `id` (int) |

#### Other Controllers

- **InvestmentsController**: CRUD operations for investments
- **InvestmentTypesController**: CRUD operations for investment types
- **SavingsController**: CRUD operations for savings
- **IncomesController**: CRUD operations for income records
- **FinancialSummaryController**: Financial overview and analytics

### Configuration

The API uses `appsettings.json` for configuration:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PersonalFinanceDb;User Id=sa;Password=3N73ri2e-;MultipleActiveResultSets=true;TrustServerCertificate=True"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### Data Seeding

The application includes a data seeding mechanism that populates the database with initial data:

```csharp
// Data/SeedData.cs
public static class SeedData
{
    public static async Task Initialize(ApplicationDbContext context)
    {
        // Check if there's any data
        if (context.Categories.Any())
        {
            return; // DB has been seeded
        }

        // Add Categories
        var categories = new Category[]
        {
            new Category { Name = "Housing", Description = "Rent, mortgage, repairs, etc." },
            new Category { Name = "Transportation", Description = "Car payments, gas, public transit" },
            new Category { Name = "Food", Description = "Groceries and dining out" },
            new Category { Name = "Utilities", Description = "Electricity, water, internet, phone" },
            new Category { Name = "Healthcare", Description = "Insurance, medications, doctor visits" }
        };

        // Add Budgets
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

        var budgets = new Budget[]
        {
            new Budget { Name = "Housing Budget", CategoryId = categories[0].Id, Amount = 1200, StartDate = startOfMonth, EndDate = endOfMonth },
            new Budget { Name = "Transportation Budget", CategoryId = categories[1].Id, Amount = 300, StartDate = startOfMonth, EndDate = endOfMonth },
            // ... more budgets
        };

        // Add sample expenses, investments, savings, and incomes
        // ...
    }
}
```

The seeding is triggered in `Program.cs` when the application starts:

```csharp
// Seed the database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        await context.Database.MigrateAsync();
        await SeedData.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}
```

## Personal Finance Mobile

### Technology Stack

- **Framework**: React Native
- **Navigation**: React Navigation (Stack and Tab navigators)
- **UI Library**: React Native Elements (rneui)
- **State Management**: Context API (planned: Redux or Zustand)
- **HTTP Client**: Axios
- **Forms**: React Native Paper (planned)

### Project Structure

```
personal-finance-mobile/
├── App.tsx                  # Main application component
└── src/
    ├── api/                 # API service layer
    │   └── client.ts        # Axios API client configuration
    │
    ├── screens/             # Screen components
    │   ├── HomeScreen.tsx
    │   ├── BudgetsScreen.tsx
    │   ├── ExpensesScreen.tsx
    │   ├── CategoriesScreen.tsx
    │   ├── AddBudgetScreen.tsx
    │   ├── EditBudgetScreen.tsx
    │   ├── AddExpenseScreen.tsx
    │   ├── EditExpenseScreen.tsx
    │   ├── AddCategoryScreen.tsx
    │   └── EditCategoryScreen.tsx
    │
    └── types/               # TypeScript type definitions
        └── index.ts         # All application types
```

### Navigation

The mobile app uses React Navigation with a combination of tab and stack navigators:

```typescript
// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
```

## Common Types and Models

### Categories

**TypeScript (Client):**
```typescript
export interface Category {
  id: number;
  name: string;
  description?: string;
}
```

**C# (API):**
```csharp
public class Category
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
```

### Budgets

**TypeScript (Client):**
```typescript
export interface Budget {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
  amount: number;
  startDate: string;
  endDate: string;
}

export interface CreateBudgetRequest {
  name: string;
  categoryId: number;
  amount: number;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetRequest {
  name: string;
  categoryId: number;
  amount: number;
  startDate: string;
  endDate: string;
}
```

**C# (API):**
```csharp
public class Budget
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }
}
```

### Expenses

**TypeScript (Client):**
```typescript
export interface Expense {
  id: number;
  categoryId: number;
  category?: Category;
  amount: number;
  date: string;
  description: string;
  notes?: string;
}
```

**C# (API):**
```csharp
public class Expense
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }

    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}
```

### Investments

**TypeScript (Client):**
```typescript
export interface Investment {
  id: number;
  name: string;
  investmentTypeId: number;
  amount: number;
  date: string;
  currentValue: number;
  notes?: string;
  returnRate?: number;
}

export interface InvestmentType {
  id: number;
  name: string;
  description?: string;
}
```

**C# (API):**
```csharp
public class Investment
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int InvestmentTypeId { get; set; }

    [ForeignKey("InvestmentTypeId")]
    public InvestmentType? InvestmentType { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentValue { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    public decimal? ReturnRate { get; set; }
}

public class InvestmentType
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public ICollection<Investment> Investments { get; set; } = new List<Investment>();
}
```

### Savings

**TypeScript (Client):**
```typescript
export interface Saving {
  id: number;
  name: string;
  type: string; // e.g., 'emergency fund', 'retirement', 'goal-based'
  targetAmount?: number;
  currentAmount: number;
  date: string;
  notes?: string;
  interestRate?: number;
}
```

**C# (API):**
```csharp
public class Saving
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Type { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? TargetAmount { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal CurrentAmount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    public decimal? InterestRate { get; set; }
}
```

### Income

**TypeScript (Client):**
```typescript
export interface Income {
  id: number;
  source: string;
  type: string; // e.g., 'salary', 'freelance', 'investment returns'
  amount: number;
  date: string;
  isRecurring: boolean;
  frequency?: string; // e.g., 'monthly', 'weekly', 'annually'
  notes?: string;
}
```

**C# (API):**
```csharp
public class Income
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Source { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public bool IsRecurring { get; set; }

    [StringLength(50)]
    public string? Frequency { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}
```

## Setup and Installation

### Prerequisites

1. **Node.js** (v18 or later) - For the client application
2. **npm** or **yarn** - Package manager
3. **.NET 9.0 SDK** - For the API
4. **SQL Server** (2019 or later) - Database
5. **SQL Server Management Studio** (optional) - For database management
6. **Visual Studio 2022** or **VS Code** - IDE

### Database Setup

1. Install SQL Server
2. Create a database named `PersonalFinanceDb`
3. Update the connection string in `PersonalFinanceApi/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PersonalFinanceDb;User Id=sa;Password=your_password;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

### API Setup

1. Navigate to the `PersonalFinanceApi` directory
2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```
3. Apply database migrations:
   ```bash
   dotnet ef database update
   ```
4. Run the API:
   ```bash
   dotnet run
   ```
5. The API will be available at `http://localhost:5254`

### Client Setup

1. Navigate to the `personal-finance-client` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (optional) for environment variables:
   ```bash
   VITE_API_BASE_URL=http://localhost:5254/api
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. The client will be available at `http://localhost:5173`

### Mobile Setup

1. Navigate to the `personal-finance-mobile` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```
4. Use the Expo Go app on your mobile device to scan the QR code

## Running the Application

### Development Mode

For development, run all three components:

1. **API**:
   ```bash
   cd PersonalFinanceApi
   dotnet run
   ```

2. **Client**:
   ```bash
   cd personal-finance-client
   npm run dev
   ```

3. **Mobile** (in another terminal):
   ```bash
   cd personal-finance-mobile
   npx expo start
   ```

### Production Mode

For production deployment:

1. **Build the API**:
   ```bash
   cd PersonalFinanceApi
   dotnet publish -c Release -o ./publish
   ```

2. **Build the Client**:
   ```bash
   cd personal-finance-client
   npm run build
   ```

3. **Deploy the Mobile App**:
   ```bash
   cd personal-finance-mobile
   npx expo build:android
   npx expo build:ios
   ```

## API Documentation

### Authentication

Currently, the API does not require authentication. For production, JWT authentication should be implemented.

### Rate Limiting

The API does not currently implement rate limiting. Consider adding it for production use.

### Error Handling

The API follows REST conventions for error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

Example error response:
```json
{
  "message": "Invalid category",
  "statusCode": 400
}
```

## Future Enhancements

1. **Authentication & Authorization**
   - Implement JWT authentication
   - Add user accounts and roles
   - Multi-user support

2. **Advanced Analytics**
   - Predictive budgeting
   - Spending trend analysis
   - Financial goal tracking

3. **Mobile Features**
   - Offline mode with local storage
   - Push notifications for budget alerts
   - Barcode scanning for expense tracking

4. **Integration**
   - Bank account synchronization
   - Credit card integration
   - Investment portfolio tracking

5. **Reporting**
   - PDF/Excel export
   - Custom report generation
   - Financial statement creation

6. **Performance**
   - Caching strategies
   - Database indexing optimization
   - API response compression

7. **Testing**
   - Unit tests for API
   - Integration tests
   - End-to-end tests for client

8. **Documentation**
   - Swagger/OpenAPI documentation
   - Postman collection
   - User guide and tutorials

---

This documentation provides a comprehensive overview of the Personal Finance Application. For more detailed information about specific components, refer to the source code and comments within each file.