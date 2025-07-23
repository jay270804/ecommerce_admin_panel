"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useHasHydrated } from "@/app/hooks/useHasHydrated";
import { apiFetch } from "@/lib/api";
import type { Order, OrderItem, ShippingAddress } from "@/components/types"; // Assuming types are defined elsewhere

// Main component for the Order Detail Page
export default function OrderDetailPage() {
  const { id } = useParams();
  const hasHydrated = useHasHydrated();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState("");

  useEffect(() => {
    // Exit if the component hasn't hydrated or if there's no ID
    if (!hasHydrated || !id) return;

    // Async function to fetch order details from the API
    async function fetchOrder() {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/orders/admin/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch order: ${res.statusText}`);
        }
        const json = await res.json();

        // Support both a direct object response and one nested under a 'data' key
        const orderObj = Array.isArray(json) ? json[0] : json.data || json;
        setOrder(orderObj || null);

      } catch (e: any) {
        setError(e.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id, hasHydrated]);

  // Display loading state until the page has hydrated on the client
  if (!hasHydrated || loading) {
    return (
      <main className="p-4 md:p-8 text-center">
        <div className="text-lg font-semibold">Loading Order Details...</div>
      </main>
    );
  }

  // Display an error message if the fetch failed
  if (error) {
    return (
      <main className="p-4 md:p-8 text-center text-red-600 bg-red-50 rounded-lg">
        <div className="font-bold">Error</div>
        <p>{error}</p>
      </main>
    );
  }

  // Display a message if the order was not found
  if (!order) {
    return (
      <main className="p-4 md:p-8 text-center">
        <div className="text-lg">Order not found.</div>
      </main>
    );
  }

  // Safely access the shipping address object
  const shippingAddress = typeof order.shippingAddress === "object" ? order.shippingAddress as ShippingAddress : null;

  return (
    // The main container no longer has horizontal padding or a max-width, allowing it to fill the parent.
    <main className="bg-gray-50 ">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order Details</h1>
          <p className="text-sm text-gray-500 mt-1">Order ID: {order._id}</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Order Information</h2>
            <div className="space-y-2 text-sm">
              <div><strong>User ID:</strong> <span className="font-mono text-gray-600">{order.user}</span></div>
              <div><strong>Total Amount:</strong> <span className="font-bold text-green-600">₹{order.orderTotal.toFixed(2)}</span></div>
              <div><strong>Status:</strong> <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">{order.orderStatus}</span></div>
              <div><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</div>
              <div><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Shipping Address</h2>
            {shippingAddress ? (
              <address className="not-italic text-sm text-gray-600 space-y-1">
                <p className="font-bold text-gray-800">{shippingAddress.title}</p>
                <p>{shippingAddress.AddrLine1}</p>
                {shippingAddress.AddrLine2 && <p>{shippingAddress.AddrLine2}</p>}
                {shippingAddress.landmark && <p>Landmark: {shippingAddress.landmark}</p>}
                <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.PIN}</p>
              </address>
            ) : (
              <div className="text-sm text-gray-500">No shipping address information available.</div>
            )}
          </div>
        </div>

        {/* Items Purchased Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Items Purchased</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3">Product</th>
                  <th scope="col" className="px-4 py-3 text-center">Quantity</th>
                  <th scope="col" className="px-4 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map((item: OrderItem, idx: number) => (
                  <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900 flex items-center gap-3">
                      {item.product.coverImage ? (
                        <img
                          src={item.product.coverImage}
                          alt={item.product.name}
                          className="w-10 h-10 object-cover rounded-md"
                          onError={(e) => { e.currentTarget.src = 'https://placehold.co/40x40/e2e8f0/e2e8f0?text=Img'; }} // Fallback
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">?</div>
                      )}
                      {item.product.name}
                    </td>
                    <td className="px-4 py-4 text-center">{item.quantity}</td>
                    <td className="px-4 py-4 text-right font-mono">₹{item.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
