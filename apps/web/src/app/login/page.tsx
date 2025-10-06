'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useLogin } from '@/api/auth';
import { Alert, AlertDescription } from '@/components/common/alert';
import { Button } from '@/components/common/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/common/card';
import { Input } from '@/components/common/input';
import { Label } from '@/components/common/label';
import { getErrorMessage } from '@/lib/error';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    loginMutation.mutate(
      { body: formData },
      {
        onSuccess: async (response) => {
          if (response.status === 200) {
            window.location.href = '/admin';
          } else {
            setErrorMessage(getErrorMessage(response.body, 'Invalid credentials'));
          }
        },
        onError: (error) => {
          setErrorMessage(getErrorMessage(error, 'An error occurred during login'));
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sfai.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loginMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loginMutation.isPending}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
