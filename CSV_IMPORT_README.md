# CSV Import Feature

## Overview

The transaction import feature allows you to bulk upload transactions from a CSV file. This is useful for importing bank statements or migrating data from other financial tools.

## CSV Format

Your CSV file should contain the following columns:

- **date** (required): Date in `yyyy-MM-dd` format (e.g., 2025-01-15)
- **payee** (required): Name of the merchant or person
- **amount** (required): Transaction amount (negative for expenses, positive for income)
- **notes** (optional): Additional notes about the transaction

## Sample CSV

```csv
date,payee,amount,notes
2025-01-15,Grocery Store,-125.50,Weekly groceries
2025-01-16,Coffee Shop,-4.75,Morning coffee
2025-01-17,Salary Deposit,3000.00,Monthly salary
2025-01-18,Gas Station,-45.00,Fuel
```

A sample CSV file is available at: `public/sample-transactions.csv`

## How to Use

1. **Prepare your CSV file** with the correct format
2. **Click the Import button** on the Transactions page
3. **Select your CSV file** from your computer
4. **Map columns** - Select which column in your CSV corresponds to date, payee, amount, and notes
   - You must map all required fields (date, payee, amount) before continuing
   - You can skip optional columns
5. **Select an account** - Choose which account these transactions belong to
6. **Confirm** - Review and import your transactions

## Important Notes

- Date must be in `yyyy-MM-dd` format
- Amounts should be negative for expenses and positive for income
- All transactions will be assigned to the same account you select during import
- You can review and edit individual transactions after import
- The import process uses the same validation as manual entry

## Features

- ✅ Visual column mapping interface
- ✅ Real-time validation
- ✅ Progress indicator (shows which required fields are mapped)
- ✅ Responsive design (works on mobile and desktop)
- ✅ Account selection dialog
- ✅ Bulk creation with error handling
- ✅ Success/error notifications
