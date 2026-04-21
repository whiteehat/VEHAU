'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface WalletData {
  balance: string;
  availableBalance: string;
  lockedBalance: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const [walletResponse, historyResponse] = await Promise.all([
          api.get('/wallet/balance'),
          api.get('/wallet/history'),
        ]);
        setWallet(walletResponse.data);
        setTransactions(historyResponse.data);
      } catch (error) {
        console.error('Failed to fetch wallet', error);
        setError('Failed to load wallet');
      } finally {
        setIsLoadingWallet(false);
      }
    };

    if (isAuthenticated) {
      fetchWallet();
    }
  }, [isAuthenticated]);

  const handleFundWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsFunding(true);

    try {
      // In production, this would integrate with Paystack
      const response = await api.post('/wallet/fund', {
        amount: parseFloat(fundAmount),
        reference: `fund-${Date.now()}`,
      });

      setWallet({
        balance: (BigInt(wallet?.balance || 0) + BigInt(Math.floor(parseFloat(fundAmount) * 100))).toString(),
        availableBalance: wallet?.availableBalance || '0',
        lockedBalance: wallet?.lockedBalance || '0',
      });

      setSuccess(`Successfully funded wallet with ₦${parseFloat(fundAmount).toLocaleString()}`);
      setFundAmount('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fund wallet');
    } finally {
      setIsFunding(false);
    }
  };

  if (isLoading || isLoadingWallet) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">💰 My Wallet</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Balance Cards */}
          <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white">
            <p className="text-blue-100 text-sm">Total Balance</p>
            <p className="text-4xl font-bold mt-2">
              ₦{wallet ? (parseInt(wallet.balance) / 100).toLocaleString() : '0'}
            </p>
          </div>

          <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white">
            <p className="text-green-100 text-sm">Available Balance</p>
            <p className="text-4xl font-bold mt-2">
              ₦{wallet ? (parseInt(wallet.availableBalance) / 100).toLocaleString() : '0'}
            </p>
          </div>

          <div className="card bg-gradient-to-br from-orange-600 to-orange-700 text-white">
            <p className="text-orange-100 text-sm">Locked in Bids</p>
            <p className="text-4xl font-bold mt-2">
              ₦{wallet ? (parseInt(wallet.lockedBalance) / 100).toLocaleString() : '0'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Fund Wallet Form */}
          <div className="md:col-span-1">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Fund Wallet</h3>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleFundWallet}>
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-gray-700 font-semibold mb-2">
                    Amount (₦)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="10000"
                    className="input-field"
                    disabled={isFunding}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isFunding}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isFunding ? 'Processing...' : 'Fund Wallet'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900 font-semibold mb-2">💡 Tip:</p>
                <p className="text-xs text-blue-800">
                  You need minimum ₦100,000 in your wallet to bid on auctions.
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="md:col-span-2">
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Transaction History</h3>

              {transactions.length === 0 ? (
                <p className="text-gray-600">No transactions yet</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{tx.type}</p>
                        <p className="text-xs text-gray-500">{tx.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.type.includes('FUND') || tx.type.includes('REFUND')
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {tx.type.includes('FUND') || tx.type.includes('REFUND') ? '+' : '-'}
                          ₦{(Math.abs(parseInt(tx.amount)) / 100).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="card bg-yellow-50 border-yellow-200 mt-8">
          <h3 className="text-lg font-bold text-yellow-900 mb-2">⚠️ Important</h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>• Funds locked in active bids are held in escrow and returned if you lose</li>
            <li>• Commission fee (₦100,000) is deducted only when you win an auction</li>
            <li>• All transactions are processed in Nigerian Naira (₦)</li>
            <li>• Fund your wallet securely using Paystack payment gateway</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
