import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Trip Planner',
    desc: 'Describe your perfect trip and get personalized itineraries.',
  },
  {
    icon: '💼',
    title: 'Workcation Scores',
    desc: 'Find properties with fast WiFi, workspaces, and quiet environments.',
  },
  {
    icon: '🌿',
    title: 'Sustainability Ratings',
    desc: 'Choose eco-friendly stays with green certifications.',
  },
  { icon: '💰', title: 'Budget Predictor', desc: 'Estimate total trip costs before you book.' },
  { icon: '🎯', title: 'Travel Compatibility', desc: 'Match properties to your travel style.' },
  {
    icon: '📊',
    title: 'Smart Comparison',
    desc: 'Compare properties side by side with key metrics.',
  },
];

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>RoamNest — Find a stay worth remembering</title>
      </Helmet>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          Welcome to <span className="text-rose-500">RoamNest</span>
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">Find a stay worth remembering</p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link to="/listings">Browse Listings</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="mb-8 rounded-lg border bg-gradient-to-r from-rose-50 to-blue-50 p-6 text-center">
          <h2 className="mb-2 text-2xl font-bold">Plan Your Perfect Trip</h2>
          <p className="mb-4 text-muted-foreground">
            Use our Travel Intelligence tools to find the perfect stay, estimate costs, and build
            itineraries.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="default">
              <Link to="/listings">Search Properties</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/compare">Compare Properties</Link>
            </Button>
          </div>
        </div>

        <h2 className="mb-6 text-center text-2xl font-bold">Why RoamNest?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6 text-center">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
