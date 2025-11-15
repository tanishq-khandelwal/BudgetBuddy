# 💰 BudgetBuddy

A modern, feature-rich personal finance management application built with Next.js 15, React, and PostgreSQL. Track your income, expenses, and financial goals with beautiful visualizations and powerful insights.

![BudgetBuddy](https://img.shields.io/badge/Next.js-15.0.3-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Features

### 📊 **Financial Dashboard**

- **Real-time Metrics**: Track your remaining balance, income, and expenses
- **Trend Indicators**: See percentage changes compared to previous periods
- **Beautiful Charts**: Visualize your financial data with interactive area charts
- **Animated UI**: Smooth number animations and transitions

### 💸 **Transaction Management**

- **Full CRUD Operations**: Create, read, update, and delete transactions
- **CSV Import**: Bulk import transactions with intelligent column mapping
- **Row Selection**: Choose specific transactions to import from CSV
- **Account & Category Assignment**: Organize transactions effectively
- **Date Filtering**: View transactions by custom date ranges

### 🏦 **Accounts & Categories**

- **Multiple Accounts**: Manage different financial accounts
- **Custom Categories**: Create and organize spending categories
- **Bulk Operations**: Delete multiple items at once
- **Quick Creation**: Add new accounts/categories on-the-fly

### 🎨 **Modern UI/UX**

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Clean Interface**: Modern, aesthetic design with smooth animations
- **Dark Mode Ready**: Prepared for theme switching
- **Accessibility**: Built with a11y best practices

### 🔒 **Security**

- **Authentication**: Powered by Clerk for secure user management
- **Protected Routes**: All financial data is user-specific and protected
- **Environment Variables**: Secure credential management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account (for authentication)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/budgetbuddy.git
   cd budgetbuddy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/budgetbuddy

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run database migrations**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
budgetbuddy/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── accounts/        # Accounts management
│   │   ├── categories/      # Categories management
│   │   ├── transactions/    # Transactions management
│   │   ├── settings/        # Settings page
│   │   └── page.tsx         # Dashboard home
│   └── api/                 # API routes
├── components/              # Reusable components
│   ├── ui/                  # UI components (shadcn)
│   ├── data-card.tsx        # Financial metric cards
│   ├── data-charts.tsx      # Chart components
│   ├── date-filter.tsx      # Date range picker
│   └── account-filter.tsx   # Account dropdown
├── features/                # Feature-based modules
│   ├── accounts/           # Account features
│   ├── categories/         # Category features
│   ├── transactions/       # Transaction features
│   └── summary/            # Summary/analytics
├── db/                     # Database configuration
├── lib/                    # Utility functions
└── public/                 # Static assets
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui, Radix UI
- **Forms**: React Hook Form + Zod
- **State**: React Query (TanStack Query)
- **Charts**: Recharts
- **Animations**: CSS animations + CountUp.js

### Backend

- **API**: Hono (Edge Runtime)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: Clerk
- **Validation**: Zod

### Tools & Libraries

- **CSV Parsing**: react-papaparse
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Select**: react-select

## 📊 Key Features in Detail

### CSV Import System

- Upload CSV files with transaction data
- Interactive column mapping interface
- Row selection with checkboxes
- Real-time validation
- Automatic data transformation
- Sample CSV included (`public/sample-transactions.csv`)

### Financial Analytics

- Income vs Expenses comparison
- Period-over-period change tracking
- Daily transaction breakdown
- Category-wise spending analysis
- Account filtering

### Transaction Filters

- Date range selection (preset + custom)
- Account-based filtering
- Real-time data updates
- URL-based filter persistence

## 🎨 UI Components

All UI components are built with:

- **shadcn/ui**: High-quality, accessible components
- **Tailwind CSS**: Utility-first styling
- **Custom themes**: Easily customizable
- **Responsive**: Mobile-first approach

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database (if applicable)
```

## 🔐 Environment Variables

| Variable                            | Description                  | Required |
| ----------------------------------- | ---------------------------- | -------- |
| `DATABASE_URL`                      | PostgreSQL connection string | ✅       |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key        | ✅       |
| `CLERK_SECRET_KEY`                  | Clerk secret key             | ✅       |
| `NEXT_PUBLIC_APP_URL`               | Application URL              | ✅       |

## 🚧 Roadmap

### Coming Soon

- ⚙️ Settings page with customization options
- 📈 Budget planning and tracking
- 🔔 Transaction notifications
- 📱 Progressive Web App (PWA)
- 🌙 Dark mode
- 📊 Advanced analytics and reports
- 💱 Multi-currency support
- 🔄 Recurring transactions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Clerk](https://clerk.com/) for authentication
- [Vercel](https://vercel.com/) for hosting
- Antonio (Code with Antonio) for inspiration

## 📸 Screenshots

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Transactions

![Transactions](screenshots/transactions.png)

### CSV Import

![Import](screenshots/import.png)

---

**Built with ❤️ using Next.js and React**
