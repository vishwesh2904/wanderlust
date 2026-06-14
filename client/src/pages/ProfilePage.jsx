import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, upgradeToHost } = useAuth();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  if (!user) return null;

  const isHost = user.role === 'host';

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await upgradeToHost();
      toast.success('Congratulations! You are now a Host.');
    } catch (err) {
      toast.error(err.message || 'Failed to upgrade');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile — RoamNest</title>
      </Helmet>
      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-rose-100 text-rose-600 text-xl">
                {user.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.username}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <Badge
                className={
                  isHost ? 'bg-amber-100 text-amber-700 mt-1' : 'bg-blue-100 text-blue-700 mt-1'
                }
                variant="outline"
              >
                {isHost ? '🏠 Host' : '👤 Guest'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {isHost ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">🏠 Host Dashboard</CardTitle>
              <CardDescription>
                You have full Host access. Manage your properties and bookings.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => navigate('/host/dashboard')}>Host Dashboard</Button>
              <Button variant="secondary" onClick={() => navigate('/my-listings')}>
                My Listings
              </Button>
              <Button variant="outline" onClick={() => navigate('/listings/new')}>
                Add Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">🏡 Become a Host</CardTitle>
              <CardDescription>
                List your property on RoamNest and start earning. Hosts can create listings, manage
                bookings, and access analytics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> List your property
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Manage bookings
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Host Dashboard
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Analytics & insights
                </div>
              </div>
              <Separator />
              <Button onClick={handleUpgrade} disabled={upgrading} className="w-full" size="lg">
                {upgrading ? 'Upgrading...' : 'Become a Host'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You can continue browsing as a Guest after upgrading.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username</span>
              <span>{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
