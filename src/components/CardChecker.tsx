import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CreditCard, CheckCircle, XCircle, Clock, Copy, Download, Trash2, ChevronDown, ChevronUp, User, Mail, MessageCircle, ExternalLink, Volume2 } from 'lucide-react';
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
  const [approvedOpen, setApprovedOpen] = useState(true);
  const [ccnOpen, setCcnOpen] = useState(true);
  const [declinedOpen, setDeclinedOpen] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { toast } = useToast();

  // Sound effect for approved cards
  const playApprovedSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

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

        setResults(prev => {
          const updated = prev.map((r, idx) => idx === i ? result : r);
          // Play sound if card is approved
          if (result.status === 'live') {
            setTimeout(() => playApprovedSound(), 100);
          }
          return updated;
        });
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

  const copyResults = (status?: string) => {
    const filteredResults = status ? results.filter(r => r.status === status) : results;
    const resultText = filteredResults.map(r => 
      `${r.card} | ${r.status.toUpperCase()} | ${r.response}`
    ).join('\n');
    navigator.clipboard.writeText(resultText);
    toast({
      title: "Copied",
      description: `${status ? status.toUpperCase() + ' ' : ''}Results copied to clipboard`,
    });
  };

  const downloadResults = (status?: string) => {
    const filteredResults = status ? results.filter(r => r.status === status) : results;
    const resultText = filteredResults.map(r => 
      `${r.card} | ${r.status.toUpperCase()} | ${r.response} | ${r.brand} | ${r.country} | ${r.bank}`
    ).join('\n');
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${status || 'all'}_results.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearResults = (status?: string) => {
    if (status) {
      setResults(prev => prev.filter(r => r.status !== status));
    } else {
      setResults([]);
    }
    toast({
      title: "Cleared",
      description: `${status ? status.toUpperCase() + ' ' : 'All '}results cleared`,
    });
  };

  const approvedCards = results.filter(r => r.status === 'live');
  const declinedCards = results.filter(r => r.status === 'dead');
  const unknownCards = results.filter(r => r.status === 'unknown');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* About/Contact Header */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAboutOpen(!aboutOpen)}
          className="cyber-glow"
        >
          <User className="w-4 h-4 mr-2" />
          About Me
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="cyber-glow"
        >
          <a href="https://t.me/x5pqt" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>
      </div>

      {/* About Section */}
      {aboutOpen && (
        <Card className="glass neon-border p-6 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">About 3MK PABLO</h2>
            </div>
            <div className="text-muted-foreground space-y-2">
              <p>Professional security researcher specializing in payment card validation and BIN analysis.</p>
              <p>🔥 Premium tools for educational and research purposes only.</p>
              <p>👑 Advanced algorithms with high accuracy rates.</p>
              <div className="flex items-center gap-4 pt-2">
                <a href="https://t.me/x5pqt" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80">
                  <MessageCircle className="w-4 h-4" />
                  @x5pqt
                </a>
                <a href="https://t.me/criminalworld0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-secondary hover:text-secondary/80">
                  <MessageCircle className="w-4 h-4" />
                  Join Updates Group
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Card */}
        <Card className="glass neon-border p-6 lg:col-span-1">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-accent glitch-text mb-2">
                CARD CHECKER
              </h1>
              <p className="text-muted-foreground text-sm">
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
                  Cards to Check
                </label>
                <Textarea
                  value={cards}
                  onChange={(e) => setCards(e.target.value)}
                  placeholder="4242424242424242|12/25|123&#10;5555555555554444|01/26|456"
                  className="font-mono text-xs min-h-[120px] cyber-glow"
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
                    Checking...
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Check Cards
                  </>
                )}
              </Button>

              {/* Stats */}
              {showResults && (
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <div className="text-center p-3 rounded bg-primary/20 border border-primary/30">
                    <div className="text-lg font-bold text-primary">{approvedCards.length}</div>
                    <div className="text-xs text-muted-foreground">LIVE</div>
                  </div>
                  <div className="text-center p-3 rounded bg-destructive/20 border border-destructive/30">
                    <div className="text-lg font-bold text-destructive">{declinedCards.length}</div>
                    <div className="text-xs text-muted-foreground">DEAD</div>
                  </div>
                  <div className="text-center p-3 rounded bg-muted/20 border border-muted/30">
                    <div className="text-lg font-bold text-muted-foreground">{unknownCards.length}</div>
                    <div className="text-xs text-muted-foreground">CCN</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Results Windows */}
        {showResults && (
          <div className="lg:col-span-2 space-y-4">
            {/* Approved Cards Window */}
            <Card className="glass neon-border animate-fade-in">
              <Collapsible open={approvedOpen} onOpenChange={setApprovedOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary/5 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-primary">Approved Cards</h3>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        {approvedCards.length}
                      </Badge>
                      {approvedCards.length > 0 && <Volume2 className="w-4 h-4 text-primary animate-pulse" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {approvedCards.length > 0 && (
                        <>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyResults('live'); }}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadResults('live'); }}>
                            <Download className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass neon-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Clear Approved Cards?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove all approved cards from the results. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => clearResults('live')}>
                                  Clear
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {approvedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 max-h-[300px] overflow-auto">
                    {approvedCards.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No approved cards yet</p>
                    ) : (
                      <div className="space-y-2">
                        {approvedCards.map((result, index) => (
                          <div key={index} className="font-mono text-sm p-2 rounded bg-primary/10 border border-primary/20">
                            <div className="flex justify-between items-start">
                              <span className="text-primary font-medium">{result.card}</span>
                              <Badge variant="default" className="text-xs">LIVE</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {result.response} • {result.brand} • {result.country}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* CCN/Unknown Cards Window */}
            <Card className="glass neon-border animate-fade-in">
              <Collapsible open={ccnOpen} onOpenChange={setCcnOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/5 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">CCN/Unknown</h3>
                      <Badge variant="secondary">
                        {unknownCards.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {unknownCards.length > 0 && (
                        <>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyResults('unknown'); }}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadResults('unknown'); }}>
                            <Download className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass neon-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Clear CCN Cards?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove all CCN/Unknown cards from the results.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => clearResults('unknown')}>
                                  Clear
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {ccnOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 max-h-[300px] overflow-auto">
                    {unknownCards.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No CCN cards yet</p>
                    ) : (
                      <div className="space-y-2">
                        {unknownCards.map((result, index) => (
                          <div key={index} className="font-mono text-sm p-2 rounded bg-muted/10 border border-muted/20">
                            <div className="flex justify-between items-start">
                              <span>{result.card}</span>
                              <Badge variant="secondary" className="text-xs">CCN</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {result.response} • {result.brand} • {result.country}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Declined Cards Window */}
            <Card className="glass neon-border animate-fade-in">
              <Collapsible open={declinedOpen} onOpenChange={setDeclinedOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-destructive/5 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-destructive" />
                      <h3 className="text-lg font-semibold text-destructive">Declined Cards</h3>
                      <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                        {declinedCards.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {declinedCards.length > 0 && (
                        <>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyResults('dead'); }}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadResults('dead'); }}>
                            <Download className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass neon-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Clear Declined Cards?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove all declined cards from the results.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => clearResults('dead')}>
                                  Clear
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {declinedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 max-h-[300px] overflow-auto">
                    {declinedCards.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No declined cards yet</p>
                    ) : (
                      <div className="space-y-2">
                        {declinedCards.map((result, index) => (
                          <div key={index} className="font-mono text-sm p-2 rounded bg-destructive/10 border border-destructive/20">
                            <div className="flex justify-between items-start">
                              <span>{result.card}</span>
                              <Badge variant="destructive" className="text-xs">DEAD</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {result.response} • {result.brand} • {result.country}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardChecker;