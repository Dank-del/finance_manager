import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent sm:text-sm"
                placeholder="First Name"
              />
              <input
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent sm:text-sm"
                placeholder="Last Name"
              />
            </div>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent sm:text-sm"
              placeholder="Email address"
            />
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent sm:text-sm"
              placeholder="Password"
            />
            <input
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent sm:text-sm"
              placeholder="Confirm Password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};