'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 bg-opacity-90">
        <h1 className="text-3xl font-bold text-white">🚗 VehAuction</h1>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-white hover:text-blue-100">
                Dashboard
              </Link>
              <span className="text-white">{user?.firstName}</span>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-white hover:text-blue-100 font-semibold"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h2 className="text-5xl font-bold text-white mb-6">
          Verify Before You Bid
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Nigeria's most trusted vehicle auction platform with verified inspection reports.
          Buy with confidence. Sell with integrity.
        </p>
        <div className="flex gap-4 justify-center">
          {!isAuthenticated && (
            <>
              <Link
                href="/auctions"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50"
              >
                Browse Auctions
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-6 p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-3">🔍 Verified Vehicles</h3>
          <p className="text-gray-600">Every vehicle goes through professional inspection with detailed reports.</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-3">⚡ Real-time Bidding</h3>
          <p className="text-gray-600">Live auction updates with real-time bid updates and WebSocket support.</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-3">🛠️ Auto Parts Market</h3>
          <p className="text-gray-600">Browse thousands of OEM and aftermarket parts for your vehicle.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-blue-700 mt-12">
        <p className="text-blue-100">© 2024 VehAuction. All rights reserved. Verify Before You Bid.</p>
      </footer>
    </div>
  );
}
