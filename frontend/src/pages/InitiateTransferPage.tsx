import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { landRecordApi } from '@/api/landRecordApi';
import { transferApi } from '@/api/transferApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubmitButton } from '@/components/common/SubmitButton';
import type { LandRecord } from '@/types/landRecord';
import type { User } from '@/types/user';

export function InitiateTransferPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRecord = searchParams.get('recordId');

  const [records, setRecords] = useState<LandRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState(preselectedRecord || '');
  const currentUserId = useAuthStore((s) => s.userId);
  const [openRecord, setOpenRecord] = useState(false);
  
  const [buyerCitizenshipNumber, setBuyerCitizenshipNumber] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyer, setBuyer] = useState<User | null>(null);
  const [verifyingBuyer, setVerifyingBuyer] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [transactionPrice, setTransactionPrice] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    landRecordApi.getMyRecords()
      .then((res) => setRecords(res.data.content))
      .catch(() => {});
  }, []);

  const handleVerifyBuyer = async (e: React.MouseEvent) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyingBuyer(true);
    setBuyer(null);
    try {
      const res = await landRecordApi.searchBuyer(buyerCitizenshipNumber, buyerEmail);
      if (res.data.id === currentUserId) {
         setVerifyError("You cannot transfer land to yourself.");
         return;
      }
      setBuyer(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setVerifyError(error.response?.data?.error || 'Buyer not found');
    } finally {
      setVerifyingBuyer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedRecord || !buyer || !transactionPrice) {
      setError('Please select a land record, verify a buyer, and enter a transaction price');
      return;
    }

    setLoading(true);
    try {
      await transferApi.initiate({
        landRecordId: Number(selectedRecord),
        buyerId: buyer.id,
        transactionPrice: Number(transactionPrice),
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
    <div className="w-full max-w-3xl">
      <Link to="/transfers" className="text-sm text-muted-foreground hover:underline">
        ← Back to transfers
      </Link>
      <h1 className="text-xl font-semibold mt-1 mb-6">Initiate Transfer</h1>

      <Card className="w-full max-w-3xl">
        <CardHeader><CardTitle>Transfer Details</CardTitle></CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 sm:p-8 space-y-8">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 flex flex-col">
                <Label>Land Record</Label>
                <Popover open={openRecord} onOpenChange={setOpenRecord}>
                  <PopoverTrigger
                    role="combobox"
                    aria-expanded={openRecord}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full justify-between font-normal")}
                  >
                    {selectedRecord
                      ? (() => {
                          const r = records.find((r) => String(r.id) === selectedRecord);
                          return r ? `${r.kittaNumber} — ${r.district}, Ward ${r.wardNumber}` : "Select record...";
                        })()
                      : "Select land record..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] md:w-[350px] p-0">
                    <Command>
                      <CommandInput placeholder="Search records..." />
                      <CommandList>
                        <CommandEmpty>No records found.</CommandEmpty>
                        <CommandGroup>
                          {records.map((r) => (
                            <CommandItem
                              key={r.id}
                              value={`${r.kittaNumber} ${r.district} ${r.wardNumber}`}
                              onSelect={() => {
                                setSelectedRecord(String(r.id));
                                setOpenRecord(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedRecord === String(r.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {r.kittaNumber} — {r.district}, Ward {r.wardNumber}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-4">
                <Label>Buyer Verification</Label>
                <div className="rounded-md border p-4 bg-muted/30">
                  {buyer ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{buyer.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          Citizenship no. {buyer.citizenshipNumber} · verified
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setBuyer(null)}>
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {verifyError && (
                        <div className="text-sm font-medium text-destructive">{verifyError}</div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Citizenship Number</Label>
                          <Input 
                            value={buyerCitizenshipNumber} 
                            onChange={(e) => setBuyerCitizenshipNumber(e.target.value)}
                            placeholder="Exact ID required"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Email Address</Label>
                          <Input 
                            type="email"
                            value={buyerEmail} 
                            onChange={(e) => setBuyerEmail(e.target.value)}
                            placeholder="Exact email required"
                          />
                        </div>
                      </div>
                      <Button 
                        variant="secondary" 
                        onClick={handleVerifyBuyer}
                        disabled={!buyerCitizenshipNumber || !buyerEmail || verifyingBuyer}
                        className="w-full"
                      >
                        {verifyingBuyer ? 'Verifying...' : 'Verify buyer'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Agreed Transaction Price (Rs.)</Label>
              <Input 
                type="number"
                min="1"
                placeholder="e.g. 5000000"
                value={transactionPrice}
                onChange={(e) => setTransactionPrice(e.target.value)}
                required
              />
              {transactionPrice && (
                <p className="text-sm text-muted-foreground">
                  Estimated Tax (5%): Rs. {(Number(transactionPrice) * 0.05).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <div className="pt-2">
              <SubmitButton loading={loading}>
                {loading ? 'Initiating...' : 'Initiate Transfer'}
              </SubmitButton>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
