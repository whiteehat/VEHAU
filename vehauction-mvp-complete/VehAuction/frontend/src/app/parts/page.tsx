'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface Part {
  id: string;
  name: string;
  category: string;
  condition: string;
  brand: string;
  price: string;
  quantity: number;
  vendorLocation: string;
  photos: string[];
  vendor: {
    firstName: string;
    lastName: string;
  };
}

interface Category {
  name: string;
}

export default function PartsMarketplacePage() {
  const searchParams = useSearchParams();
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search filters
  const [filters, setFilters] = useState({
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    year: searchParams.get('year') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    location: searchParams.get('location') || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await api.get('/parts/categories');
        setCategories(categoriesResponse.data);

        // Fetch parts with filters
        const partsResponse = await api.get('/parts/search', {
          params: filters,
        });
        setParts(partsResponse.data);
      } catch (error) {
        console.error('Failed to fetch parts', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const resetFilters = () => {
    setFilters({
      make: '',
      model: '',
      year: '',
      category: '',
      condition: '',
      location: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">🛠️ Auto Parts Marketplace</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Search & Filter</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="make" className="block text-gray-700 font-semibold mb-2 text-sm">
                    Vehicle Make
                  </label>
                  <input
                    id="make"
                    name="make"
                    type="text"
                    value={filters.make}
                    onChange={handleFilterChange}
                    placeholder="e.g., Toyota"
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="model" className="block text-gray-700 font-semibold mb-2 text-sm">
                    Model
                  </label>
                  <input
                    id="model"
                    name="model"
                    type="text"
                    value={filters.model}
                    onChange={handleFilterChange}
                    placeholder="e.g., Camry"
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="year" className="block text-gray-700 font-semibold mb-2 text-sm">
                    Year
                  </label>
                  <input
                    id="year"
                    name="year"
                    type="number"
                    value={filters.year}
                    onChange={handleFilterChange}
                    placeholder="2020"
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-gray-700 font-semibold mb-2 text-sm">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="condition" className="block text-gray-700 font-semibold mb-2 text-sm">
                    Condition
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={filters.condition}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">All Conditions</option>
                    <option value="NEW">New</option>
                    <option value="USED">Used</option>
                    <option value="REFURBISHED">Refurbished</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-gray-700 font-semibold mb-2 text-sm">
                    Vendor Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="e.g., Lagos"
                    className="input-field"
                  />
                </div>

                <button
                  onClick={resetFilters}
                  className="w-full btn-secondary text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Parts Grid */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading parts...</p>
              </div>
            ) : parts.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 mb-4">No parts found matching your criteria</p>
                <button
                  onClick={resetFilters}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parts.map((part) => (
                  <Link
                    key={part.id}
                    href={`/parts/${part.id}`}
                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="mb-4 bg-gray-200 h-40 rounded overflow-hidden">
                      {part.photos[0] && (
                        <img
                          src={part.photos[0]}
                          alt={part.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{part.name}</h3>

                    <p className="text-sm text-gray-600 mb-3">
                      {part.brand} • {part.condition}
                    </p>

                    <div className="flex justify-between items-center mb-3">
                      <p className="text-2xl font-bold text-blue-600">
                        ₦{(parseInt(part.price) / 100).toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        part.quantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {part.quantity > 0 ? `${part.quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      📍 {part.vendorLocation} • {part.vendor.firstName} {part.vendor.lastName}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
