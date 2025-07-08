import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Shield, MapPin, Building, CheckCircle, XCircle } from 'lucide-react';

interface BinInfo {
  scheme: string;
  type: string;
  brand: string;
  country: {
    name: string;
    code: string;
  };
  bank: string;
  valid: boolean;
}

const BinChecker = () => {
  const [bin, setBin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BinInfo | null>(null);
  const [error, setError] = useState('');

  const checkBin = async () => {
    if (bin.length < 6) {
      setError('BIN must be at least 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Simulate API call - replace with your backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data - replace with real API response
      setResult({
        scheme: 'VISA',
        type: 'CREDIT',
        brand: 'Visa Classic',
        country: {
          name: 'United States',
          code: 'US'
        },
        bank: 'Chase Bank',
        valid: true
      });
    } catch (err) {
      setError('Failed to check BIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Checker Card */}
      <Card className="glass neon-border p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary glitch-text mb-2">
              BIN CHECKER
            </h1>
            <p className="text-muted-foreground">
              Professional Bank Identification Number Lookup
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Enter BIN (First 6-8 digits)
              </label>
              <Input
                value={bin}
                onChange={(e) => setBin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="e.g., 424242"
                className="text-lg cyber-glow"
                maxLength={8}
              />
            </div>

            <Button
              onClick={checkBin}
              disabled={loading || bin.length < 6}
              className="w-full cyber-glow"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Checking BIN...
                </div>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Check BIN
                </>
              )}
            </Button>

            {error && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Results Card */}
      {result && (
        <Card className="glass neon-border p-6 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {result.valid ? (
                <CheckCircle className="w-5 h-5 text-primary" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
              <h2 className="text-xl font-semibold">BIN Information</h2>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Scheme:</span>
                  <Badge variant="secondary">{result.scheme}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant={result.type === 'CREDIT' ? 'default' : 'outline'}>
                    {result.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Brand:</span>
                  <span className="font-medium">{result.brand}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Country:</span>
                  <span className="font-medium">{result.country.name} ({result.country.code})</span>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Bank:</span>
                  <span className="font-medium">{result.bank}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BinChecker;