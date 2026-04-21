'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalUsers?: number;
  totalAuctions?: number;
  activeAuctions?: number;
  totalRevenue?: number;
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Stub for now - in production, would fetch from /admin/analytics
        setStats({
          totalUsers: 1250,
          totalAuctions: 48,
          activeAuctions: 12,
          totalRevenue: 125000000,
        });
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  if (isLoading || isLoadingStats) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const isAdmin = user?.roles?.includes('ADMIN');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Access Denied</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">👨‍💼 Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers?.toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 text-sm">Total Auctions</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalAuctions}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 text-sm">Active Auctions</p>
            <p className="text-3xl font-bold text-green-600">{stats.activeAuctions}</p>
          </div>
          <div className="card">
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-purple-600">
              ₦{(stats.totalRevenue || 0) / 1000000}M
            </p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link href="/dashboard/admin/users" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-2">👥 Manage Users</h3>
            <p className="text-gray-600 mb-4">Approve/reject user registrations</p>
            <p className="text-blue-600 font-semibold">View →</p>
          </Link>

          <Link href="/dashboard/admin/auctions" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🏆 Manage Auctions</h3>
            <p className="text-gray-600 mb-4">Create and monitor auctions</p>
            <p className="text-blue-600 font-semibold">View →</p>
          </Link>

          <Link href="/dashboard/admin/vendors" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🏪 Manage Vendors</h3>
            <p className="text-gray-600 mb-4">Approve vendor profiles</p>
            <p className="text-blue-600 font-semibold">View →</p>
          </Link>

          <Link href="/dashboard/admin/inspections" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-2">✅ Review Inspections</h3>
            <p className="text-gray-600 mb-4">Approve/reject inspection reports</p>
            <p className="text-blue-600 font-semibold">View →</p>
          </Link>

          <Link href="/dashboard/admin/disputes" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-2">⚖️ Manage Disputes</h3>
            <p className="text-gray-600 mb-4">Handle refunds and disputes</p>
            <p className="text-blue-600 font-semibold">View →</p>
          </Link>

          <Link href="/dashboard/admin/audit-logs" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-lg font-bold text-gray-900 mb-2">📋 Audit Logs</h3>
            <p className="text-gray-600 mb-4">View admin activity logs</p>
            <p className="text-blue-600 font-semibold">View →</p>
          </Link>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">New vendor registered</p>
                <p className="text-sm text-gray-500">Femi Auto Parts - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Auction completed</p>
                <p className="text-sm text-gray-500">2018 Toyota Camry sold for ₦7M - 4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Inspection approved</p>
                <p className="text-sm text-gray-500">2015 Toyota Corolla - 6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
