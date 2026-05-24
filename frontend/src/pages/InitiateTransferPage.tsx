import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { landRecordApi } from '@/api/landRecordApi';
import { transferApi } from '@/api/transferApi';
import { userApi } from '@/api/userApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/common/SubmitButton';
import type { LandRecord } from '@/types/landRecord';
import type { User } from '@/types/user';

export function InitiateTransferPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRecord = searchParams.get('recordId');

  const [records, setRecords] = useState<LandRecord[]>([]);
  const [citizens, setCitizens] = useState<User[]>([]);
  const [selectedRecord, setSelectedRecord] = useState(preselectedRecord || '');
  const [selectedBuyer, setSelectedBuyer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      landRecordApi.getMyRecords(),
      userApi.getAll(),
    ]).then(([recordsRes, usersRes]) => {
      setRecords(recordsRes.data);
      setCitizens(usersRes.data.filter((u) => u.role === 'CITIZEN'));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedRecord || !selectedBuyer) {
      setError('Please select both a land record and a buyer');
      return;
    }
    setLoading(true);
    try {
      await transferApi.initiate({
        landRecordId: Number(selectedRecord),
        buyerId: Number(selectedBuyer),
      });
      navigate('/transfers');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to initiate transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <Link to="/transfers" className="text-sm text-muted-foreground hover:underline">
        ← Back to transfers
      </Link>
      <h1 className="text-3xl font-bold mt-1 mb-6">Initiate Transfer</h1>

      <Card>
        <CardHeader><CardTitle>Transfer Details</CardTitle></CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label>Land Record</Label>
              <Select value={selectedRecord} onValueChange={(v: string | null) => v && setSelectedRecord(v)}>
                <SelectTrigger><SelectValue placeholder="Select your land record" /></SelectTrigger>
                <SelectContent>
                  {records.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.kittaNumber} — {r.district}, Ward {r.wardNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Buyer</Label>
              <Select value={selectedBuyer} onValueChange={(v: string | null) => v && setSelectedBuyer(v)}>
                <SelectTrigger><SelectValue placeholder="Select buyer" /></SelectTrigger>
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
              {loading ? 'Initiating...' : 'Initiate Transfer'}
            </SubmitButton>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
