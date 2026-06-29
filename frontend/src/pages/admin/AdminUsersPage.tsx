import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, User, Users } from 'lucide-react';
import toast from 'react-hot-toast';

import { AdminService } from '../../services/admin.service';

function formatDate(value?: string) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: AdminService.getUsers,
  });

  const users = data?.data?.data?.users ?? [];

  const filteredUsers = useMemo(() => {
    const text = search.toLowerCase();

    return users.filter((user: any) =>
      `${user.full_name} ${user.username} ${user.email} ${user.role}`
        .toLowerCase()
        .includes(text)
    );
  }, [users, search]);

  async function changeRole(userId: string, role: 'USER' | 'ADMIN') {
    try {
      await AdminService.updateUserRole(userId, role);
      toast.success(`User role changed to ${role}`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update role');
    }
  }

  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black">User Management</h1>
          <p className="text-slate-400 mt-2">
            View platform users and manage admin access.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3">
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="text-2xl font-black">{users.length}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-indigo-400" />
            Users
          </h2>

          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-slate-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-slate-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 text-sm">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Verified</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr
                    key={user.id}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black">
                          {user.full_name?.[0]?.toUpperCase() || <User size={18} />}
                        </div>

                        <div>
                          <p className="font-black">{user.full_name}</p>
                          <p className="text-sm text-slate-500">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {user.email}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {user.role === 'ADMIN' && <ShieldCheck size={13} />}
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold ${
                          user.is_verified ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {user.is_verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(user.created_at)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {user.role === 'ADMIN' ? (
                        <button
                          onClick={() => changeRole(user.id, 'USER')}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold transition"
                        >
                          Make User
                        </button>
                      ) : (
                        <button
                          onClick={() => changeRole(user.id, 'ADMIN')}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-bold transition"
                        >
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}