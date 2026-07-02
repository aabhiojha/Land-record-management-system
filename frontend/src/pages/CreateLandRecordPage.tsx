import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { landRecordApi } from '@/api/landRecordApi';
import { documentApi } from '@/api/documentApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitButton } from '@/components/common/SubmitButton';
import { DOCUMENT_TYPES } from '@/lib/documentTypes';
import { X } from 'lucide-react';
import type { User } from '@/types/user';
import type { DocumentType } from '@/types/document';

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
  const [files, setFiles] = useState<File[]>([]);
  const [docType, setDocType] = useState<DocumentType>('LALPURJA');

  useEffect(() => {
    landRecordApi.getCitizensForOfficer().then((res) => {
      setCitizens(res.data.content);
    }).catch(() => {});
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addFiles = (selected: FileList | null) => {
    if (selected) setFiles((prev) => [...prev, ...Array.from(selected)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

      // Documents need the new record's id, so upload them after it's created.
      // Failures here don't undo the record — the user can retry from its page.
      if (files.length > 0) {
        await Promise.allSettled(
          files.map((file) => documentApi.upload(file, res.data.id, docType)),
        );
      }

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
      <h1 className="text-xl font-semibold mt-1 mb-6">Register Land Record</h1>

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
            <div className="space-y-2 rounded-md border border-dashed p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documents">Documents / Images (optional)</Label>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      addFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={docType} onValueChange={(v: string | null) => v && setDocType(v as DocumentType)}>
                    <SelectTrigger><SelectValue placeholder="Document type" /></SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {files.length > 0 && (
                <ul className="space-y-1">
                  {files.map((file, i) => (
                    <li key={`${file.name}-${i}`} className="flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-xs">
                      <span className="truncate">{file.name} · {(file.size / 1024).toFixed(1)} KB</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="ml-2 shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
