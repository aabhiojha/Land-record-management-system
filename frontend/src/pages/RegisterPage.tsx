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
        refreshToken: res.data.refreshToken,
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
      <CardHeader>
        <CardTitle className="text-lg">Citizen registration</CardTitle>
        <CardDescription>
          Your citizenship number is matched against land ownership records.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <FormAlert message={error} />}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('fullName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('email', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (min. 6 characters)</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('password', e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="citizenshipNumber">Citizenship number</Label>
            <Input
              id="citizenshipNumber"
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
            Already registered?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
