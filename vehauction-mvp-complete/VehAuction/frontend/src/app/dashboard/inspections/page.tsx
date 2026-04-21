'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  location: string;
  seller: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export default function InspectionQueuePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await api.get('/inspections/queue');
        setVehicles(response.data);
      } catch (error) {
        console.error('Failed to fetch inspection queue', error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    if (isAuthenticated) {
      fetchQueue();
    }
  }, [isAuthenticated]);

  if (isLoading || isLoadingVehicles) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">🔍 Inspection Queue</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {vehicles.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No vehicles pending inspection</p>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/dashboard/inspections/${vehicle.id}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-sm">
                    Pending Inspection
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Vehicle Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Mileage:</span>
                        <span className="font-semibold text-gray-900">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Condition:</span>
                        <span className="font-semibold text-gray-900">{vehicle.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Location:</span>
                        <span className="font-semibold text-gray-900">{vehicle.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Seller Contact</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-semibold text-gray-900">
                          {vehicle.seller.firstName} {vehicle.seller.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-semibold text-gray-900">{vehicle.seller.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="flex-1 btn-primary text-sm">
                    Start Inspection
                  </button>
                  <button className="flex-1 btn-secondary text-sm">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
