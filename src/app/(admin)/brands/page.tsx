"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useHasHydrated } from "@/app/hooks/useHasHydrated";
import { BrandActionsDropdown } from "@/components/BrandActionsDropdown";
import { CreateEditBrandDialog } from "@/components/CreateEditBrandDialog";
import { DeleteBrandDialog } from "@/components/DeleteBrandDialog";
import type { Brand } from "@/components/types";

export default function BrandsPage() {
  const hasHydrated = useHasHydrated();

  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    async function fetchBrands() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        params.append("limit", "100");

        const res = await apiFetch(`/brands?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to load brands");
        }

        setBrands(json.data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load brands");
      } finally {
        setLoading(false);
      }
    }
    fetchBrands();
  }, [search, hasHydrated]);

  function handleSaveBrand(savedBrand: Brand) {
    const isNew = !brands.some(b => b._id === savedBrand._id);
    if (isNew) {
      setBrands(prev => [savedBrand, ...prev]);
    } else {
      setBrands(prev => prev.map(b => b._id === savedBrand._id ? savedBrand : b));
    }
  }

  function handleDeleteBrand(deletedBrandId: string) {
    setBrands(prev => prev.filter(b => b._id !== deletedBrandId));
  }

  if (!hasHydrated) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6">Brands</h1>
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brands</h1>
        <Button onClick={() => { setEditingBrand(null); setBrandDialogOpen(true); }}>Create Brand</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3}>Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="text-red-500">{error}</TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No brands found.</TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>{brand.description}</TableCell>
                  <TableCell>
                    <BrandActionsDropdown
                      brand={brand}
                      onEdit={b => { setEditingBrand(b); setBrandDialogOpen(true); }}
                      onDelete={setDeletingBrand}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateEditBrandDialog
        brand={editingBrand}
        open={brandDialogOpen}
        onOpenChange={open => setBrandDialogOpen(open)}
        onSave={handleSaveBrand}
      />

      <DeleteBrandDialog
        brand={deletingBrand}
        open={!!deletingBrand}
        onOpenChange={open => !open && setDeletingBrand(null)}
        onDelete={handleDeleteBrand}
      />
    </main>
  );
}