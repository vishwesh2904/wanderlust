import { Helmet } from 'react-helmet-async';
import CompareDrawer from '@/components/CompareDrawer';

export default function ComparePage() {
  return (
    <>
      <Helmet>
        <title>Compare Properties — RoamNest</title>
      </Helmet>
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-2 text-3xl font-bold">Property Comparison</h1>
        <p className="mb-8 text-muted-foreground">
          Compare up to 4 properties side by side to find your perfect stay.
        </p>
        <div className="mx-auto max-w-md space-y-4">
          <CompareDrawer
            trigger={
              <button className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-8 py-3 text-white font-medium hover:bg-rose-600 transition-colors">
                Open Comparison Tool
              </button>
            }
          />
          <div className="rounded-lg border bg-muted/30 p-6 text-left text-sm text-muted-foreground">
            <h3 className="mb-2 font-semibold text-foreground">How to compare:</h3>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Open a listing you're interested in</li>
              <li>Copy its ID from the URL bar</li>
              <li>Add it here using the input above</li>
              <li>Add at least 2 properties to see a comparison</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
