import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import type { Currency } from '../utils/currency';
import axios from 'axios';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { user, token } = useAuth();
  const { currency, setCurrency, theme, setTheme } = useCurrency();
  const [profile, setProfile] = useState({ firstName: '', lastName: '' });
  const [prefs, setPrefs] = useState({ currency: 'USD' as Currency, theme: 'light' as 'light' | 'dark' | 'system' });
  const [loading, setLoading] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ firstName: user.firstName || '', lastName: user.lastName || '' });
    }
  }, [user]);

  useEffect(() => {
    setPrefs({ currency, theme });
  }, [currency, theme]);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await axios.get('/preferences');
        setPrefs({ currency: response.data.currency as Currency, theme: response.data.theme });
      } catch (error) {
        console.error('Failed to fetch preferences');
      }
    };

    if (token) {
      fetchPreferences();
    }
  }, [token]);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/auth/profile', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsLoading(true);
    try {
      await axios.put('/preferences', prefs);
      setCurrency(prefs.currency);
      setTheme(prefs.theme);
      toast.success('Preferences saved successfully');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setPrefsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
            <form onSubmit={onSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                <input value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                <input value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button disabled={loading} className="px-4 py-2 rounded-md text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Preferences</h2>
            <form onSubmit={onSavePrefs} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Currency</label>
                <select value={prefs.currency} onChange={e => setPrefs({ ...prefs, currency: e.target.value as Currency })} className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Theme</label>
                <select value={prefs.theme} onChange={e => setPrefs({ ...prefs, theme: e.target.value as 'light' | 'dark' | 'system' })} className="w-full rounded-md border border-input px-3 py-2 bg-background text-foreground">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button disabled={prefsLoading} className="px-4 py-2 rounded-md text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50">
                  {prefsLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-base font-semibold text-foreground mb-2">Account</h3>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
          </div>
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-base font-semibold text-foreground mb-2">Security</h3>
            <button className="px-4 py-2 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground">Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};
