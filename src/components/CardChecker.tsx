import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CreditCard, CheckCircle, XCircle, Clock, Copy, Download, Trash2, ChevronDown, ChevronUp, User, Mail, MessageCircle, ExternalLink, Volume2, Settings, StopCircle, DollarSign, AlertTriangle, HelpCircle, FileText, Ghost, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CheckerService } from '@/services/checkerService';
import { CardCheckResponse } from '@/services/api';

interface CheckResult {
  card: string;
  status: 'live' | 'dead' | 'unknown' | 'checking' | 'insufficient' | 'unknown_decline' | 'error';
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
  const [insufficientOpen, setInsufficientOpen] = useState(true);
  const [unknownDeclineOpen, setUnknownDeclineOpen] = useState(true);
  const [errorsOpen, setErrorsOpen] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [requestDelay, setRequestDelay] = useState('2');
  const [customDelay, setCustomDelay] = useState('2');
  const [threadCount, setThreadCount] = useState('1');
  const [customThreads, setCustomThreads] = useState('1');
  const [fastMode, setFastMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stripeKey, setStripeKey] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stopChecking, setStopChecking] = useState(false);
  const { toast } = useToast();

  // Performance optimization: batch state updates to prevent excessive re-renders
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingResultsRef = useRef<Map<number, CheckResult>>(new Map());

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      pendingResultsRef.current.clear();
      CheckerService.stopChecking();
    };
  }, []);

  // Memory management for large result sets
  useEffect(() => {
    if (results.length > 1000) {
      console.warn('Large result set detected. Consider clearing old results for better performance.');
    }
  }, [results.length]);

  // Sound effect for approved cards
  const playApprovedSound = async () => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Handle browser autoplay policy
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
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
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  };

  const checkerOptions = [
    { value: 'stripe', label: 'Stripe Checker' },
    { value: 'stripe_sk', label: 'Stripe SK Checker' },
    { value: 'paypal', label: 'PayPal Checker' },
    { value: 'square', label: 'Square Checker' },
    { value: 'braintree', label: 'Braintree Checker' },
    { value: 'authorize', label: 'Authorize.net' },
    { value: 'shopify', label: 'Shopify Payments' },
  ];

  const checkCards = async () => {
    // Prevent double execution
    if (loading) return;
    
    const cardList = cards.split('\n').filter(card => card.trim().length > 0);
    
    if (cardList.length === 0) {
      toast({
        title: "No cards to check",
        description: "Please enter some cards to check",
        variant: "destructive"
      });
      return;
    }

    if (checkerType === 'stripe_sk' && !stripeKey.trim()) {
      toast({
        title: "Stripe SK Required",
        description: "Please enter your Stripe Secret Key",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setShowResults(true);
    setCurrentIndex(0);
    setStopChecking(false);

    // Get current settings
    const actualDelay = requestDelay === 'custom' ? parseInt(customDelay) : parseInt(requestDelay);
    const actualThreads = threadCount === 'custom' ? parseInt(customThreads) : parseInt(threadCount);
    
    // Start checking with your PHP backend
    await CheckerService.checkCardsList(
      cardList,
      checkerType,
      { 
        requestDelay: fastMode ? 0 : actualDelay,
        threadCount: fastMode ? 10 : actualThreads,
        fastMode
      },
      stripeKey,
      (result) => {
        // Convert API response to our local format with full card info
        const fullCard = cardList[result.index] || result.cardNumber;
        const localResult: CheckResult = {
          card: fullCard, // Store full card|expiry|cvv format
          status: result.status === 'approved' ? 'live' : 
                  result.status === 'declined' ? 'dead' :
                  result.status === 'ccn' ? 'unknown' :
                  result.status as CheckResult['status'],
          response: result.message,
          bin: result.bin,
          brand: result.brand,
          country: result.country,
          bank: result.bank
        };

        // Batch updates to prevent excessive re-renders with large lists
        pendingResultsRef.current.set(result.index, localResult);
        
        // Clear existing timeout and set a new one
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        updateTimeoutRef.current = setTimeout(() => {
          setResults(prev => {
            const updated = [...prev];
            // Apply all pending updates at once
            pendingResultsRef.current.forEach((res, idx) => {
              updated[idx] = res;
            });
            pendingResultsRef.current.clear();
            return updated;
          });
        }, 50); // Batch updates every 50ms for smooth performance

        // Play sound if card is approved (don't batch this)
        if (localResult.status === 'live') {
          setTimeout(() => playApprovedSound(), 100);
        }
      },
      (current, total) => {
        setCurrentIndex(current - 1);
      }
    );

    setLoading(false);
    setStopChecking(false);
    setCurrentIndex(0);
    
    toast({
      title: "Checking completed",
      description: `Checked ${cardList.length} cards using ${checkerOptions.find(opt => opt.value === checkerType)?.label}`,
    });
  };

  const stopCheckingCards = () => {
    setStopChecking(true);
    CheckerService.stopChecking();
    setLoading(false);
    toast({
      title: "Force stopped",
      description: "All checking operations have been terminated",
      variant: "destructive"
    });
  };

  const copyResults = (status?: string) => {
    const filteredResults = status ? results.filter(r => r.status === status) : results;
    const resultText = filteredResults.map(r => {
      return `${r.card} | ${r.status.toUpperCase()} | ${r.response}`;
    }).join('\n');
    navigator.clipboard.writeText(resultText);
    toast({
      title: "Copied",
      description: `${filteredResults.length} ${status ? status.toUpperCase() + ' ' : ''}results copied to clipboard`,
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

  // Memoize filtered results to prevent unnecessary recalculations
  const filteredResults = useMemo(() => {
    const approved = results.filter(r => r.status === 'live');
    const declined = results.filter(r => r.status === 'dead');
    const unknown = results.filter(r => r.status === 'unknown');
    const insufficient = results.filter(r => r.status === 'insufficient');
    const unknownDecline = results.filter(r => r.status === 'unknown_decline');
    const errors = results.filter(r => r.status === 'error');
    
    return {
      approved,
      declined,
      unknown,
      insufficient,
      unknownDecline,
      errors
    };
  }, [results]);

  const { approved: approvedCards, declined: declinedCards, unknown: unknownCards, 
          insufficient: insufficientCards, unknownDecline: unknownDeclineCards, 
          errors: errorCards } = filteredResults;

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
              <Ghost className="w-5 h-5 text-primary animate-pulse" />
              <h2 className="text-xl font-semibold">About 3MK PABLO</h2>
            </div>
            <div className="text-muted-foreground space-y-2">
              <p>👻 Elite security researcher specializing in advanced payment validation systems.</p>
              <p>🔮 Cutting-edge algorithms with military-grade precision and stealth capabilities.</p>
              <p>⚡ Professional-grade tools designed for expert penetration testing and security research.</p>
              <div className="flex items-center gap-3 text-sm mt-3">
                <FileText className="w-4 h-4 text-primary" />
                <span>Backend integration guide: <code>/src/docs/php-integration.md</code></span>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <a href="https://t.me/x5pqt" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary/80">
                  <MessageCircle className="w-4 h-4" />
                  @x5pqt
                </a>
                <a href="https://t.me/criminalworld0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-secondary hover:text-secondary/80">
                  <MessageCircle className="w-4 h-4" />
                  Elite Updates Channel
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}
      <div className="space-y-6">
        {/* Input Card */}
        <Card className="glass neon-border p-8 w-full">
          <div className="space-y-6">
            <div className="text-center">
            <h1 className="text-2xl font-bold text-accent glitch-text mb-2">
              👻 CARD CHECKER
            </h1>
            <p className="text-muted-foreground text-sm">
              Elite Mass Card Validation System
            </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* Stripe SK Input (conditional) */}
              {checkerType === 'stripe_sk' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stripe Secret Key</label>
                  <Input
                    type="password"
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    placeholder="sk_test_... (Required for Stripe)"
                    className="cyber-glow"
                  />
                </div>
              )}

              {/* Settings Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Settings</label>
                <Button
                  variant="outline"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="cyber-glow w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Checker Settings
                </Button>
              </div>

              {/* Force Stop Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Control</label>
                <Button
                  onClick={loading ? stopCheckingCards : () => setShowResults(true)}
                  variant={loading ? "destructive" : "outline"}
                  className="cyber-glow w-full"
                  disabled={!loading && results.length === 0}
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  {loading ? "Force Stop" : "Show Results"}
                </Button>
              </div>
            </div>

            {/* Settings Panel */}
            {settingsOpen && (
              <Card className="glass neon-border p-4 space-y-4 animate-fade-in">
                <h4 className="font-semibold text-primary">⚙️ Elite Checker Configuration</h4>
                
                {/* Fast Mode Toggle */}
                <div className="p-3 rounded-lg bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent" />
                      <span className="font-medium text-accent">⚡ FAST MODE</span>
                    </div>
                    <Button
                      variant={fastMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFastMode(!fastMode)}
                      className="text-xs"
                    >
                      {fastMode ? "ON" : "OFF"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Parallel processing with maximum speed (10 threads, no delay)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Request Delay</label>
                    <Select value={requestDelay} onValueChange={setRequestDelay} disabled={fastMode}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No delay</SelectItem>
                        <SelectItem value="1">1 second</SelectItem>
                        <SelectItem value="2">2 seconds</SelectItem>
                        <SelectItem value="3">3 seconds</SelectItem>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {requestDelay === 'custom' && (
                      <Input
                        type="number"
                        value={customDelay}
                        onChange={(e) => setCustomDelay(e.target.value)}
                        placeholder="Seconds"
                        className="h-8 text-xs"
                        min="0"
                        max="60"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Multi-threading</label>
                    <Select value={threadCount} onValueChange={setThreadCount} disabled={fastMode}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Thread (Safe)</SelectItem>
                        <SelectItem value="3">3 Threads</SelectItem>
                        <SelectItem value="5">5 Threads</SelectItem>
                        <SelectItem value="10">10 Threads (Fast)</SelectItem>
                        <SelectItem value="20">20 Threads (Risk)</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {threadCount === 'custom' && (
                      <Input
                        type="number"
                        value={customThreads}
                        onChange={(e) => setCustomThreads(e.target.value)}
                        placeholder="Thread count"
                        className="h-8 text-xs"
                        min="1"
                        max="50"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Sound Alerts</label>
                    <Button
                      variant={soundEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="w-full h-8 text-xs"
                    >
                      {soundEnabled ? "🔊 ON" : "🔇 OFF"}
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  💡 Fast Mode: Maximum speed with parallel processing. Normal Mode: Custom delays and threading for stealth.
                </div>
              </Card>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Cards to Check (Format: card|expiry|cvv)
                  </label>
                </div>

                <Textarea
                  value={cards}
                  onChange={(e) => setCards(e.target.value)}
                  placeholder="4242424242424242|12/28|123&#10;5555555555554444|01/29|456&#10;4000000000000002|06/27|789&#10;378282246310005|12/30|100"
                  className="font-mono text-sm min-h-[200px] cyber-glow"
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={checkCards}
                  disabled={loading || !cards.trim()}
                  className="w-full cyber-glow"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Checking... ({currentIndex + 1})
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Start Elite Checking
                    </>
                  )}
                </Button>
                
                {/* Beautiful Progress Bar */}
                {loading && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress: {currentIndex + 1} / {cards.split('\n').filter(c => c.trim()).length}</span>
                      <div className="flex items-center gap-2">
                        {fastMode && <span className="text-accent font-medium">⚡ FAST MODE</span>}
                        <span>{Math.round(((currentIndex + 1) / cards.split('\n').filter(c => c.trim()).length) * 100)}%</span>
                      </div>
                    </div>
                    
                    {/* Standard progress bar */}
                    <Progress 
                      value={((currentIndex + 1) / cards.split('\n').filter(c => c.trim()).length) * 100}
                      className="h-4 cyber-glow animate-pulse"
                    />
                    
                    {/* Enhanced visual progress */}
                    <div className="relative h-3 bg-gradient-to-r from-background via-muted to-background rounded-full overflow-hidden neon-border">
                      <div 
                        className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${((currentIndex + 1) / cards.split('\n').filter(c => c.trim()).length) * 100}%`,
                          boxShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--secondary)), 0 0 60px hsl(var(--accent))'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                  </div>
                )}
              </div>

              {/* Live Stats Dashboard */}
              {showResults && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 cyber-glow">
                    <div className="text-lg font-bold text-primary">{approvedCards.length}</div>
                    <div className="text-xs text-primary font-medium">👻 APPROVED</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-muted/20 to-muted/10 border border-muted/30">
                    <div className="text-lg font-bold text-muted-foreground">{unknownCards.length}</div>
                    <div className="text-xs text-muted-foreground font-medium">⏳ CCN</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/10 border border-destructive/30">
                    <div className="text-lg font-bold text-destructive">{declinedCards.length}</div>
                    <div className="text-xs text-destructive font-medium">❌ DECLINED</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/10 border border-orange-500/30">
                    <div className="text-lg font-bold text-orange-400">{insufficientCards.length}</div>
                    <div className="text-xs text-orange-400 font-medium">💳 INSUFFICIENT</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/30">
                    <div className="text-lg font-bold text-purple-400">{unknownDeclineCards.length}</div>
                    <div className="text-xs text-purple-400 font-medium">❓ UNKNOWN</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-red-500/20 to-red-500/10 border border-red-500/30">
                    <div className="text-lg font-bold text-red-400">{errorCards.length}</div>
                    <div className="text-xs text-red-400 font-medium">🔥 ERRORS</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Elite Results Windows - Always Visible After First Check */}
        {(showResults || results.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
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
                         {approvedCards.slice(0, 50).map((result, index) => (
                           <div key={`approved-${index}`} className="font-mono text-sm p-2 rounded bg-primary/10 border border-primary/20">
                             <div className="flex justify-between items-start">
                               <span className="text-primary font-medium">{result.card}</span>
                               <Badge variant="default" className="text-xs">LIVE</Badge>
                             </div>
                             <div className="text-xs text-muted-foreground mt-1">
                               {result.response} • {result.brand} • {result.country}
                             </div>
                           </div>
                         ))}
                         {approvedCards.length > 50 && (
                           <div className="text-center py-2 text-xs text-muted-foreground">
                             Showing first 50 of {approvedCards.length} approved cards. Download all results to see more.
                           </div>
                         )}
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
                         {unknownCards.slice(0, 50).map((result, index) => (
                           <div key={`unknown-${index}`} className="font-mono text-sm p-2 rounded bg-muted/10 border border-muted/20">
                             <div className="flex justify-between items-start">
                               <span>{result.card}</span>
                               <Badge variant="secondary" className="text-xs">CCN</Badge>
                             </div>
                             <div className="text-xs text-muted-foreground mt-1">
                               {result.response} • {result.brand} • {result.country}
                             </div>
                           </div>
                         ))}
                         {unknownCards.length > 50 && (
                           <div className="text-center py-2 text-xs text-muted-foreground">
                             Showing first 50 of {unknownCards.length} CCN cards. Download all results to see more.
                           </div>
                         )}
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
                         {declinedCards.slice(0, 50).map((result, index) => (
                           <div key={`declined-${index}`} className="font-mono text-sm p-2 rounded bg-destructive/10 border border-destructive/20">
                             <div className="flex justify-between items-start">
                               <span>{result.card}</span>
                               <Badge variant="destructive" className="text-xs">DEAD</Badge>
                             </div>
                             <div className="text-xs text-muted-foreground mt-1">
                               {result.response} • {result.brand} • {result.country}
                             </div>
                           </div>
                         ))}
                         {declinedCards.length > 50 && (
                           <div className="text-center py-2 text-xs text-muted-foreground">
                             Showing first 50 of {declinedCards.length} declined cards. Download all results to see more.
                           </div>
                         )}
                       </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Insufficient Cards Window */}
            <Card className="glass neon-border animate-fade-in">
              <Collapsible open={insufficientOpen} onOpenChange={setInsufficientOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-orange-500/5 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-orange-400" />
                      <h3 className="text-lg font-semibold text-orange-400">Insufficient Cards</h3>
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                        {insufficientCards.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {insufficientCards.length > 0 && (
                        <>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyResults('insufficient'); }}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadResults('insufficient'); }}>
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
                                <AlertDialogTitle>Clear Insufficient Cards?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove all insufficient cards from the results.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => clearResults('insufficient')}>
                                  Clear
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {insufficientOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 max-h-[400px] overflow-auto">
                    {insufficientCards.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No insufficient cards yet</p>
                    ) : (
                       <div className="space-y-2">
                         {insufficientCards.slice(0, 50).map((result, index) => (
                           <div key={`insufficient-${index}`} className="font-mono text-sm p-2 rounded bg-orange-500/10 border border-orange-500/20">
                             <div className="flex justify-between items-start">
                               <span>{result.card}</span>
                               <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-400">INSUFFICIENT</Badge>
                             </div>
                             <div className="text-xs text-muted-foreground mt-1">
                               {result.response} • {result.brand} • {result.country}
                             </div>
                           </div>
                         ))}
                         {insufficientCards.length > 50 && (
                           <div className="text-center py-2 text-xs text-muted-foreground">
                             Showing first 50 of {insufficientCards.length} insufficient cards. Download all results to see more.
                           </div>
                         )}
                       </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Unknown Decline Cards Window */}
            <Card className="glass neon-border animate-fade-in">
              <Collapsible open={unknownDeclineOpen} onOpenChange={setUnknownDeclineOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-500/5 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-purple-400">Unknown Decline</h3>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                        {unknownDeclineCards.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {unknownDeclineCards.length > 0 && (
                        <>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyResults('unknown_decline'); }}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadResults('unknown_decline'); }}>
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
                                <AlertDialogTitle>Clear Unknown Decline Cards?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove all unknown decline cards from the results.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => clearResults('unknown_decline')}>
                                  Clear
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {unknownDeclineOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 max-h-[400px] overflow-auto">
                    {unknownDeclineCards.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No unknown decline cards yet</p>
                    ) : (
                       <div className="space-y-2">
                         {unknownDeclineCards.slice(0, 50).map((result, index) => (
                           <div key={`unknown-decline-${index}`} className="font-mono text-sm p-2 rounded bg-purple-500/10 border border-purple-500/20">
                             <div className="flex justify-between items-start">
                               <span>{result.card}</span>
                               <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">UNK DECLINE</Badge>
                             </div>
                             <div className="text-xs text-muted-foreground mt-1">
                               {result.response} • {result.brand} • {result.country}
                             </div>
                           </div>
                         ))}
                         {unknownDeclineCards.length > 50 && (
                           <div className="text-center py-2 text-xs text-muted-foreground">
                             Showing first 50 of {unknownDeclineCards.length} unknown decline cards. Download all results to see more.
                           </div>
                         )}
                       </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Errors Cards Window */}
            <Card className="glass neon-border animate-fade-in">
              <Collapsible open={errorsOpen} onOpenChange={setErrorsOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-500/5 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-red-400">Error Cards</h3>
                      <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                        {errorCards.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {errorCards.length > 0 && (
                        <>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyResults('error'); }}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadResults('error'); }}>
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
                                <AlertDialogTitle>Clear Error Cards?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove all error cards from the results.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => clearResults('error')}>
                                  Clear
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {errorsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 max-h-[400px] overflow-auto">
                    {errorCards.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No error cards yet</p>
                    ) : (
                       <div className="space-y-2">
                         {errorCards.slice(0, 50).map((result, index) => (
                           <div key={`error-${index}`} className="font-mono text-sm p-2 rounded bg-red-500/10 border border-red-500/20">
                             <div className="flex justify-between items-start">
                               <span>{result.card}</span>
                               <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-400">ERROR</Badge>
                             </div>
                             <div className="text-xs text-muted-foreground mt-1">
                               {result.response} • {result.brand} • {result.country}
                             </div>
                           </div>
                         ))}
                         {errorCards.length > 50 && (
                           <div className="text-center py-2 text-xs text-muted-foreground">
                             Showing first 50 of {errorCards.length} error cards. Download all results to see more.
                           </div>
                         )}
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