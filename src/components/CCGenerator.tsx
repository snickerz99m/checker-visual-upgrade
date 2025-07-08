import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CCGenerator = () => {
  const [bin, setBin] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [format, setFormat] = useState('basic');
  const [generatedCards, setGeneratedCards] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateCards = async () => {
    if (bin.length < 6) {
      toast({
        title: "Invalid BIN",
        description: "BIN must be at least 6 digits",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate generation - replace with your backend logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const cards = [];
      const count = Math.min(parseInt(quantity), 1000);
      
      for (let i = 0; i < count; i++) {
        const cardNumber = generateCardNumber(bin);
        const expiry = generateExpiry();
        const cvv = generateCVV();
        
        switch (format) {
          case 'basic':
            cards.push(cardNumber);
            break;
          case 'with-expiry':
            cards.push(`${cardNumber}|${expiry}`);
            break;
          case 'full':
            cards.push(`${cardNumber}|${expiry}|${cvv}`);
            break;
        }
      }
      
      setGeneratedCards(cards);
      toast({
        title: "Success",
        description: `Generated ${count} cards`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate cards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCardNumber = (bin: string) => {
    let cardNumber = bin.padEnd(15, '0');
    // Add random digits
    for (let i = bin.length; i < 15; i++) {
      cardNumber = cardNumber.substring(0, i) + Math.floor(Math.random() * 10) + cardNumber.substring(i + 1);
    }
    // Add Luhn check digit
    const checkDigit = calculateLuhnCheckDigit(cardNumber);
    return cardNumber + checkDigit;
  };

  const calculateLuhnCheckDigit = (number: string) => {
    let sum = 0;
    let alternate = true;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let n = parseInt(number.charAt(i));
      if (alternate) {
        n *= 2;
        if (n > 9) n = (n % 10) + 1;
      }
      sum += n;
      alternate = !alternate;
    }
    
    return (10 - (sum % 10)) % 10;
  };

  const generateExpiry = () => {
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const year = String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1).slice(-2);
    return `${month}/${year}`;
  };

  const generateCVV = () => {
    return String(Math.floor(Math.random() * 900) + 100);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCards.join('\n'));
    toast({
      title: "Copied",
      description: "Cards copied to clipboard",
    });
  };

  const downloadCards = () => {
    const blob = new Blob([generatedCards.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_cards.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="glass neon-border p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-secondary glitch-text mb-2">
              CC GENERATOR
            </h1>
            <p className="text-muted-foreground">
              Professional Card Generation Tool
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">BIN</label>
              <Input
                value={bin}
                onChange={(e) => setBin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="424242"
                className="cyber-glow"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger className="cyber-glow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="cyber-glow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Card Number Only</SelectItem>
                  <SelectItem value="with-expiry">Card|MM/YY</SelectItem>
                  <SelectItem value="full">Card|MM/YY|CVV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generateCards}
            disabled={loading || bin.length < 6}
            className="w-full cyber-glow"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Generating...
              </div>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Generate Cards
              </>
            )}
          </Button>
        </div>
      </Card>

      {generatedCards.length > 0 && (
        <Card className="glass neon-border p-6 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Generated Cards</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {generatedCards.length} cards
                </Badge>
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={downloadCards}>
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <Textarea
              value={generatedCards.join('\n')}
              readOnly
              className="font-mono text-sm min-h-[200px] resize-none"
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default CCGenerator;