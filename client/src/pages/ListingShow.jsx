import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import MapboxMap from '@/components/MapboxMap';
import WorkcationBadge from '@/components/WorkcationBadge';
import SustainabilityBadge from '@/components/SustainabilityBadge';
import BudgetEstimator from '@/components/BudgetEstimator';
import TravelCompatibility from '@/components/TravelCompatibility';
import NeighborhoodInsights from '@/components/NeighborhoodInsights';
import ReviewSummary from '@/components/ReviewSummary';
import WishlistButton from '@/components/WishlistButton';
import CompareDrawer from '@/components/CompareDrawer';
import { toast } from 'sonner';

function ListingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="aspect-[16/9] rounded-lg" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-6 w-1/6" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div>
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function ListingShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.listings
      .getById(id)
      .then(setListing)
      .catch((err) => {
        toast.error(err.message);
        navigate('/listings');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave a review');
      return;
    }
    setSubmitting(true);
    try {
      await api.reviews.create(id, { review: { comment: reviewText, rating } });
      const populated = await api.listings.getById(id);
      setListing(populated);
      setReviewText('');
      setRating(0);
      toast.success('Review added');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.reviews.delete(id, reviewId);
      setListing((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r._id !== reviewId),
      }));
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <ListingSkeleton />;
  if (!listing) return null;

  const isOwner = user && listing.owner?._id === user.id;
  const locationStr = `${listing.location}, ${listing.country}`;

  return (
    <>
      <Helmet>
        <title>{listing.title} — RoamNest</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[16/9] overflow-hidden rounded-lg bg-muted">
              {listing.image?.url ? (
                <img
                  src={listing.image.url}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{listing.title}</h1>
                  <p className="mt-1 text-lg text-muted-foreground">{listing.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <WishlistButton listingId={id} />
                  {listing.category && <Badge>{listing.category}</Badge>}
                </div>
              </div>
              <p className="mt-4 text-2xl font-semibold">
                ${listing.price?.toLocaleString()}
                <span className="text-base font-normal text-muted-foreground"> / night</span>
              </p>
              <Separator className="my-4" />
              <p className="text-muted-foreground">{listing.description}</p>
              {listing.amenities?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {listing.amenities.map((a) => (
                    <Badge key={a} variant="secondary" className="text-xs">
                      {a}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                Hosted by {listing.owner?.username}
              </p>
            </div>

            {isOwner && (
              <div className="flex gap-3">
                <Button onClick={() => navigate(`/listings/${id}/edit`)}>Edit</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await api.listings.delete(id);
                      toast.success('Listing deleted');
                      navigate('/listings');
                    } catch (err) {
                      toast.error(err.message);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <WorkcationBadge scores={listing.workcationScore} />
              <SustainabilityBadge scores={listing.sustainabilityScore} />
              <CompareDrawer
                trigger={
                  <Button variant="outline" size="sm">
                    Compare
                  </Button>
                }
              />
            </div>

            <Button onClick={() => navigate(`/listings/${id}/dashboard`)} className="w-full">
              Open Travel Intelligence Dashboard
            </Button>

            <div>
              <h2 className="mb-3 text-xl font-semibold">Location</h2>
              <MapboxMap coordinates={listing.geometry?.coordinates} />
            </div>
          </div>

          <div className="space-y-6">
            <TravelCompatibility listingTags={listing.compatibilityTags} />

            <BudgetEstimator listingPrice={listing.price} location={locationStr} />

            <NeighborhoodInsights listingId={id} />

            <ReviewSummary listingId={id} />

            <Card>
              <CardHeader>
                <CardTitle>Reviews ({listing.reviews?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {listing.reviews?.length > 0 ? (
                  listing.reviews.map((review) => (
                    <div key={review._id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {review.author?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{review.author?.username}</span>
                        <span className="text-xs text-amber-500">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                        {user && review.author?._id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-auto p-0 text-xs text-red-500"
                            onClick={() => handleDeleteReview(review._id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No reviews yet</p>
                )}

                {user ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3 pt-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`text-xl transition-colors ${
                            star <= (hoveredRating || rating)
                              ? 'text-amber-500'
                              : 'text-muted-foreground'
                          }`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                        >
                          {star <= (hoveredRating || rating) ? '★' : '☆'}
                        </button>
                      ))}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {rating > 0 ? `${rating}/5` : 'Select rating'}
                      </span>
                    </div>
                    <Textarea
                      placeholder="Write a review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                    />
                    <Button type="submit" disabled={submitting || !rating} className="w-full">
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </form>
                ) : (
                  <p className="pt-4 text-sm text-muted-foreground">
                    <button
                      onClick={() => navigate('/login')}
                      className="text-rose-500 hover:underline"
                    >
                      Log in
                    </button>{' '}
                    to leave a review
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
