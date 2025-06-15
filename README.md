# DigiSamahārta - AI-Powered Expense Insights

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-purple?logo=vite)](https://vitejs.dev/)
[![Appwrite](https://img.shields.io/badge/Backend-Appwrite-ff0066?logo=appwrite)](https://appwrite.io/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)

**DigiSamahārta** (from Sanskrit: *डिजिसमाहर्ता*, meaning "Digital Collector/Comptroller") is a sophisticated, minimalist, and powerful personal finance management web application. It is designed to provide users with an effortless way to track expenses, manage group finances, set and achieve savings goals, and gain actionable insights through an intuitive, AI-enhanced interface.

### ✨ [Live Demo](https://digisamaharta.vercel.app/)



## 🌟 Key Features

DigiSamahārta is packed with features to give you complete control over your financial life.

*   **📊 Interactive Dashboard:** Get a quick overview of your financial health with stats on monthly spending, income, savings, and active allowances.
*   **💸 Effortless Expense Tracking:** A streamlined form to add expenses with details like category, payment method, bank, notes, and bill uploads.
*   **📖 Comprehensive Passbook:** A complete transaction history with powerful filtering and sorting capabilities by date, type, category, bank, and amount.
*   **📈 Advanced Analytics:**
    *   Visualize spending with interactive charts (by category, by bank).
    *   Analyze income vs. expense trends over various time periods.
    *   Track savings goals and performance.
    *   Export detailed reports in **PDF** and **Excel (.xlsx)** formats, including charts and raw data.
*   **👥 Group Expense Management:** Create groups, add members, and log shared expenses to easily manage finances with friends and family.
*   **🎯 Goal Setting & Tracking:** Define financial goals, track your progress with visual indicators, and stay motivated to save.
*   **🔄 Recurring Transactions:** Set up and manage recurring expenses and income (subscriptions, bills, salary) to automate your financial tracking.
*   **🎨 Customizable Theming:**
    *   Switch between **Light**, **Dark**, and **System** themes.
    *   Personalize your experience with a selection of theme colors.
*   **🔐 Secure Authentication:** Secure user authentication and profile management powered by Appwrite.
*   **📱 Mobile-First & PWA-Ready:** A fully responsive design that works beautifully on all devices. Includes a script to generate a native Android APK from the live web app.
*   **🧠 AI-Powered Insights (Conceptual):** The architecture is designed to integrate AI for providing smart recommendations, budget analysis, and financial health scores.

## 🛠️ Technology Stack

*   **Frontend:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [React Router](https://reactrouter.com/)
*   **UI Framework:** [Tailwind CSS](https://tailwindcss.com/) with [Shadcn/ui](https://ui.shadcn.com/) for a component library built on Radix UI.
*   **Data Visualization:** [Recharts](https://recharts.org/)
*   **Backend as a Service (BaaS):** [Appwrite](https://appwrite.io/) for Authentication, Database, and Storage.
*   **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Bun](https://bun.sh/) (or npm/pnpm/yarn)
*   A running [Appwrite](https://appwrite.io/docs/installation) instance (v1.5 or higher recommended). You can use Docker for a quick setup.

### 1. Appwrite Setup

This is the most critical step. You need to configure your Appwrite instance to match the application's requirements.

1.  **Create a Project:**
    *   Log in to your Appwrite console.
    *   Create a new project. Note the **Project ID**.
    *   Under **Platforms**, add a new **Web App**. Give it a name (e.g., "DigiSamahārta Web") and set the hostname to `localhost`.

2.  **Create Database & Collections:**
    *   Go to the **Databases** section and create a new database. Note the **Database ID**.
    *   Inside your new database, create the following collections with the specified attributes and indexes.

    <details>
    <summary><strong>Click to view Collection Schemas</strong></summary>

    #### `users` (Collection ID: `VITE_APPWRITE_USERS_COLLECTION_ID`)
    *This collection stores extended user profile information.*
    | Attribute Key | Type | Size | Required | Array | Default | Notes |
    | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
    | `userId` | String | 255 | ✅ Yes | | | User's auth ID |
    | `name` | String | 255 | ✅ Yes | | | |
    | `email` | Email | 255 | ✅ Yes | | | |
    | `age` | Integer | | | | | |
    | `occupation` | String | 255 | | | | |
    | `idealRetirementAge`| Integer | | | | | |
    | `country` | String | 255 | | | | |
    | `currency` | String | 10 | | | `INR` | |
    | `avatarUrl` | String | 255 | | | | File ID from Storage |
    | `themePreference` | String | 50 | | | `system` | 'light', 'dark', or 'system' |
    | `themeColorsPrimary`| String | 50 | | | | HSL color string |
    | `themeColorsAccent` | String | 50 | | | | HSL color string |
    **Indexes:** `userId` (key: `userId_idx`, type: `key`, attributes: `userId`)

    ---
    #### `expenses` (Collection ID: `VITE_APPWRITE_EXPENSES_COLLECTION_ID`)
    *Stores all individual expense and income transactions.*
    | Attribute Key | Type | Size | Required | Array | Default | Notes |
    | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
    | `userId` | String | 255 | ✅ Yes | | | |
    | `name` | String | 255 | ✅ Yes | | | |
    | `amount` | Float | | ✅ Yes | | | Positive for expense, negative for income |
    | `category` | String | 255 | ✅ Yes | | | |
    | `date` | Datetime | | ✅ Yes | | | |
    | `paymentMethod` | String | 255 | | | | |
    | `bank` | String | 255 | | | | |
    | `notes` | String | 1000 | | | | |
    | `billImage` | String | 255 | | | | File ID from Storage |
    | `groupId` | String | 255 | | | | |
    | `splitBetween` | String | 255 | ✅ Yes | | `[]` | Array of user IDs |
    | `paidBy` | String | 255 | | | | User ID of the payer |
    | `isSettled` | Boolean | | | | `true` | For group expenses |
    | `isRecurringInstance`| Boolean | | | | `false` | If generated from a recurring template |
    | `currency` | String | 10 | | | `INR` | |
    **Indexes:** `userId` (key: `userId_idx`), `date` (key: `date_idx`), `groupId` (key: `groupId_idx`)

    ---
    #### `allowances` (Collection ID: `VITE_APPWRITE_ALLOWANCES_COLLECTION_ID`)
    *Manages recurring income sources.*
    | Attribute Key | Type | Size | Required | Array | Default | Notes |
    | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
    | `userId` | String | 255 | ✅ Yes | | | |
    | `bankName` | String | 255 | ✅ Yes | | | |
    | `amount` | Float | | ✅ Yes | | | |
    | `frequency`| String | 50 | ✅ Yes | | | 'daily', 'weekly', 'monthly', 'yearly' |
    | `nextReceived`| Datetime | | ✅ Yes | | | |
    | `isActive` | Boolean | | ✅ Yes | | `true` | |
    **Indexes:** `userId` (key: `userId_idx`)

    ---
    #### `recurring_expenses` (Collection ID: `VITE_APPWRITE_RECURRING_EXPENSES_COLLECTION_ID`)
    *Templates for recurring bills and subscriptions.*
    | Attribute Key | Type | Size | Required | Array | Default | Notes |
    | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
    | `userId` | String | 255 | ✅ Yes | | | |
    | `name` | String | 255 | ✅ Yes | | | |
    | `amount` | Float | | ✅ Yes | | | |
    | `category` | String | 255 | ✅ Yes | | | |
    | `frequency`| String | 50 | ✅ Yes | | | 'daily', 'weekly', 'monthly', 'yearly' |
    | `nextDueDate`| Datetime | | ✅ Yes | | | |
    | `isActive` | Boolean | | ✅ Yes | | `true` | |
    | `lastPaidDate`| Datetime | | | | | |
    | `paymentMethod` | String | 255 | | | | |
    | `bank` | String | 255 | | | | |
    | `notes` | String | 1000 | | | | |
    **Indexes:** `userId` (key: `userId_idx`)

    ---
    #### `groups` (Collection ID: `VITE_APPWRITE_GROUPS_COLLECTION_ID`)
    *Stores information about user-created groups.*
    | Attribute Key | Type | Size | Required | Array | Default | Notes |
    | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
    | `name` | String | 255 | ✅ Yes | | | |
    | `description` | String | 1000 | | | | |
    | `members` | String | 255 | ✅ Yes | | `[]` | Array of user IDs |
    | `adminUserIds` | String | 255 | ✅ Yes | | `[]` | Array of user IDs |
    | `createdBy` | String | 255 | ✅ Yes | | | User ID of the creator |
    | `currency` | String | 10 | | | `INR` | |
    | `avatarUrl` | String | 255 | | | | File ID from Storage |
    **Indexes:** `members` (key: `members_idx`, type: `key`, attributes: `members`, array: `true`)

    ---
    #### `goals` (Collection ID: `VITE_APPWRITE_GOALS_COLLECTION_ID`)
    *Manages user's financial savings goals.*
    | Attribute Key | Type | Size | Required | Array | Default | Notes |
    | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
    | `userId` | String | 255 | ✅ Yes | | | |
    | `name` | String | 255 | ✅ Yes | | | |
    | `targetAmount` | Float | | ✅ Yes | | | |
    | `currentAmount`| Float | | ✅ Yes | | `0` | |
    | `targetDate` | Datetime | | ✅ Yes | | | |
    | `category` | String | 255 | | | `savings` | |
    | `isAchieved` | Boolean | | | | `false` | |
    **Indexes:** `userId` (key: `userId_idx`)

    </details>

3.  **Create Storage Bucket:**
    *   Go to the **Storage** section.
    *   Create a new bucket. Note the **Bucket ID**.
    *   In the bucket settings, set the file-level permissions. A good starting point is to give `Read`, `Update`, and `Delete` access to `role:user(USER_ID)`, where `USER_ID` is a placeholder for the user who uploaded the file. This is handled in the code but ensure your bucket allows it.

### 2. Local Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/adityavofficial/expenza-ai-insights.git
    cd adityavofficial-expenza-ai-insights
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    # or
    # npm install
    ```

3.  **Set up environment variables:**
    *   Create a `.env` file in the root of the project.
    *   Copy the contents of `.env.example` (if provided) or add the following variables, replacing the placeholder values with your Appwrite project details:
    ```env
    VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
    VITE_APPWRITE_PROJECT_ID="YOUR_PROJECT_ID"
    VITE_APPWRITE_DATABASE_ID="YOUR_DATABASE_ID"
    VITE_APPWRITE_STORAGE_BUCKET_ID="YOUR_STORAGE_BUCKET_ID"

    # Collection IDs
    VITE_APPWRITE_USERS_COLLECTION_ID="YOUR_USERS_COLLECTION_ID"
    VITE_APPWRITE_EXPENSES_COLLECTION_ID="YOUR_EXPENSES_COLLECTION_ID"
    VITE_APPWRITE_ALLOWANCES_COLLECTION_ID="YOUR_ALLOWANCES_COLLECTION_ID"
    VITE_APPWRITE_RECURRING_EXPENSES_COLLECTION_ID="YOUR_RECURRING_EXPENSES_COLLECTION_ID"
    VITE_APPWRITE_GROUPS_COLLECTION_ID="YOUR_GROUPS_COLLECTION_ID"
    VITE_APPWRITE_GOALS_COLLECTION_ID="YOUR_GOALS_COLLECTION_ID"
    ```

4.  **Run the development server:**
    ```bash
    bun run dev
    ```
    The application should now be running on `http://localhost:8080`.

## 📱 Generating the Android APK

This project includes a script to wrap the live web application in a native Android APK using Capacitor.

### Prerequisites for APK Generation

*   [Android Studio](https://developer.android.com/studio) installed.
*   `ANDROID_HOME` environment variable set to your Android SDK path.
    *   Example for macOS: `export ANDROID_HOME="/Users/$USER/Library/Android/sdk"`
    *   Example for Linux: `export ANDROID_HOME="/home/$USER/Android/Sdk"`
*   A 1024x1024px PNG app icon.

### Steps to Generate

1.  **Make the script executable:**
    ```bash
    chmod +x create_apk_from_url.sh
    ```

2.  **Configure the script:**
    *   Open `create_apk_from_url.sh` in a text editor.
    *   Update the configuration variables at the top of the file:
        *   `APP_NAME`: Your desired app name.
        *   `APP_ID`: A unique package ID (e.g., `com.yourcompany.yourapp`).
        *   `LIVE_URL`: The URL of your deployed web app.
        *   `APP_ICON_PATH`: The absolute path to your 1024x1024px app icon.
        *   `FULL_SCREEN_MODE`: Set to `true` or `false`.

3.  **Run the script:**
    ```bash
    ./create_apk_from_url.sh
    ```
    The script will create a new project directory, configure Capacitor, generate icons, and build the debug APK. The final `.apk` file will be located in `[PROJECT_DIR]/android/app/build/outputs/apk/debug/app-debug.apk`.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Aditya Verma - [@adityavofficial](https://twitter.com/adityavofficial) - aditya.verma.dev@gmail.com

Project Link: [https://github.com/adityavofficial/expenza-ai-insights](https://github.com/adityavofficial/expenza-ai-insights)