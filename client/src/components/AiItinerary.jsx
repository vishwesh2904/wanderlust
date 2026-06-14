import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const INTEREST_OPTIONS = [
  { value: 'sightseeing', label: '🏛️ Sightseeing' },
  { value: 'adventure', label: '🏔️ Adventure' },
  { value: 'food', label: '🍽️ Food & Dining' },
  { value: 'relaxation', label: '🧘 Relaxation' },
  { value: 'culture', label: '🎭 Culture' },
];

const BUDGET_OPTIONS = [
  { value: 'budget', label: '💰 Budget' },
  { value: 'moderate', label: '💵 Moderate' },
  { value: 'luxury', label: '💎 Luxury' },
];

export default function AiItinerary({ destination }) {
  const [days, setDays] = useState(3);
  const [interest, setInterest] = useState('sightseeing');
  const [budget, setBudget] = useState('moderate');
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.tripPlanner.itinerary({
        destination: destination,
        days,
        interests: [interest],
        budget,
      });
      setItinerary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span>🤖</span> AI Trip Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="ai-days">Days</Label>
              <Input
                id="ai-days"
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 3)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ai-interest">Interest</Label>
              <Select value={interest} onValueChange={setInterest}>
                <SelectTrigger id="ai-interest">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTEREST_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ai-budget">Budget</Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger id="ai-budget">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="sm">
            {loading ? 'Generating...' : 'Generate Itinerary'}
          </Button>
        </form>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {itinerary && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{itinerary.summary}</p>
              <Badge variant="outline" className="capitalize">
                {itinerary.budget}
              </Badge>
            </div>
            <Separator />
            {itinerary.itinerary?.map((day) => (
              <div key={day.day} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Day {day.day}</h4>
                  <span className="text-xs text-muted-foreground">{day.date}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium text-amber-600">Morning:</span>{' '}
                    {day.activities.morning}
                  </p>
                  <p>
                    <span className="font-medium text-blue-600">Afternoon:</span>{' '}
                    {day.activities.afternoon}
                  </p>
                  <p>
                    <span className="font-medium text-purple-600">Evening:</span>{' '}
                    {day.activities.evening}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-0.5">Meals:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {day.mealSuggestions?.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-1">
                  {day.tips?.map((tip, i) => (
                    <span
                      key={i}
                      className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700"
                    >
                      💡 {tip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
