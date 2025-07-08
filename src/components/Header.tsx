import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ghost, ExternalLink, MessageCircle } from 'lucide-react';

const Header = () => {
  const [activeTab, setActiveTab] = useState('bin-checker');

  return (
    <div className="w-full">
      {/* Contact Banner */}
      <div className="bg-destructive/20 border border-destructive/30 p-3 text-center">
        <div className="flex items-center justify-center gap-4 text-sm">
          <a 
            href="https://t.me/x5pqt" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            For inquiries or problems, contact @x5pqt
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-muted-foreground">•</span>
          <a 
            href="https://t.me/criminalworld0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors"
          >
            Join our group for updates
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Header */}
      <div className="glass border-b border-border/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Ghost className="w-8 h-8 text-primary animate-pulse" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  3MK <span className="text-primary">PABLO</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Elite Security Research Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="cyber-glow">
                👻 Elite
              </Badge>
              <Badge variant="outline">
                ⚡ Advanced
              </Badge>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'bin-checker' ? 'default' : 'outline'}
              onClick={() => setActiveTab('bin-checker')}
              className="cyber-glow"
            >
              BIN CHECKER
            </Button>
            <Button
              variant={activeTab === 'cc-gen' ? 'secondary' : 'outline'}
              onClick={() => setActiveTab('cc-gen')}
              className="cyber-glow"
            >
              CC GEN
            </Button>
          </div>
        </div>
      </div>

      {/* Store active tab in parent component's state */}
      <div className="hidden">{activeTab}</div>
    </div>
  );
};

export default Header;