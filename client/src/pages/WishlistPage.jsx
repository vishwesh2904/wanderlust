import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function WishlistSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-64 rounded-lg" />
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    setLoading(true);
    api.wishlist
      .getAll()
      .then(setItems)
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (listingId) => {
    try {
      await api.wishlist.remove(listingId);
      setItems((prev) => prev.filter((item) => item.listing?._id !== listingId));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Wishlist — RoamNest</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">My Wishlist</h1>

        {loading && <WishlistSkeleton />}

        {!loading && items.length === 0 && (
          <div className="py-16 text-center">
            <p className="mb-4 text-lg text-muted-foreground">Your wishlist is empty</p>
            <Button asChild>
              <Link to="/listings">Browse Listings</Link>
            </Button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const listing = item.listing;
              if (!listing) return null;
              return (
                <Card key={item._id} className="overflow-hidden group">
                  <Link to={`/listings/${listing._id}`}>
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {listing.image?.url ? (
                        <img
                          src={listing.image.url}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
                          className="font-semibold hover:text-rose-500 transition-colors"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">{listing.location}</p>
                      </div>
                      <Badge variant="outline">${listing.price}/night</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleRemove(listing._id)}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
