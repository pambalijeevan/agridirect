import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Sprout, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'farmer') navigate('/farmer');
      else if (user.role === 'buyer') navigate('/buyer');
      else if (user.role === 'admin') navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful!');
      // Navigation will happen via useEffect
    } else {
      toast.error(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AgriDirect</h1>
          <p className="text-gray-600 mt-2">Direct Farmer-to-Company Trading Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <p className="font-medium text-green-900">Farmer</p>
                  <p className="text-green-700">farmer@agridirect.com / farmer123</p>
                </div>
                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="font-medium text-blue-900">Buyer</p>
                  <p className="text-blue-700">buyer@agridirect.com / buyer123</p>
                </div>
                <div className="p-2 bg-purple-50 rounded border border-purple-200">
                  <p className="font-medium text-purple-900">Admin</p>
                  <p className="text-purple-700">admin@agridirect.com / admin123</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="text-green-600 hover:underline font-medium">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
