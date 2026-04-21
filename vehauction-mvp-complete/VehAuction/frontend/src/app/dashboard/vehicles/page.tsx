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
  status: string;
  condition: string;
  mileage: number;
  createdAt: string;
}

export default function SellerDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get('/vehicles');
        setVehicles(response.data);
      } catch (error) {
        console.error('Failed to fetch vehicles', error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    if (isAuthenticated) {
      fetchVehicles();
    }
  }, [isAuthenticated]);

  if (isLoading || isLoadingVehicles) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING_INSPECTION':
        return 'bg-yellow-100 text-yellow-800';
      case 'INSPECTION_APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'READY_FOR_AUCTION':
        return 'bg-green-100 text-green-800';
      case 'AUCTION_ACTIVE':
        return 'bg-purple-100 text-purple-800';
      case 'SOLD':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
          </div>
          <Link
            href="/dashboard/vehicles/new"
            className="btn-primary"
          >
            ➕ Add Vehicle
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {vehicles.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">You haven't listed any vehicles yet</p>
            <Link
              href="/dashboard/vehicles/new"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              List Your First Vehicle
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/dashboard/vehicles/${vehicle.id}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Mileage</p>
                        <p className="font-semibold text-gray-900">{vehicle.mileage.toLocaleString()} km</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Condition</p>
                        <p className="font-semibold text-gray-900">{vehicle.condition}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Listed</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(vehicle.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </div>
                    </div>
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
