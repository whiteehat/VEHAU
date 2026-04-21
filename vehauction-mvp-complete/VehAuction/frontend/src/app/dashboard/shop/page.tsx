'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface Part {
  id: string;
  name: string;
  category: string;
  condition: string;
  price: string;
  quantity: number;
  isActive: boolean;
  createdAt: string;
}

export default function VendorShopPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await api.get('/parts/vendor/' + user?.id);
        setParts(response.data);
      } catch (error) {
        console.error('Failed to fetch parts', error);
      } finally {
        setIsLoadingParts(false);
      }
    };

    if (isAuthenticated && user) {
      fetchParts();
    }
  }, [isAuthenticated, user]);

  if (isLoading || isLoadingParts) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Shop</h1>
          </div>
          <Link
            href="/dashboard/shop/add-part"
            className="btn-primary"
          >
            ➕ Add Part
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Shop Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <p className="text-gray-500 text-sm">Total Parts</p>
            <p className="text-3xl font-bold text-gray-900">{parts.length}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 text-sm">Active Parts</p>
            <p className="text-3xl font-bold text-blue-600">{parts.filter(p => p.isActive).length}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 text-sm">Total Stock</p>
            <p className="text-3xl font-bold text-gray-900">{parts.reduce((sum, p) => sum + p.quantity, 0)}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 text-sm">Inventory Value</p>
            <p className="text-3xl font-bold text-green-600">
              ₦{(parts.reduce((sum, p) => sum + (parseInt(p.price) * p.quantity), 0) / 100).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Parts List */}
        {parts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">You haven't added any parts yet</p>
            <Link
              href="/dashboard/shop/add-part"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Add Your First Part
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Part Name</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Condition</th>
                  <th className="px-6 py-4 text-right text-gray-700 font-semibold">Price</th>
                  <th className="px-6 py-4 text-right text-gray-700 font-semibold">Stock</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{part.name}</p>
                      <p className="text-xs text-gray-500">{new Date(part.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{part.category}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {part.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      ₦{(parseInt(part.price) / 100).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={part.quantity > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {part.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        part.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {part.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/shop/part/${part.id}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
