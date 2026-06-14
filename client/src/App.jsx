import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ListingsIndex from '@/pages/ListingsIndex';
import ListingShow from '@/pages/ListingShow';
import CreateListing from '@/pages/CreateListing';
import EditListing from '@/pages/EditListing';
import Dashboard from '@/pages/Dashboard';
import ComparePage from '@/pages/ComparePage';
import WishlistPage from '@/pages/WishlistPage';
import ProfilePage from '@/pages/ProfilePage';
import HostDashboard from '@/pages/HostDashboard';
import MyListings from '@/pages/MyListings';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/listings" element={<ListingsIndex />} />
              <Route
                path="/listings/new"
                element={
                  <ProtectedRoute requiredRole="host">
                    <CreateListing />
                  </ProtectedRoute>
                }
              />
              <Route path="/listings/:id" element={<ListingShow />} />
              <Route path="/listings/:id/dashboard" element={<Dashboard />} />
              <Route
                path="/listings/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditListing />
                  </ProtectedRoute>
                }
              />
              <Route path="/compare" element={<ComparePage />} />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/host/dashboard"
                element={
                  <ProtectedRoute requiredRole="host">
                    <HostDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-listings"
                element={
                  <ProtectedRoute requiredRole="host">
                    <MyListings />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </main>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
