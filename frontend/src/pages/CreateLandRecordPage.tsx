import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { landRecordApi } from '@/api/landRecordApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from '@/components/common/SubmitButton';
import type { User } from '@/types/user';

export function CreateLandRecordPage() {
  const navigate = useNavigate();
  const [citizens, setCitizens] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    kittaNumber: '',
    areaSqMeters: '',
    district: '',
    municipality: '',
    wardNumber: '',
    landType: '',
    ownerId: '',
  });

  useEffect(() => {
    landRecordApi.getCitizens().then((res) => {
      setCitizens(res.data);
    }).catch(() => {});
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await landRecordApi.create({
        kittaNumber: form.kittaNumber,
        areaSqMeters: Number(form.areaSqMeters),
        district: form.district,
        municipality: form.municipality,
        wardNumber: Number(form.wardNumber),
        landType: form.landType,
        ownerId: Number(form.ownerId),
      });
      navigate(`/land-records/${res.data.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/land-records" className="text-sm text-muted-foreground hover:underline">
        ← Back to records
      </Link>
      <h1 className="text-3xl font-bold mt-1 mb-6">Register New Land Record</h1>

      <Card>
        <CardHeader><CardTitle>Land Details</CardTitle></CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kittaNumber">Kitta Number</Label>
                <Input id="kittaNumber" placeholder="KTM-1001" value={form.kittaNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('kittaNumber', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaSqMeters">Area (sq. meters)</Label>
                <Input id="areaSqMeters" type="number" min="1" placeholder="500" value={form.areaSqMeters}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('areaSqMeters', e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input id="district" placeholder="Kathmandu" value={form.district}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('district', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipality">Municipality</Label>
                <Input id="municipality" placeholder="Kathmandu Metropolitan City" value={form.municipality}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('municipality', e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wardNumber">Ward Number</Label>
                <Input id="wardNumber" type="number" min="1" placeholder="10" value={form.wardNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('wardNumber', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Land Type</Label>
                <Select value={form.landType} onValueChange={(v: string | null) => v && updateField('landType', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AABAD">Aabad (Residential)</SelectItem>
                    <SelectItem value="KHET">Khet (Agricultural)</SelectItem>
                    <SelectItem value="PAKHO">Pakho (Barren)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={form.ownerId} onValueChange={(v: string | null) => v && updateField('ownerId', v)}>
                <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>
                  {citizens.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.fullName} ({c.citizenshipNumber || c.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SubmitButton loading={loading}>
              {loading ? 'Registering...' : 'Register Land Record'}
            </SubmitButton>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
