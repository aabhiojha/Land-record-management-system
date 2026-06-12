import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';
import { FormAlert } from '@/components/common/FormAlert';
import { SubmitButton } from '@/components/common/SubmitButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { UserRole } from '@/types/user';

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    citizenshipNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.register(form);
      setAuth({
        token: res.data.token,
        userId: res.data.userId,
        fullName: res.data.fullName,
        email: res.data.email,
        role: res.data.role as UserRole,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; fieldErrors?: Record<string, string> } } };
      if (error.response?.data?.fieldErrors) {
        const messages = Object.values(error.response.data.fieldErrors).join(', ');
        setError(messages);
      } else {
        setError(error.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Register as a citizen</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <FormAlert message={error} />}
          <p className="text-xs text-muted-foreground">
            Fields marked <span className="text-primary">*</span> are required.
          </p>
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-primary" aria-hidden="true">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Ram Bahadur Thapa"
              value={form.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('fullName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-primary" aria-hidden="true">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('email', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-primary" aria-hidden="true">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('password', e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="9841234567"
              value={form.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="citizenshipNumber">
              Citizenship Number <span className="text-primary" aria-hidden="true">*</span>
            </Label>
            <Input
              id="citizenshipNumber"
              placeholder="12-34-56789"
              value={form.citizenshipNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('citizenshipNumber', e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <SubmitButton loading={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </SubmitButton>
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
