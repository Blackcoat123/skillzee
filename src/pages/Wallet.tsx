/**
 * Wallet Page - View balance, earnings, and transactions
 */

import React, { useEffect, useState } from 'react';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { walletService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Wallet as WalletType, Transaction } from '../services/api';
import { format } from 'date-fns';

export const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [walletData, txns] = await Promise.all([
        walletService.getWallet(user.id),
        walletService.getTransactions(user.id),
      ]);
      setWallet(walletData);
      setTransactions(txns);
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to view your wallet</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Wallet</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100">Available Balance</span>
                  <WalletIcon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold">₹{wallet?.available_balance?.toFixed(2) || '0.00'}</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-100">Pending Balance</span>
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold">₹{wallet?.pending_balance?.toFixed(2) || '0.00'}</div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-100">Total Earnings</span>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold">₹{user.total_earnings?.toFixed(2) || '0.00'}</div>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Transaction History
              </h2>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No transactions yet
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            txn.type === 'earning'
                              ? 'bg-green-100 dark:bg-green-900'
                              : 'bg-red-100 dark:bg-red-900'
                          }`}
                        >
                          {txn.type === 'earning' ? (
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white capitalize">
                            {txn.type}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {txn.description || 'No description'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {format(new Date(txn.created_at), 'MMM dd, yyyy hh:mm a')}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${
                            txn.type === 'earning'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {txn.type === 'earning' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            txn.status === 'completed'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                              : txn.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
