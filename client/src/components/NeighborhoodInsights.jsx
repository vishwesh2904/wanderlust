import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

function ScoreBar({ label, value }) {
  const color =
    value >= 80
      ? 'bg-green-500'
      : value >= 60
        ? 'bg-blue-500'
        : value >= 40
          ? 'bg-amber-500'
          : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-medium">{value}</span>
    </div>
  );
}

export default function NeighborhoodInsights({ listingId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    api.insights
      .get(listingId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Neighborhood Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Neighborhood Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <ScoreBar label="Safety Score" value={data.safetyScore} />
          <ScoreBar label="Transit Score" value={data.transitScore} />
        </div>

        {data.restaurants?.length > 0 && (
          <div>
            <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
              Nearby Restaurants
            </h4>
            <div className="space-y-1">
              {data.restaurants.slice(0, 3).map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{r.name}</span>
                  <span className="text-muted-foreground">
                    {r.type} · {'★'.repeat(Math.round(r.rating))} · {r.priceRange}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.attractions?.length > 0 && (
          <div>
            <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
              Nearby Attractions
            </h4>
            <div className="space-y-2">
              {data.attractions.slice(0, 3).map((a, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{a.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {a.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
