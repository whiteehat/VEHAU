'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/lib/auth-context';

interface Auction {
  id: string;
  title: string;
  description: string;
  startPrice: string;
  currentHighestBid: string;
  minimumIncrement: string;
  startTime: string;
  endTime: string;
  status: string;
  winnerId: string | null;
  winningBid: string | null;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    mileage: number;
    color: string;
    condition: string;
    images: string[];
  };
}

interface Bid {
  id: string;
  amount: string;
  createdAt: string;
  bidder: {
    firstName: string;
    lastName: string;
  };
}

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const auctionId = params.id as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomSize, setRoomSize] = useState(0);

  // Fetch initial auction data
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await api.get(`/auctions/${auctionId}`);
        setAuction(response.data);

        const bidsResponse = await api.get(`/auctions/${auctionId}/bids`);
        setBids(bidsResponse.data);
      } catch (error) {
        console.error('Failed to fetch auction', error);
        setError('Failed to load auction');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuction();
  }, [auctionId]);

  // Setup WebSocket connection
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
      socketInstance.emit('join_auction', { auctionId });
    });

    socketInstance.on('auction_state', (data) => {
      setAuction((prev) => ({
        ...prev!,
        currentHighestBid: data.auction.currentHighestBid?.toString() || '0',
      }));
      setBids(data.bids);
      setRoomSize(data.roomSize);
    });

    socketInstance.on('new_bid', (data) => {
      setBids((prev) => [
        {
          id: data.bidId,
          amount: data.amount,
          createdAt: data.timestamp,
          bidder: { firstName: 'Anonymous', lastName: 'Bidder' },
        },
        ...prev,
      ]);
      setAuction((prev) => ({
        ...prev!,
        currentHighestBid: data.amount,
      }));
    });

    socketInstance.on('auction_ended', (data) => {
      setAuction((prev) => ({
        ...prev!,
        status: 'ENDED',
        winnerId: data.winnerId,
        winningBid: data.winningBid,
      }));
      setSuccess('Auction has ended');
    });

    socketInstance.on('bid_error', (data) => {
      setError(data.message);
      setIsBidding(false);
    });

    socketInstance.on('error', (data) => {
      setError(data.message);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.emit('leave_auction', { auctionId });
        socketInstance.disconnect();
      }
    };
  }, [auctionId]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    setIsBidding(true);

    try {
      if (socket && user) {
        socket.emit('place_bid', {
          auctionId,
          bidderId: user.id,
          amount: Math.floor(parseFloat(bidAmount) * 100),
        });

        // Listen for success
        socket.once('bid_success', () => {
          setSuccess('Bid placed successfully!');
          setBidAmount('');
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsBidding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading auction...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Auction not found</p>
          <Link href="/auctions" className="text-blue-600 hover:text-blue-700 font-semibold">
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  const isAuctionActive = auction.status === 'SCHEDULED' && new Date(auction.endTime) > new Date();
  const timeRemaining = new Date(auction.endTime).getTime() - new Date().getTime();
  const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/auctions" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Auctions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{auction.title}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Vehicle Images & Details */}
          <div className="md:col-span-2">
            <div className="card">
              {/* Image Carousel */}
              <div className="w-full h-96 bg-gray-200 rounded mb-6 overflow-hidden">
                {auction.vehicle.images[0] && (
                  <img
                    src={auction.vehicle.images[0]}
                    alt={`${auction.vehicle.make} ${auction.vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {auction.vehicle.year} {auction.vehicle.make} {auction.vehicle.model}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Mileage</p>
                  <p className="text-lg font-semibold">{auction.vehicle.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Color</p>
                  <p className="text-lg font-semibold">{auction.vehicle.color}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Condition</p>
                  <p className="text-lg font-semibold">{auction.vehicle.condition}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="text-lg font-semibold">
                    <span className="inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {auction.status}
                    </span>
                  </p>
                </div>
              </div>

              {auction.description && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{auction.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bidding Panel */}
          <div>
            <div className="card bg-blue-50 border-blue-200 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Auction Details</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm">Starting Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{(parseInt(auction.startPrice) / 100).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Current Highest Bid</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₦{(parseInt(auction.currentHighestBid) / 100).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Min. Increment</p>
                  <p className="text-lg font-semibold">
                    ₦{(parseInt(auction.minimumIncrement) / 100).toLocaleString()}
                  </p>
                </div>

                <div className="border-t border-blue-200 pt-4">
                  {isAuctionActive ? (
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm font-semibold mb-4">
                      ⏱️ Auction ends in {hoursLeft}h {minutesLeft}m
                    </div>
                  ) : (
                    <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm font-semibold mb-4">
                      ❌ Auction Ended
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4 text-sm">
                      {success}
                    </div>
                  )}

                  {isAuctionActive && user ? (
                    <form onSubmit={handlePlaceBid}>
                      <input
                        type="number"
                        step="0.01"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="Enter bid amount"
                        className="input-field mb-3"
                        disabled={isBidding}
                      />
                      <button
                        type="submit"
                        disabled={isBidding}
                        className="w-full btn-primary disabled:opacity-50"
                      >
                        {isBidding ? 'Placing bid...' : 'Place Bid'}
                      </button>
                    </form>
                  ) : !user ? (
                    <Link
                      href="/auth/login"
                      className="w-full block text-center btn-primary"
                    >
                      Login to Bid
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Online Users */}
            <div className="card text-center">
              <p className="text-gray-500 text-sm">👥 Watching Live</p>
              <p className="text-2xl font-bold text-gray-900">{roomSize} users</p>
            </div>
          </div>
        </div>

        {/* Bidding History */}
        <div className="card mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Bidding History</h3>

          {bids.length === 0 ? (
            <p className="text-gray-600">No bids yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bids.map((bid) => (
                <div key={bid.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {bid.bidder.firstName} {bid.bidder.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(bid.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <p className="font-bold text-blue-600">
                    ₦{(parseInt(bid.amount) / 100).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
