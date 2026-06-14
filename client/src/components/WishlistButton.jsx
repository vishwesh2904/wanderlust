import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function WishlistButton({ listingId }) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !listingId) return;
    api.wishlist
      .check(listingId)
      .then((data) => setWishlisted(data.wishlisted))
      .catch(() => {});
  }, [user, listingId]);

  const handleToggle = async () => {
    if (!user) {
      toast.error('Please log in to save listings');
      return;
    }
    setLoading(true);
    try {
      if (wishlisted) {
        await api.wishlist.remove(listingId);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.wishlist.add(listingId);
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={wishlisted ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}
      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={wishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </Button>
  );
}
