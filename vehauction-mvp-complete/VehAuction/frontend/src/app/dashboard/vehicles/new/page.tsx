'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function AddVehiclePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    mileage: '',
    color: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    engineCC: '',
    condition: 'GOOD',
    location: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/vehicles', {
        ...formData,
        year: parseInt(formData.year.toString()),
        mileage: parseInt(formData.mileage),
        engineCC: formData.engineCC ? parseInt(formData.engineCC) : null,
      });
      router.push('/dashboard/vehicles');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/dashboard/vehicles" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to My Vehicles
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add Vehicle for Auction</h1>
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
              <label htmlFor="make" className="block text-gray-700 font-semibold mb-2">
                Make *
              </label>
              <input
                id="make"
                name="make"
                type="text"
                value={formData.make}
                onChange={handleChange}
                placeholder="e.g., Toyota"
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-gray-700 font-semibold mb-2">
                Model *
              </label>
              <input
                id="model"
                name="model"
                type="text"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., Camry"
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-gray-700 font-semibold mb-2">
                Year *
              </label>
              <input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="vin" className="block text-gray-700 font-semibold mb-2">
                VIN (Optional)
              </label>
              <input
                id="vin"
                name="vin"
                type="text"
                value={formData.vin}
                onChange={handleChange}
                placeholder="Vehicle Identification Number"
                className="input-field"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="mileage" className="block text-gray-700 font-semibold mb-2">
                Mileage (km) *
              </label>
              <input
                id="mileage"
                name="mileage"
                type="number"
                value={formData.mileage}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-gray-700 font-semibold mb-2">
                Color
              </label>
              <input
                id="color"
                name="color"
                type="text"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g., Black"
                className="input-field"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="fuelType" className="block text-gray-700 font-semibold mb-2">
                Fuel Type
              </label>
              <select
                id="fuelType"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="input-field"
                disabled={isLoading}
              >
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Hybrid</option>
                <option>Electric</option>
              </select>
            </div>

            <div>
              <label htmlFor="transmission" className="block text-gray-700 font-semibold mb-2">
                Transmission
              </label>
              <select
                id="transmission"
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="input-field"
                disabled={isLoading}
              >
                <option>Automatic</option>
                <option>Manual</option>
                <option>CVT</option>
              </select>
            </div>

            <div>
              <label htmlFor="engineCC" className="block text-gray-700 font-semibold mb-2">
                Engine CC (Optional)
              </label>
              <input
                id="engineCC"
                name="engineCC"
                type="number"
                value={formData.engineCC}
                onChange={handleChange}
                placeholder="e.g., 2000"
                className="input-field"
                disabled={isLoading}
              />
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
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-gray-700 font-semibold mb-2">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
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
              placeholder="Add details about the vehicle condition, service history, etc."
              className="input-field"
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Adding vehicle...' : 'Add Vehicle'}
            </button>
            <Link
              href="/dashboard/vehicles"
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
