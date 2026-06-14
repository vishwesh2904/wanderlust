import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReviewSummary({ listingId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    api.reviews
      .summary(listingId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Review Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalReviews === 0) return null;

  const sentimentColors = {
    positive: 'bg-green-100 text-green-700 border-green-200',
    negative: 'bg-red-100 text-red-700 border-red-200',
    neutral: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">AI Review Summary</CardTitle>
        <Badge variant="outline" className={sentimentColors[data.sentiment] || ''}>
          {data.sentiment}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{data.summary}</p>

        {data.pros?.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold text-green-600 uppercase">What Guests Loved</p>
            <div className="flex flex-wrap gap-1">
              {data.pros.map((pro) => (
                <Badge key={pro} variant="secondary" className="bg-green-50 text-green-700 text-xs">
                  {pro}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.cons?.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold text-red-600 uppercase">Common Concerns</p>
            <div className="flex flex-wrap gap-1">
              {data.cons.map((con) => (
                <Badge key={con} variant="secondary" className="bg-red-50 text-red-700 text-xs">
                  {con}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Based on {data.totalReviews} review{data.totalReviews !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  );
}
