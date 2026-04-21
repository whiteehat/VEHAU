'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isBuyer = user?.roles?.includes('BUYER');
  const isSeller = user?.roles?.includes('SELLER');
  const isVendor = user?.roles?.includes('VENDOR');
  const isInspector = user?.roles?.includes('INSPECTOR');
  const isAdmin = user?.roles?.includes('ADMIN');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            🚗 VehAuction Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="section-title">Welcome, {user?.firstName}!</h2>

        {/* Role-based Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isBuyer && (
            <>
              <Link href="/auctions" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🔍 Browse Auctions</h3>
                <p className="text-gray-600">View available vehicle auctions</p>
              </Link>

              <Link href="/parts" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🛠️ Parts Marketplace</h3>
                <p className="text-gray-600">Shop for auto parts</p>
              </Link>

              <Link href="/dashboard/wallet" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">💰 My Wallet</h3>
                <p className="text-gray-600">Manage your balance</p>
              </Link>

              <Link href="/dashboard/orders" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📦 My Orders</h3>
                <p className="text-gray-600">View order history</p>
              </Link>
            </>
          )}

          {isSeller && (
            <>
              <Link href="/dashboard/vehicles" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🚗 My Vehicles</h3>
                <p className="text-gray-600">Manage vehicle listings</p>
              </Link>

              <Link href="/dashboard/vehicles/new" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">➕ Add Vehicle</h3>
                <p className="text-gray-600">List new vehicle for auction</p>
              </Link>
            </>
          )}

          {isVendor && (
            <>
              <Link href="/dashboard/shop" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🏪 My Shop</h3>
                <p className="text-gray-600">Manage your parts shop</p>
              </Link>

              <Link href="/dashboard/shop/add-part" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">➕ Add Part</h3>
                <p className="text-gray-600">List new auto part</p>
              </Link>

              <Link href="/dashboard/orders/vendor" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📦 Orders</h3>
                <p className="text-gray-600">View customer orders</p>
              </Link>
            </>
          )}

          {isInspector && (
            <Link href="/dashboard/inspections" className="card hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🔍 Inspection Queue</h3>
              <p className="text-gray-600">View vehicles to inspect</p>
            </Link>
          )}

          {isAdmin && (
            <>
              <Link href="/dashboard/admin/users" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">👥 Manage Users</h3>
                <p className="text-gray-600">Approve/reject users</p>
              </Link>

              <Link href="/dashboard/admin/auctions" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">🏆 Manage Auctions</h3>
                <p className="text-gray-600">Monitor auctions</p>
              </Link>

              <Link href="/dashboard/admin/analytics" className="card hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-gray-900 mb-2">📊 Analytics</h3>
                <p className="text-gray-600">View platform analytics</p>
              </Link>
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Getting Started</h3>
          <p className="text-blue-800">
            Explore the dashboard to manage your account. Visit our{' '}
            <Link href="/" className="underline font-semibold">
              home page
            </Link>
            {' '}for more information about VehAuction.
          </p>
        </div>
      </main>
    </div>
  );
}
