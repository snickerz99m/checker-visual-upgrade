import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Ghost, Mail, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="glass neon-border p-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Ghost className="w-8 h-8 text-primary animate-pulse" />
              <h1 className="text-3xl font-bold text-primary">Contact Elite</h1>
            </div>
            <p className="text-muted-foreground">
              Reach out to our security research team
            </p>
          </div>

          {/* Quick Contact Links */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              asChild
              variant="outline"
              className="cyber-glow"
            >
              <a href="https://t.me/x5pqT" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                Telegram
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="cyber-glow"
            >
              <a href="mailto:contact@3mkpablo.com">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </a>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="cyber-glow"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="cyber-glow"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="What's this about?"
                className="cyber-glow"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Your message..."
                className="cyber-glow min-h-[120px]"
                required
              />
            </div>

            <Button type="submit" className="w-full cyber-glow" size="lg">
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </form>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>🔒 All communications are encrypted and secure</p>
            <p>⚡ Response time: Usually within 24 hours</p>
            <p>👻 For immediate support, contact us on Telegram: @x5pqT</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContactForm;