import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

function calcWorkcationScore(score) {
  if (!score) return 0;
  let total = 0;
  total += Math.min((score.internetSpeed || 0) / 100, 1) * 30;
  total += score.workspaceAvailable ? 20 : 0;
  const noiseMap = { Low: 20, Moderate: 10, High: 0 };
  total += noiseMap[score.noiseLevel] || 10;
  total += Math.min((score.nearbyCafes || 0) / 10, 1) * 15;
  total += score.powerBackup ? 15 : 0;
  return Math.round(total);
}

function calcSustainScore(score) {
  if (!score) return 0;
  return Math.round(
    ([
      score.solarEnergy,
      score.waterConservation,
      score.wasteManagement,
      score.greenCertified,
    ].filter(Boolean).length /
      4) *
      100,
  );
}

export default function CompareDrawer({ trigger }) {
  const [listingIds, setListingIds] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const addedTitles = useRef({});

  useEffect(() => {
    if (!open) return;
    const stored = sessionStorage.getItem('compareIds');
    if (stored) {
      try {
        setListingIds(JSON.parse(stored));
      } catch {}
    }
  }, [open]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api.listings.getAll({ search: searchQuery, limit: 8 });
        setSearchResults(data.listings || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addId = (id) => {
    if (!id) return;
    if (listingIds.includes(id)) {
      toast.error('Already added');
      return;
    }
    if (listingIds.length >= 4) {
      toast.error('Compare up to 4 properties');
      return;
    }
    const newIds = [...listingIds, id];
    setListingIds(newIds);
    setInputValue('');
    setSearchQuery('');
    setSearchResults([]);
    sessionStorage.setItem('compareIds', JSON.stringify(newIds));
  };

  const removeId = (id) => {
    const newIds = listingIds.filter((i) => i !== id);
    setListingIds(newIds);
    sessionStorage.setItem('compareIds', JSON.stringify(newIds));
  };

  const fetchListings = async () => {
    if (listingIds.length < 2) {
      toast.error('Add at least 2 listing IDs');
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(listingIds.map((id) => api.listings.getById(id)));
      results.forEach((l) => { addedTitles.current[l._id] = l.title; });
      setListings(results);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Compare Properties
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Compare Properties</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Input
              placeholder="Search listings by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.trim() && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border bg-card shadow-lg">
                {searching ? (
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="divide-y">
                    {searchResults.map((item) => (
                      <li key={item._id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                          onClick={() => {
                            addedTitles.current[item._id] = item.title;
                            addId(item._id);
                          }}
                        >
                          <Avatar className="h-10 w-10 rounded-md">
                            <AvatarImage src={item.image?.url} />
                            <AvatarFallback className="rounded-md text-xs">
                              {item.title?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{item.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.location} — ${item.price}/night
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-3 text-center text-sm text-muted-foreground">
                    No listings found
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or paste an ID</span>
            <Separator className="flex-1" />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Paste listing ID..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addId(inputValue.trim())}
            />
            <Button onClick={() => addId(inputValue.trim())} variant="secondary" size="sm">
              Add
            </Button>
          </div>

          {listingIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listingIds.map((id) => (
                <Badge key={id} variant="secondary" className="gap-1">
                  {addedTitles.current[id] || `${id.slice(0, 8)}...`}
                  <button onClick={() => removeId(id)} className="ml-1 text-sm hover:text-red-500">
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Button
            onClick={fetchListings}
            disabled={loading || listingIds.length < 2}
            className="w-full"
          >
            {loading ? 'Loading...' : `Compare ${listingIds.length} Properties`}
          </Button>

          {loading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {listings.length >= 2 && !loading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left text-muted-foreground font-medium">Feature</th>
                    {listings.map((l) => (
                      <th key={l._id} className="p-2 text-left font-medium">
                        {l.title.slice(0, 20)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-2 text-muted-foreground">Price</td>
                    {listings.map((l) => (
                      <td key={l._id} className="p-2 font-semibold">
                        ${l.price}/night
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 text-muted-foreground">Location</td>
                    {listings.map((l) => (
                      <td key={l._id} className="p-2">
                        {l.location}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 text-muted-foreground">Category</td>
                    {listings.map((l) => (
                      <td key={l._id} className="p-2">
                        <Badge variant="outline">{l.category}</Badge>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 text-muted-foreground">Workcation</td>
                    {listings.map((l) => (
                      <td key={l._id} className="p-2">
                        {calcWorkcationScore(l.workcationScore)}/100
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 text-muted-foreground">Eco Score</td>
                    {listings.map((l) => (
                      <td key={l._id} className="p-2">
                        {calcSustainScore(l.sustainabilityScore)}/100
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 text-muted-foreground">Tags</td>
                    {listings.map((l) => (
                      <td key={l._id} className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {l.compatibilityTags?.map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 text-muted-foreground">Amenities</td>
                    {listings.map((l) => (
                      <td key={l._id} className="p-2">
                        <ul className="list-disc pl-4 text-xs space-y-0.5">
                          {l.amenities?.slice(0, 4).map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                          {(l.amenities?.length || 0) > 4 && (
                            <li className="text-muted-foreground">
                              +{l.amenities.length - 4} more
                            </li>
                          )}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <Separator />
          <p className="text-xs text-muted-foreground">
            Search for properties above or paste a listing ID from the URL bar
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
