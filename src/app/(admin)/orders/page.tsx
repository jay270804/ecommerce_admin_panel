"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { useHasHydrated } from "@/app/hooks/useHasHydrated";
import type { Order } from "@/components/types";
import { useRouter } from "next/navigation";

// Status options for orders
const statusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Processing", label: "Processing" },
  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancelled", label: "Cancelled" },
];

// Simple Select component (copied from users/categories pages)
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

export default function OrdersPage() {
  const hasHydrated = useHasHydrated();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null); // orderId being updated

  useEffect(() => {
    if (!hasHydrated) return;
    async function fetchOrders() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        params.append("limit", "100");
        // Use the admin orders endpoint
        const res = await apiFetch(`/orders/admin/all?${params.toString()}`);
        const json = await res.json();
        // Support both array and { data: [...] }
        const ordersArray = Array.isArray(json) ? json : json.data;
        setOrders(ordersArray || []);
      } catch (e: any) {
        setError(e.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [search, hasHydrated]);

  // Handler for status change
  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdating(orderId);
    try {
      const res = await apiFetch(`/orders/admin/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (e: any) {
      alert(e.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

  if (!hasHydrated) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by order ID or user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>View</TableHead>
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
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No orders found.</TableCell>
              </TableRow>
            ) : (
              orders.map(order => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{order.user}</TableCell>
                  <TableCell>{order.orderTotal}/-</TableCell>
                  <TableCell>
                    <Select
                      value={order.orderStatus}
                      onChange={e => handleStatusChange(order._id, e.target.value)}
                      options={statusOptions}
                      disabled={updating === order._id}
                    />
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <button
                      className="underline text-blue-600 hover:text-blue-800"
                      onClick={() => router.push(`/orders/${order._id}`)}
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}