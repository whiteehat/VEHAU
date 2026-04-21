'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface PartCategory {
  id: string;
  name: string;
}

export default function AddPartPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    condition: 'NEW',
    brand: '',
    description: '',
    price: '',
    quantity: '',
    vendorLocation: '',
    compatibilities: [{ vehicleMake: '', vehicleModel: '', yearStart: '', yearEnd: '' }],
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/parts/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCompatibilityChange = (index: number, field: string, value: string) => {
    const newCompatibilities = [...formData.compatibilities];
    newCompatibilities[index] = { ...newCompatibilities[index], [field]: value };
    setFormData({ ...formData, compatibilities: newCompatibilities });
  };

  const addCompatibility = () => {
    setFormData({
      ...formData,
      compatibilities: [
        ...formData.compatibilities,
        { vehicleMake: '', vehicleModel: '', yearStart: '', yearEnd: '' },
      ],
    });
  };

  const removeCompatibility = (index: number) => {
    setFormData({
      ...formData,
      compatibilities: formData.compatibilities.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/parts', {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        compatibilities: formData.compatibilities.filter(
          (c) => c.vehicleMake && c.vehicleModel && c.yearStart && c.yearEnd
        ),
      });
      router.push('/dashboard/shop');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add part');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/dashboard/shop" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to My Shop
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Part</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-12">
        <form onSubmit={handleSubmit} className="card">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Part Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Engine Oil Filter"
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isLoading}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-gray-700 font-semibold mb-2">
                Condition *
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isLoading}
              >
                <option value="NEW">New</option>
                <option value="USED">Used</option>
                <option value="REFURBISHED">Refurbished</option>
              </select>
            </div>

            <div>
              <label htmlFor="brand" className="block text-gray-700 font-semibold mb-2">
                Brand *
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Toyota OEM"
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">
                Price (₦) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 3500"
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-gray-700 font-semibold mb-2">
                Quantity in Stock *
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="vendorLocation" className="block text-gray-700 font-semibold mb-2">
                Your Location *
              </label>
              <input
                id="vendorLocation"
                name="vendorLocation"
                type="text"
                value={formData.vendorLocation}
                onChange={handleChange}
                placeholder="e.g., Lagos"
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about the part..."
              className="input-field"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Compatibility Section */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Vehicle Compatibility</h3>
            
            {formData.compatibilities.map((compat, index) => (
              <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Make
                    </label>
                    <input
                      type="text"
                      value={compat.vehicleMake}
                      onChange={(e) => handleCompatibilityChange(index, 'vehicleMake', e.target.value)}
                      placeholder="e.g., Toyota"
                      className="input-field"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Model
                    </label>
                    <input
                      type="text"
                      value={compat.vehicleModel}
                      onChange={(e) => handleCompatibilityChange(index, 'vehicleModel', e.target.value)}
                      placeholder="e.g., Camry"
                      className="input-field"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Year From
                    </label>
                    <input
                      type="number"
                      value={compat.yearStart}
                      onChange={(e) => handleCompatibilityChange(index, 'yearStart', e.target.value)}
                      placeholder="2015"
                      className="input-field"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Year To
                    </label>
                    <input
                      type="number"
                      value={compat.yearEnd}
                      onChange={(e) => handleCompatibilityChange(index, 'yearEnd', e.target.value)}
                      placeholder="2023"
                      className="input-field"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {formData.compatibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompatibility(index)}
                    className="mt-4 text-red-600 hover:text-red-700 font-semibold text-sm"
                  >
                    Remove Compatibility
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addCompatibility}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              + Add Another Compatibility
            </button>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Adding part...' : 'Add Part'}
            </button>
            <Link
              href="/dashboard/shop"
              className="flex-1 text-center btn-secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
