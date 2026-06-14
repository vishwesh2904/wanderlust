import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import WorkcationBadge from '@/components/WorkcationBadge';
import SustainabilityBadge from '@/components/SustainabilityBadge';
import BudgetEstimator from '@/components/BudgetEstimator';
import NeighborhoodInsights from '@/components/NeighborhoodInsights';
import AiItinerary from '@/components/AiItinerary';
import SeasonalRecommendations from '@/components/SeasonalRecommendations';

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-6 w-1/4" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listings
      .getById(id)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardSkeleton />;
  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Listing not found</h2>
        <Button asChild className="mt-4">
          <Link to="/listings">Browse Listings</Link>
        </Button>
      </div>
    );
  }

  const locationStr = `${listing.location}, ${listing.country}`;

  return (
    <>
      <Helmet>
        <title>Travel Intelligence — {listing.title} | RoamNest</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold md:text-3xl">{listing.title}</h1>
              <Badge className="bg-rose-100 text-rose-700">Travel Intelligence</Badge>
            </div>
            <p className="text-muted-foreground">{locationStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <WorkcationBadge scores={listing.workcationScore} />
            <SustainabilityBadge scores={listing.sustainabilityScore} />
            <div className="text-right">
              <p className="text-2xl font-bold">${listing.price?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">per night</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AiItinerary destination={locationStr} />
          </div>
          <div className="space-y-6">
            <BudgetEstimator listingPrice={listing.price} location={locationStr} />
            <NeighborhoodInsights listingId={id} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SeasonalRecommendations location={locationStr} />
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-lg font-semibold">Quick Facts</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{listing.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Host</p>
                <p className="font-medium">{listing.owner?.username}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amenities</p>
                <p className="font-medium">{listing.amenities?.length || 0} features</p>
              </div>
              <div>
                <p className="text-muted-foreground">Country</p>
                <p className="font-medium">{listing.country}</p>
              </div>
            </div>
            {listing.amenities?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {listing.amenities.map((a) => (
                  <Badge key={a} variant="secondary" className="text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
