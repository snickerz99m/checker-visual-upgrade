import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const [bins, setBins] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(BinInfo & { bin: string })[]>([]);
  const [error, setError] = useState('');

  const checkBins = async () => {
    const binList = bins.split(/[\n,]/).map(b => b.trim()).filter(b => b.length >= 6);
    
    if (binList.length === 0) {
      setError('Please enter at least one valid BIN (6+ digits)');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    
    try {
      const newResults = [];
      
      for (const bin of binList) {
        // Simulate API call for each BIN
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - replace with real API response
        const schemes = ['VISA', 'MASTERCARD', 'AMERICAN EXPRESS', 'DISCOVER'];
        const types = ['CREDIT', 'DEBIT', 'PREPAID'];
        const countries = [
          { name: 'United States', code: 'US' },
          { name: 'Canada', code: 'CA' },
          { name: 'United Kingdom', code: 'GB' },
          { name: 'Germany', code: 'DE' }
        ];
        const banks = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'CitiBank'];
        
        newResults.push({
          bin,
          scheme: schemes[Math.floor(Math.random() * schemes.length)],
          type: types[Math.floor(Math.random() * types.length)],
          brand: `${schemes[0]} Classic`,
          country: countries[Math.floor(Math.random() * countries.length)],
          bank: banks[Math.floor(Math.random() * banks.length)],
          valid: Math.random() > 0.2
        });
        
        setResults([...newResults]);
      }
    } catch (err) {
      setError('Failed to check BINs');
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
                Enter BINs (one per line or comma-separated)
              </label>
              <Textarea
                value={bins}
                onChange={(e) => setBins(e.target.value)}
                placeholder="424242&#10;555555&#10;378282"
                className="font-mono cyber-glow min-h-[120px]"
              />
            </div>

            <Button
              onClick={checkBins}
              disabled={loading || !bins.trim()}
              className="w-full cyber-glow"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Checking BINs...
                </div>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Check BINs
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
      {results.length > 0 && (
        <Card className="glass neon-border p-6 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">BIN Results</h2>
              <Badge variant="secondary">{results.length} checked</Badge>
            </div>

            <Separator />

            <div className="max-h-[400px] overflow-auto space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-border/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {result.valid ? (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="font-mono font-semibold">{result.bin}</span>
                    <Badge variant={result.valid ? 'default' : 'destructive'}>
                      {result.valid ? 'Valid' : 'Invalid'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Scheme:</span>
                      <Badge variant="secondary" className="text-xs">{result.scheme}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">{result.type}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Country:</span>
                      <span className="font-medium">{result.country.code}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Bank:</span>
                      <span className="font-medium text-xs">{result.bank}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BinChecker;