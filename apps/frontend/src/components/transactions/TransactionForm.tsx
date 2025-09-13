import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CustomDatePicker } from '../CustomDatePicker';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringPeriod?: string;
  recurringEndDate?: string;
}

interface TransactionFormProps {
  transaction?: Transaction | null;
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const TransactionForm = ({ transaction, categories, onSubmit, onCancel }: TransactionFormProps) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringPeriod: 'monthly',
    recurringEndDate: ''
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        type: transaction.type,
        categoryId: transaction.categoryId,
        description: transaction.description,
        date: transaction.date.split('T')[0],
        isRecurring: transaction.isRecurring,
        recurringPeriod: transaction.recurringPeriod || 'monthly',
        recurringEndDate: transaction.recurringEndDate ? transaction.recurringEndDate.split('T')[0] : ''
      });
    }
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      recurringEndDate: formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined
    };

    onSubmit(submitData);
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-border w-96 shadow-lg rounded-md bg-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Amount</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="">Select a category</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Date</label>
            <CustomDatePicker
              selected={formData.date ? new Date(formData.date) : null}
              onChange={(date) => setFormData({ ...formData, date: date ? date.toISOString().split('T')[0] : '' })}
              placeholderText="Select date"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-ring border-input rounded"
            />
            <label className="ml-2 block text-sm text-foreground">
              Recurring transaction
            </label>
          </div>

          {formData.isRecurring && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground">Recurring Period</label>
                <select
                  name="recurringPeriod"
                  value={formData.recurringPeriod}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">End Date (Optional)</label>
                <CustomDatePicker
                  selected={formData.recurringEndDate ? new Date(formData.recurringEndDate) : null}
                  onChange={(date) => setFormData({ ...formData, recurringEndDate: date ? date.toISOString().split('T')[0] : '' })}
                  placeholderText="Select end date"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-input rounded-md bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md text-primary-foreground bg-primary hover:bg-primary/90"
            >
              {transaction ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};