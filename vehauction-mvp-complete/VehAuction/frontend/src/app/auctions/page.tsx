'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Auction {
  id: string;
  title: string;
  startPrice: string;
  currentHighestBid: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    condition: string;
    images: string[];
  };
  endTime: string;
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await api.get('/auctions');
        setAuctions(response.data);
      } catch (error) {
        console.error('Failed to fetch auctions', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Live Auctions</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <p className="text-gray-600">Loading auctions...</p>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No active auctions at the moment</p>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
              Return to Home
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <Link
                key={auction.id}
                href={`/auctions/${auction.id}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="mb-4 bg-gray-200 h-48 rounded overflow-hidden">
                  {auction.vehicle.images[0] && (
                    <img
                      src={auction.vehicle.images[0]}
                      alt={`${auction.vehicle.make} ${auction.vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {auction.vehicle.year} {auction.vehicle.make} {auction.vehicle.model}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Condition: {auction.vehicle.condition}
                </p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Starting at</p>
                    <p className="font-bold text-gray-900">₦{parseInt(auction.startPrice).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Bid</p>
                    <p className="font-bold text-blue-600">₦{parseInt(auction.currentHighestBid).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
