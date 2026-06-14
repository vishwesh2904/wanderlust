import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function BudgetEstimator({ listingPrice, location }) {
  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState(2);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEstimate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.tripPlanner.estimate({
        destination: location,
        days,
        travelers,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Budget Estimator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEstimate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="travelers">Travelers</Label>
              <Input
                id="travelers"
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="sm">
            {loading ? 'Calculating...' : 'Estimate Cost'}
          </Button>
        </form>

        {loading && (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        {result && !loading && (
          <div className="mt-4 space-y-2">
            <Separator />
            <div className="space-y-1 text-sm">
              {Object.values(result.breakdown).map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total Estimate</span>
              <span className="text-rose-500">${result.total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {result.days} day{result.days > 1 ? 's' : ''} for {result.travelers} traveler
              {result.travelers > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
