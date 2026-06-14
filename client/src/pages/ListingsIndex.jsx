import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PaginationContainer,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

const CATEGORIES = [
  '',
  'Trending',
  'Rooms',
  'Iconic cities',
  'Mountains',
  'Castles',
  'Pools',
  'Camping',
  'Farms',
  'Arctic',
  'Domes',
  'Boats',
];

function ListingsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function PaginationBar({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const items = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(pages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  if (start > 1) {
    items.push(
      <PaginationItem key={1}>
        <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
      </PaginationItem>,
    );
    if (start > 2)
      items.push(
        <PaginationItem key="s1">
          <PaginationEllipsis />
        </PaginationItem>,
      );
  }

  for (let i = start; i <= end; i++) {
    items.push(
      <PaginationItem key={i}>
        <PaginationLink isActive={i === page} onClick={() => onPageChange(i)}>
          {i}
        </PaginationLink>
      </PaginationItem>,
    );
  }

  if (end < pages) {
    if (end < pages - 1)
      items.push(
        <PaginationItem key="s2">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    items.push(
      <PaginationItem key={pages}>
        <PaginationLink onClick={() => onPageChange(pages)}>{pages}</PaginationLink>
      </PaginationItem>,
    );
  }

  return (
    <PaginationContainer className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => onPageChange(page - 1)} disabled={page <= 1} />
        </PaginationItem>
        {items}
        <PaginationItem>
          <PaginationNext onClick={() => onPageChange(page + 1)} disabled={page >= pages} />
        </PaginationItem>
      </PaginationContent>
    </PaginationContainer>
  );
}

export default function ListingsIndex() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ listings: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const page = parseInt(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const country = searchParams.get('country') || '';

  const [searchInput, setSearchInput] = useState(search);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12 };
      if (category) params.category = category;
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (country) params.country = country;
      const result = await api.listings.getAll(params);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, category, search, minPrice, maxPrice, country]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v == null) next.delete(k);
      else next.set(k, v);
    });
    if (updates.page === undefined && !updates.hasOwnProperty('page')) next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput, page: '1' });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const onPageChange = (p) => {
    if (p >= 1 && p <= data.pages) updateParams({ page: String(p) });
  };

  return (
    <>
      <Helmet>
        <title>Listings — RoamNest</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Listings</h1>

        <div className="mb-8 space-y-4 rounded-lg border bg-card p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <Input
              placeholder="Search listings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap gap-3">
            <select
              value={category}
              onChange={(e) => updateParams({ category: e.target.value, page: '1' })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All categories</option>
              {CATEGORIES.filter(Boolean).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <Input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => updateParams({ minPrice: e.target.value, page: '1' })}
              className="max-w-[120px]"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => updateParams({ maxPrice: e.target.value, page: '1' })}
              className="max-w-[120px]"
            />
            <Input
              placeholder="Country"
              value={country}
              onChange={(e) => updateParams({ country: e.target.value, page: '1' })}
              className="max-w-[160px]"
            />

            {(category || search || minPrice || maxPrice || country) && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <ListingsSkeleton />
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : data.listings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No listings found.
            {(category || search || minPrice || maxPrice || country) && (
              <Button variant="link" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {data.total} listing{data.total !== 1 ? 's' : ''} found
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.listings.map((listing) => (
                <Card key={listing._id} className="overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {listing.image?.url ? (
                      <img
                        src={listing.image.url}
                        alt={listing.title}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      {listing.category && <Badge variant="secondary">{listing.category}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {listing.description}
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      ${listing.price && listing.price.toLocaleString()}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/listings/${listing._id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <PaginationBar page={data.page} pages={data.pages} onPageChange={onPageChange} />
          </>
        )}
      </div>
    </>
  );
}
