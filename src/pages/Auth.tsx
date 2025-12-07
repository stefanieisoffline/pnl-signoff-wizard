import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, productControllers, traders, deskHeads } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isLoggedIn, activeUser } = useRole();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && activeUser) {
      if (activeUser.role === 'product_controller') {
        navigate('/');
      } else {
        navigate('/trader');
      }
    }
  }, [isLoggedIn, activeUser, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email matches a product controller
    const pc = productControllers.find(
      pc => pc.email.toLowerCase() === normalizedEmail
    );

    if (pc) {
      login(pc);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${pc.name} (Product Controller)`,
      });
      navigate('/');
      return;
    }

    // Check if email matches a desk head
    const dh = deskHeads.find(
      dh => dh.email.toLowerCase() === normalizedEmail
    );

    if (dh) {
      login(dh);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${dh.name} (Desk Head)`,
      });
      navigate('/trader');
      return;
    }

    // Check if email matches a trader
    const trader = traders.find(
      trader => trader.email.toLowerCase() === normalizedEmail
    );

    if (trader) {
      login(trader);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${trader.name} (Trader)`,
      });
      navigate('/trader');
      return;
    }

    // No match found
    setIsLoading(false);
    toast({
      title: "Email not found",
      description: "Please enter a valid SEFE email address.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            SE
          </div>
          <CardTitle className="text-2xl">SEFE P&L Sign-Off</CardTitle>
          <CardDescription>
            Enter your email address to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@sefe.eu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}