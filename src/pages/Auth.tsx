import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, productControllers, traders } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentRole, setSelectedPCIndex, setSelectedTraderIndex } = useRole();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email matches a product controller
    const pcIndex = productControllers.findIndex(
      pc => pc.email.toLowerCase() === normalizedEmail
    );

    if (pcIndex !== -1) {
      setCurrentRole('product_controller');
      setSelectedPCIndex(pcIndex);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${productControllers[pcIndex].name}`,
      });
      navigate('/');
      return;
    }

    // Check if email matches a trader
    const traderIndex = traders.findIndex(
      trader => trader.email.toLowerCase() === normalizedEmail
    );

    if (traderIndex !== -1) {
      setCurrentRole('trader');
      setSelectedTraderIndex(traderIndex);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${traders[traderIndex].name}`,
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