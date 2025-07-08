import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, CheckCircle, XCircle, Clock, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckResult {
  card: string;
  status: 'live' | 'dead' | 'unknown' | 'checking';
  response: string;
  bin?: string;
  brand?: string;
  country?: string;
  bank?: string;
}

const CardChecker = () => {
  const [cards, setCards] = useState('');
  const [checkerType, setCheckerType] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const checkerOptions = [
    { value: 'stripe', label: 'Stripe Checker' },
    { value: 'paypal', label: 'PayPal Checker' },
    { value: 'square', label: 'Square Checker' },
    { value: 'braintree', label: 'Braintree Checker' },
    { value: 'authorize', label: 'Authorize.net' },
    { value: 'shopify', label: 'Shopify Payments' },
  ];

  const checkCards = async () => {
    const cardList = cards.split('\n').filter(card => card.trim().length > 0);
    
    if (cardList.length === 0) {
      toast({
        title: "No cards to check",
        description: "Please enter some cards to check",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setShowResults(true);
    
    const initialResults = cardList.map(card => ({
      card: card.trim(),
      status: 'checking' as const,
      response: 'Processing...'
    }));
    setResults(initialResults);

    try {
      // Simulate checking each card
      for (let i = 0; i < cardList.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        const card = cardList[i].trim();
        const cardParts = card.split('|');
        const cardNumber = cardParts[0];
        
        // Mock result generation
        const statuses = ['live', 'dead', 'unknown'];
        const status = statuses[Math.floor(Math.random() * statuses.length)] as 'live' | 'dead' | 'unknown';
        
        const responses = {
          live: ['Approved', 'Success', 'Payment completed', 'Transaction successful'],
          dead: ['Declined', 'Invalid card', 'Insufficient funds', 'Card expired', 'CVV mismatch'],
          unknown: ['Gateway timeout', 'Rate limited', 'Service unavailable', 'Network error']
        };

        const result: CheckResult = {
          card,
          status,
          response: responses[status][Math.floor(Math.random() * responses[status].length)],
          bin: cardNumber.substring(0, 6),
          brand: ['Visa', 'Mastercard', 'American Express'][Math.floor(Math.random() * 3)],
          country: ['United States', 'Canada', 'United Kingdom'][Math.floor(Math.random() * 3)],
          bank: ['Chase Bank', 'Bank of America', 'Wells Fargo'][Math.floor(Math.random() * 3)]
        };

        setResults(prev => prev.map((r, idx) => idx === i ? result : r));
      }

      toast({
        title: "Checking completed",
        description: `Checked ${cardList.length} cards using ${checkerOptions.find(opt => opt.value === checkerType)?.label}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to check cards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResults = () => {
    const resultText = results.map(r => 
      `${r.card} | ${r.status.toUpperCase()} | ${r.response}`
    ).join('\n');
    navigator.clipboard.writeText(resultText);
    toast({
      title: "Copied",
      description: "Results copied to clipboard",
    });
  };

  const downloadResults = () => {
    const resultText = results.map(r => 
      `${r.card} | ${r.status.toUpperCase()} | ${r.response} | ${r.brand} | ${r.country} | ${r.bank}`
    ).join('\n');
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'card_check_results.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const liveCount = results.filter(r => r.status === 'live').length;
  const deadCount = results.filter(r => r.status === 'dead').length;
  const unknownCount = results.filter(r => r.status === 'unknown').length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card className="glass neon-border p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-accent glitch-text mb-2">
                CARD CHECKER
              </h1>
              <p className="text-muted-foreground">
                Professional Mass Card Validation
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Checker Type</label>
                <Select value={checkerType} onValueChange={setCheckerType}>
                  <SelectTrigger className="cyber-glow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {checkerOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Cards to Check (one per line)
                </label>
                <Textarea
                  value={cards}
                  onChange={(e) => setCards(e.target.value)}
                  placeholder="4242424242424242|12/25|123&#10;5555555555554444|01/26|456&#10;378282246310005|11/24|789"
                  className="font-mono text-sm min-h-[200px] cyber-glow"
                />
              </div>

              <Button
                onClick={checkCards}
                disabled={loading || !cards.trim()}
                className="w-full cyber-glow"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Checking Cards...
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Check Cards
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Card */}
        {showResults && (
          <Card className="glass neon-border p-6 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Check Results</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{results.length} total</Badge>
                  <Button size="sm" variant="outline" onClick={copyResults}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadResults}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded bg-primary/20">
                  <div className="text-lg font-bold text-primary">{liveCount}</div>
                  <div className="text-xs text-muted-foreground">LIVE</div>
                </div>
                <div className="text-center p-2 rounded bg-destructive/20">
                  <div className="text-lg font-bold text-destructive">{deadCount}</div>
                  <div className="text-xs text-muted-foreground">DEAD</div>
                </div>
                <div className="text-center p-2 rounded bg-muted/20">
                  <div className="text-lg font-bold text-muted-foreground">{unknownCount}</div>
                  <div className="text-xs text-muted-foreground">UNKNOWN</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Results Table */}
      {showResults && results.length > 0 && (
        <Card className="glass neon-border p-6 animate-fade-in">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detailed Results</h3>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>BIN</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Country</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {result.card}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {result.status === 'checking' && <Clock className="w-4 h-4 animate-spin text-muted-foreground" />}
                          {result.status === 'live' && <CheckCircle className="w-4 h-4 text-primary" />}
                          {result.status === 'dead' && <XCircle className="w-4 h-4 text-destructive" />}
                          {result.status === 'unknown' && <Clock className="w-4 h-4 text-muted-foreground" />}
                          <Badge variant={
                            result.status === 'live' ? 'default' : 
                            result.status === 'dead' ? 'destructive' : 'secondary'
                          }>
                            {result.status.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{result.response}</TableCell>
                      <TableCell className="font-mono">{result.bin}</TableCell>
                      <TableCell>{result.brand}</TableCell>
                      <TableCell>{result.country}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CardChecker;