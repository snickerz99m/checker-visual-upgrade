import { useState } from 'react';
import MatrixBackground from '@/components/MatrixBackground';
import Header from '@/components/Header';
import BinChecker from '@/components/BinChecker';
import CCGenerator from '@/components/CCGenerator';
import CardChecker from '@/components/CardChecker';

const Index = () => {
  const [activeTab, setActiveTab] = useState('card-checker');

  return (
    <div className="min-h-screen bg-background relative">
      <MatrixBackground />
      
      <div className="relative z-10">
        <Header />
        
        <main className="max-w-7xl mx-auto p-6">
          <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => setActiveTab('card-checker')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'card-checker'
                    ? 'bg-accent text-accent-foreground cyber-glow'
                    : 'bg-card text-card-foreground border border-border hover:bg-accent'
                }`}
              >
                CARD CHECKER
              </button>
              <button
                onClick={() => setActiveTab('bin-checker')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'bin-checker'
                    ? 'bg-primary text-primary-foreground cyber-glow'
                    : 'bg-card text-card-foreground border border-border hover:bg-accent'
                }`}
              >
                BIN CHECKER
              </button>
              <button
                onClick={() => setActiveTab('cc-gen')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'cc-gen'
                    ? 'bg-secondary text-secondary-foreground cyber-glow'
                    : 'bg-card text-card-foreground border border-border hover:bg-accent'
                }`}
              >
                CC GENERATOR
              </button>
            </div>

            {/* Content */}
            <div className="animate-fade-in">
              {activeTab === 'card-checker' && <CardChecker />}
              {activeTab === 'bin-checker' && <BinChecker />}
              {activeTab === 'cc-gen' && <CCGenerator />}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-border/30 bg-card/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto p-6 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 3MK PABLO Tools. Professional security research platform.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Educational purposes only. Use responsibly.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
