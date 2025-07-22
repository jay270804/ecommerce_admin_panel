"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useHasHydrated } from "@/app/hooks/useHasHydrated";
import { CategoryActionsDropdown } from "@/components/CategoryActionsDropdown";
import { CreateEditCategoryDialog } from "@/components/CreateEditCategoryDialog";
import { DeleteCategoryDialog } from "@/components/DeleteCategoryDialog";
import type { Category, Brand } from "@/components/types";

// Helper for select dropdowns (copied from users page)
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

export default function CategoriesPage() {
  const hasHydrated = useHasHydrated();

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Fetch brands on mount
  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await apiFetch("/brands?limit=100");
        const json = await res.json();
        setBrands(json.data || []);
      } catch {}
    }
    fetchBrands();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    async function fetchCategories() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (brand) params.append("brand", brand);
        params.append("limit", "100");

        const res = await apiFetch(`/categories?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to load categories");
        }

        setCategories(json.data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, [search, brand, hasHydrated]);

  function handleSaveCategory(savedCategory: Category) {
    const isNew = !categories.some(c => c._id === savedCategory._id);
    if (isNew) {
      setCategories(prev => [savedCategory, ...prev]);
    } else {
      setCategories(prev => prev.map(c => c._id === savedCategory._id ? savedCategory : c));
    }
  }

  function handleDeleteCategory(deletedCategoryId: string) {
    setCategories(prev => prev.filter(c => c._id !== deletedCategoryId));
  }

  if (!hasHydrated) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6">Categories</h1>
        <div>Loading...</div>
      </main>
    );
  }

  // Brand filter options
  const brandOptions: SelectOption[] = [
    { value: "", label: "All Brands" },
    ...brands.map(b => ({ value: b._id, label: b.name }))
  ];

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => { setEditingCategory(null); setCategoryDialogOpen(true); }}>Create Category</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Select value={brand} onChange={e => setBrand(e.target.value)} options={brandOptions} />
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
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No categories found.</TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <CategoryActionsDropdown
                      category={category}
                      onEdit={cat => { setEditingCategory(cat); setCategoryDialogOpen(true); }}
                      onDelete={setDeletingCategory}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateEditCategoryDialog
        category={editingCategory}
        open={categoryDialogOpen}
        onOpenChange={open => setCategoryDialogOpen(open)}
        onSave={handleSaveCategory}
        brands={brands}
      />

      <DeleteCategoryDialog
        category={deletingCategory}
        open={!!deletingCategory}
        onOpenChange={open => !open && setDeletingCategory(null)}
        onDelete={handleDeleteCategory}
      />
    </main>
  );
}