import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = () => {
    if (!user) return;
    setLoading(true);
    api.listings
      .getAll({ owner: user.id })
      .then((data) => setListings(data.listings || []))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await api.listings.delete(id);
      setListings((prev) => prev.filter((l) => l._id !== id));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Listings — RoamNest</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Button onClick={() => navigate('/listings/new')}>New Listing</Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="mb-4 text-lg text-muted-foreground">
                You haven't created any listings yet.
              </p>
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
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/listings/${listing._id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(listing._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
