"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useHasHydrated } from "@/app/hooks/useHasHydrated";
import type { Product } from "@/components/types";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function ProductsPage() {
  const router = useRouter();
  const hasHydrated = useHasHydrated();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        params.append("limit", "100");

        const res = await apiFetch(`/products?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to load products");
        }

        setProducts(json.data?.products || []);
      } catch (e: any) {
        setError(e.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [search, hasHydrated]);

  const handleDelete = async (productId: string) => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await apiFetch(`/products/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete product");
      }
      setProducts(products.filter((p) => p._id !== productId));
      setDeleteProductId(null);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete product");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!hasHydrated) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => router.push("/products/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by product name, description, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-red-500 text-center">{error}</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No products found.</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <img src={product.coverImage} alt={product.name} className="h-12 w-12 object-cover rounded-md bg-gray-100" />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categoryId?.brand?.name || 'N/A'}</TableCell>
                  <TableCell>{product.categoryId?.name || 'N/A'}</TableCell>
                  <TableCell>₹{product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stockUnit}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="icon" onClick={() => router.push(`/products/${product._id}`)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this product? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  onClick={async () => {
                                    setDeleteLoading(true);
                                    setDeleteError(null);
                                    try {
                                      const res = await apiFetch(`/products/${product._id}`, { method: "DELETE" });
                                      if (!res.ok) {
                                        const data = await res.json();
                                        throw new Error(data.message || "Failed to delete product");
                                      }
                                      setProducts(products.filter((p) => p._id !== product._id));
                                    } catch (err: any) {
                                      setDeleteError(err.message || "Failed to delete product");
                                    } finally {
                                      setDeleteLoading(false);
                                    }
                                  }}
                                  disabled={deleteLoading}
                                >
                                  {deleteLoading ? "Deleting..." : "Delete"}
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
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