import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/currency';
import axios from 'axios';
import toast from 'react-hot-toast';

type Goal = {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
};

export const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { currency } = useCurrency();
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    priority: 'medium',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get('/api/goals');
      setGoals(response.data);
    } catch (error) {
      toast.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ title: '', description: '', targetAmount: '', currentAmount: '', targetDate: '', priority: 'medium' });
    setEditingId(null);
  };

  const upsert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
        targetDate: form.targetDate,
        priority: form.priority as Goal['priority'],
      };

      if (editingId) {
        const response = await axios.put(`/api/goals/${editingId}`, payload);
        setGoals(prev => prev.map(g => (g.id === editingId ? response.data : g)));
        toast.success('Goal updated successfully');
      } else {
        const response = await axios.post('/api/goals', payload);
        setGoals(prev => [response.data, ...prev]);
        toast.success('Goal created successfully');
      }
      setOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save goal');
    }
  };

  const onEdit = (g: Goal) => {
    setEditingId(g.id);
    setForm({
      title: g.title,
      description: g.description,
      targetAmount: String(g.targetAmount),
      currentAmount: String(g.currentAmount),
      targetDate: g.targetDate.split('T')[0],
      priority: g.priority,
    });
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await axios.delete(`/api/goals/${id}`);
      setGoals(goals.filter(g => g.id !== id));
      toast.success('Goal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {goals.map(g => {
          const percent = Math.min(100, Math.round((g.currentAmount / Math.max(g.targetAmount, 1)) * 100));
          const ring = percent < 80 ? 'text-green-600' : percent < 100 ? 'text-yellow-600' : 'text-indigo-600';
          return (
            <div key={g.id} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md bg-gray-100 ${ring}`}>
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{g.title}</h3>
                    <p className="text-sm text-gray-500">Due {new Date(g.targetDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(g)} className="text-indigo-600 hover:text-indigo-800">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(g.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(g.currentAmount, currency)}</span>
                <span className="text-sm text-gray-500">of {formatCurrency(g.targetAmount, currency)}</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: `${percent}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 capitalize">Priority: {g.priority}</span>
                <span className="text-gray-700 font-medium">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <p className="text-gray-600">No goals yet</p>
          <button
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Your First Goal
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Goal' : 'Add Goal'}</h3>
            <form onSubmit={upsert} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                  <input type="number" step="0.01" min="0" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
                  <input type="number" step="0.01" min="0" value={form.currentAmount} onChange={e => setForm({ ...form, currentAmount: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                  <input type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" rows={3} />
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
