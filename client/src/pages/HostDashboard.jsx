import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function HostDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.listings
      .getAll({ owner: user.id, limit: 5 })
      .then((data) => setListings(data.listings || []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <>
      <Helmet>
        <title>Host Dashboard — RoamNest</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Host Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.username}</p>
          </div>
          <Badge className="bg-amber-100 text-amber-700">HOST</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : listings.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  listings.reduce((sum, l) => sum + (l.reviews?.length || 0), 0)
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold capitalize">{user?.role}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/listings/new')}>New Listing</Button>
          <Button variant="secondary" onClick={() => navigate('/my-listings')}>
            My Listings
          </Button>
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Profile
          </Button>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Recent Listings</h2>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="mb-4 text-muted-foreground">You haven't created any listings yet.</p>
                <Button onClick={() => navigate('/listings/new')}>Create Your First Listing</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <Card key={listing._id} className="overflow-hidden">
                  <Link to={`/listings/${listing._id}`}>
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      {listing.image?.url ? (
                        <img
                          src={listing.image.url}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/listings/${listing._id}`}
                          className="font-semibold hover:text-rose-500"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                      </div>
                      <Badge variant="outline">${listing.price}/night</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
