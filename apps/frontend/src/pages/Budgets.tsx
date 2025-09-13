import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import axios from 'axios';
import toast from 'react-hot-toast';

type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  spent: number;
  startDate: string;
  endDate: string;
  alertThreshold: number;
  isActive: boolean;
};

type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
};

export const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ categoryId: '', amount: '', period: 'monthly', startDate: '', endDate: '', alertThreshold: '80' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { currency } = useCurrency();

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/api/budgets');
      setBudgets(response.data);
    } catch (error) {
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.filter((c: Category) => c.type === 'expense'));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const reset = () => {
    setForm({ categoryId: '', amount: '', period: 'monthly', startDate: '', endDate: '', alertThreshold: '80' });
    setEditingId(null);
  };

  const upsert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        categoryId: form.categoryId,
        amount: Number(form.amount),
        period: form.period as Budget['period'],
        startDate: form.startDate,
        endDate: form.endDate,
        alertThreshold: Number(form.alertThreshold)
      };

      if (editingId) {
        const response = await axios.put(`/api/budgets/${editingId}`, payload);
        setBudgets(prev => prev.map(b => (b.id === editingId ? response.data : b)));
        toast.success('Budget updated successfully');
      } else {
        const response = await axios.post('/api/budgets', payload);
        setBudgets(prev => [response.data, ...prev]);
        toast.success('Budget created successfully');
      }
      setOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save budget');
    }
  };

  const onEdit = (b: Budget) => {
    setEditingId(b.id);
    setForm({
      categoryId: b.categoryId,
      amount: String(b.amount),
      period: b.period,
      startDate: b.startDate.split('T')[0],
      endDate: b.endDate.split('T')[0],
      alertThreshold: String(b.alertThreshold)
    });
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await axios.delete(`/api/budgets/${id}`);
      setBudgets(budgets.filter(b => b.id !== id));
      toast.success('Budget deleted successfully');
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Budget
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {budgets.map(b => {
          const percent = Math.min(100, Math.round((b.spent / Math.max(b.amount, 1)) * 100));
          const bar = percent < 80 ? 'bg-green-500' : percent < 100 ? 'bg-yellow-500' : 'bg-red-500';
          return (
            <div key={b.id} className="bg-white rounded-lg shadow p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{b.period.charAt(0).toUpperCase() + b.period.slice(1)} Budget</p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">{getCategoryName(b.categoryId)}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(b)} className="text-indigo-600 hover:text-indigo-800">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(b.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(b.spent, currency)}</span>
                <span className="text-sm text-gray-500">of {formatCurrency(b.amount, currency)}</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${bar}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-gray-600">No budgets yet</p>
          <button
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Your First Budget
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Budget' : 'Add Budget'}</h3>
            <form onSubmit={upsert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <select
                    value={form.period}
                    onChange={e => setForm({ ...form, period: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alert Threshold (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.alertThreshold}
                  onChange={e => setForm({ ...form, alertThreshold: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setOpen(false); reset(); }} className="px-4 py-2 rounded-md border border-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
