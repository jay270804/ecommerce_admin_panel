"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import type { Category } from "./types";
import type { Brand } from "./types";

interface CreateEditCategoryDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (category: Category) => void;
  brands: Brand[];
}

export function CreateEditCategoryDialog({ category, open, onOpenChange, onSave, brands }: CreateEditCategoryDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditMode = !!(category && category._id);

  useEffect(() => {
    if (open) {
      if (isEditMode) {
        setName(category.name);
        setDescription(category.description);
        setBrand((category as any).brand || "");
      } else {
        setName("");
        setDescription("");
        setBrand("");
      }
      setError("");
    }
  }, [open, category, isEditMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }
    if (!brand) {
      setError("Brand is required");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isEditMode ? `/categories/${category._id}` : "/categories";
      const method = isEditMode ? "PUT" : "POST";
      const res = await apiFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, brand, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save category");
      }

      onSave(data.data);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const brandOptions = [
    { value: "", label: "Select a brand" },
    ...brands.map(b => ({ value: b._id, label: b.name }))
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Category" : "Create Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">
                Brand
              </Label>
              <select
                id="brand"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="col-span-3 h-9 rounded-md border px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              >
                {brandOptions.map(opt => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}