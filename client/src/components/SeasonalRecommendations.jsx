import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function SeasonalRecommendations({ location }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    api.seasonal
      .get(location)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [location]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seasonal Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Seasonal Insights</CardTitle>
        <Badge className="bg-rose-100 text-rose-700">{data.bestTime}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">{data.recommendation}</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border p-2 text-center">
            <p className="text-xs text-muted-foreground">Crowd Level</p>
            <p className="text-sm font-medium">{data.crowdLevel}</p>
          </div>
          <div className="rounded-lg border p-2 text-center">
            <p className="text-xs text-muted-foreground">Cost Factor</p>
            <p className="text-sm font-medium">{data.costFactor}</p>
          </div>
        </div>

        {data.weatherTrends?.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
              Weather Trends
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {data.weatherTrends.map((w) => (
                <div key={w.month} className="rounded-lg border bg-muted/30 p-2 text-center">
                  <p className="text-xs font-medium">{w.month}</p>
                  <p className="text-sm">{w.temp}</p>
                  <p className="text-xs text-muted-foreground">{w.rainfall}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.festivals?.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
              Local Festivals & Events
            </h4>
            <div className="space-y-2">
              {data.festivals.map((f, i) => (
                <div key={i} className="rounded-lg border p-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{f.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {f.month}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
