"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from 'next/link'

interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

function DeleteModal({
  user,
  onCancel,
  onConfirm,
  deleting,
}: {
  user: User
  onCancel: () => void
  onConfirm: () => void
  deleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !deleting && onCancel()}
      />
      <div className="relative bg-white w-[380px] rounded-3xl shadow-2xl p-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-3xl mb-4">🗑️</div>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-1">Hapus User?</h2>
        <p className="text-center text-sm font-medium text-gray-700 mb-2">{user.name}</p>
        <p className="text-sm text-gray-500 text-center mb-6">
          User ini akan dihapus permanen dari sistem.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menghapus...
              </>
            ) : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get<User[]>("/auth/users/");
        let data = res.data;
        data = data.sort((a, b) => {
          if (a.role === "admin" && b.role !== "admin") return -1;
          if (a.role !== "admin" && b.role === "admin") return 1;
          return a.name.localeCompare(b.name);
        });
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error("Gagal ambil users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = () => {
    const keyword = search.toLowerCase();
    setFilteredUsers(users.filter(
      (u) => u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
    ));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/auth/users/${deleteTarget.user_id}/`)
      const updated = users.filter((u) => u.user_id !== deleteTarget.user_id)
      setUsers(updated)
      setFilteredUsers(updated)
      setDeleteTarget(null)
    } catch {
      alert("Gagal menghapus user")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Data User 👥</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola semua pengguna sistem</p>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">

        <div className="flex gap-3 mb-5">
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-lg text-sm font-medium transition"
          >
            Cari
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Nama</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      user.role === "admin" ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {/* ✅ Tombol action hanya tampil untuk role bukan admin */}
                    {user.role !== 'admin' ? (
                      <div className="flex gap-2 flex-wrap">
                        <Link href={`/admin/users/edit/${user.user_id}`}>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                            ✏️ Edit
                          </button>
                        </Link>
                        <Link href={`/admin/users/change-password/${user.user_id}`}>
                          <button className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                            🔑 Ubah Sandi
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    ) : (
                      // Admin: tidak ada tombol action
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-10 text-gray-400">Tidak ada user ditemukan</div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}