import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ALL_TAGS = [
  { id: 'Adventure', icon: '🏔️', label: 'Adventure' },
  { id: 'Family', icon: '👨‍👩‍👧‍👦', label: 'Family' },
  { id: 'Luxury', icon: '💎', label: 'Luxury' },
  { id: 'Workcation', icon: '💼', label: 'Workcation' },
  { id: 'Budget', icon: '💰', label: 'Budget' },
  { id: 'Relaxation', icon: '🧘', label: 'Relaxation' },
  { id: 'Culture', icon: '🎭', label: 'Culture' },
];

export default function TravelCompatibility({ listingTags = [] }) {
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  const matchScore =
    selectedTags.length > 0
      ? Math.round(
          (selectedTags.filter((t) => listingTags.includes(t)).length / selectedTags.length) * 100,
        )
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Travel Compatibility</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-xs text-muted-foreground">
          Select your travel style to see compatibility:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                selectedTags.includes(tag.id)
                  ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              <span>{tag.icon}</span>
              {tag.label}
            </button>
          ))}
        </div>

        {matchScore !== null && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Match:</span>
            <Badge
              variant={matchScore >= 66 ? 'default' : matchScore >= 33 ? 'secondary' : 'outline'}
              className={cn(
                matchScore >= 66 && 'bg-green-500',
                matchScore >= 33 && matchScore < 66 && 'bg-amber-500',
                matchScore < 33 && 'text-muted-foreground',
              )}
            >
              {matchScore}%
            </Badge>
            {matchScore >= 66 && (
              <span className="text-xs text-green-600">Great fit for your style!</span>
            )}
          </div>
        )}

        {listingTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="mr-1 text-xs text-muted-foreground">Property style:</span>
            {listingTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
