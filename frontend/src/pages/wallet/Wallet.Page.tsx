import { useQuery } from '@tanstack/react-query';
import { ArrowDownCircle, ArrowUpCircle, Wallet, ReceiptText } from 'lucide-react';

import { WalletService } from '../../services/wallet.service';
import { formatMoney, formatDate } from '../../utils/format';

export default function WalletPage() {
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: WalletService.getWallet,
    refetchInterval: 5000,
  });

  const { data: transactionsData, isLoading: txLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: WalletService.getTransactions,
    refetchInterval: 5000,
  });

  const wallet = walletData?.data?.wallet;
  const transactions = transactionsData?.data?.transactions ?? [];

  return (
    <div>
      <h1 className="text-4xl font-black mb-2">Wallet</h1>
      <p className="text-slate-400 mb-8">
        Track your available balance and complete transaction ledger.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-indigo-400">
            <Wallet />
            <p className="font-bold">Available Balance</p>
          </div>
          <h2 className="text-3xl font-black mt-4">
            {walletLoading ? 'Loading...' : formatMoney(wallet?.balance ?? 0)}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-green-400">
            <ArrowDownCircle />
            <p className="font-bold">Total Deposited</p>
          </div>
          <h2 className="text-3xl font-black mt-4">
            {walletLoading ? 'Loading...' : formatMoney(wallet?.total_deposited ?? 0)}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-400">
            <ArrowUpCircle />
            <p className="font-bold">Total Withdrawn</p>
          </div>
          <h2 className="text-3xl font-black mt-4">
            {walletLoading ? 'Loading...' : formatMoney(wallet?.total_withdrawn ?? 0)}
          </h2>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Transaction Ledger</h2>
            <p className="text-sm text-slate-500 mt-1">
              Every buy/sell transaction is recorded here.
            </p>
          </div>

          <ReceiptText className="text-slate-500" />
        </div>

        {txLoading ? (
          <div className="p-8 text-slate-400">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-slate-400">
            No transactions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 text-sm">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Before</th>
                  <th className="px-6 py-4 text-right">After</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((tx: any) => {
                  const isCredit = tx.transaction_type === 'SELL' || tx.transaction_type === 'DEPOSIT';

                  return (
                    <tr
                      key={tx.id}
                      className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isCredit
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {tx.transaction_type}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {tx.description || '—'}
                      </td>

                      <td
                        className={`px-6 py-4 text-right font-black ${
                          isCredit ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatMoney(tx.amount)}
                      </td>

                      <td className="px-6 py-4 text-right text-slate-400">
                        {formatMoney(tx.balance_before)}
                      </td>

                      <td className="px-6 py-4 text-right text-slate-300 font-bold">
                        {formatMoney(tx.balance_after)}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}