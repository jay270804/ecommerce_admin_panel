"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useHasHydrated } from "@/app/hooks/useHasHydrated";
import { UserActionsDropdown } from "@/components/UserActionsDropdown";
import { EditUserDialog } from "@/components/EditUserDialog";
import { DeleteUserAlertDialog } from "@/components/DeleteUserAlertDialog";
import type { User } from "@/components/types";

// Helper for select dropdowns (can be replaced with shadcn/ui Select if available)
type SelectOption = { value: string; label: string };
interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  [key: string]: any;
}
function Select({ value, onChange, options, ...props }: SelectProps) {
  return (
    <select
      className="h-9 rounded-md border px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      value={value}
      onChange={onChange}
      {...props}
    >
      {options.map((opt: SelectOption) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

const roleOptions = [
  { value: "", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHydrated = useHasHydrated();

  // Filters from URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "");
  const [isActive, setIsActive] = useState(searchParams.get("isActive") || "");

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // Fetch users
  useEffect(() => {
    if (!hasHydrated) return;
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (role) params.append("role", role);
        if (isActive) params.append("isActive", isActive);
        params.append("limit", "100");
        params.append("page", "1");
        const res = await apiFetch(`/users?${params.toString()}`);
        const json = await res.json();
        setUsers(json.data || []);
      } catch (e) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [search, role, isActive, hasHydrated]);

  // Update URL params on filter change
  function updateParams(newParams: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`?${params.toString()}`);
  }

  // Handlers
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    updateParams({ search: e.target.value });
  }
  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setRole(e.target.value);
    updateParams({ role: e.target.value });
  }
  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setIsActive(e.target.value);
    updateParams({ isActive: e.target.value });
  }

  // Edit and delete handlers
  function handleUserEdit(updatedUser: User) {
    setUsers(users => users.map(u => u._id === updatedUser._id ? updatedUser : u));
  }
  function handleUserDelete(deletedUserId: string) {
    setUsers(users => users.filter(u => u._id !== deletedUserId));
  }

  if (!hasHydrated) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6">Users</h1>
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      {/* Filters: Search, Role, Status */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div>
          <Select value={role} onChange={handleRoleChange} options={roleOptions} />
        </div>
        <div>
          <Select value={isActive} onChange={handleStatusChange} options={statusOptions} />
        </div>
      </div>
      {/* Users Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-red-500">{error}</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No users found.</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-gray-400">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <UserActionsDropdown
                      user={user}
                      onEdit={setEditUser}
                      onDelete={setDeleteUser}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <EditUserDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={open => !open && setEditUser(null)}
        onSave={handleUserEdit}
      />
      <DeleteUserAlertDialog
        user={deleteUser}
        open={!!deleteUser}
        onOpenChange={open => !open && setDeleteUser(null)}
        onDelete={handleUserDelete}
      />
    </main>
  );
}