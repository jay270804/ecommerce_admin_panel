"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import type { Product, Category, Brand } from "@/components/types";

// If you haven't created this component, you can create a new file at `src/components/ui/textarea.tsx`
// and add the code from the previous instructions.
import { Textarea } from "@/components/ui/textarea";

interface ProductFormProps {
  product?: Product | null;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockUnit: "",
    discountPercentage: "0", // Added this field
    categoryId: "",
    brandId: "",
    tags: "",
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [images, setImages] = useState<FileList | null>(null);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!product;

  useEffect(() => {
    async function fetchDropdownData() {
      try {
        const catParams = new URLSearchParams();
        catParams.append("limit", "100");
        const brandParams = new URLSearchParams();
        brandParams.append("limit", "100");
        const [catRes, brandRes] = await Promise.all([
          apiFetch(`/categories?${catParams.toString()}`),
          apiFetch(`/brands?${brandParams.toString()}`),
        ]);
        const catJson = await catRes.json();
        const brandJson = await brandRes.json();
        setAllCategories(catJson.data || []);

        const brands = Array.isArray(brandJson.data)
          ? brandJson.data
          : Array.isArray(brandJson.data?.brands)
          ? brandJson.data.brands
          : [];
        setAllBrands(brands);
      } catch (err) {
        setError("Failed to load categories or brands.");
      }
    }
    fetchDropdownData();

    if (isEditMode && product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: String(product.price),
        stockUnit: String(product.stockUnit),
        discountPercentage: String(product.discountPercentage) || "0",
        categoryId: product.categoryId?._id || "",
        brandId: product.categoryId?.brand?._id || "", // Updated to use brandId
        tags: product.tags?.join(", ") || "",
      });
    }
  }, [product, isEditMode]);

  const filteredCategories = useMemo(() => {
    if (!formData.brandId) {
      return isEditMode ? allCategories : [];
    }
    return allCategories.filter(
      (cat) => (cat as any).brand === formData.brandId
    );
  }, [formData.brandId, allCategories, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "brandId" && value !== prev.brandId) {
        newState.categoryId = "";
      }
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    // Append all form data, but skip 'summary'
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "tags") {
        data.append(
          key,
          JSON.stringify(
            value
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          )
        );
      } else {
        data.append(key, value);
      }
    });

    // Explicitly add summary field if it exists in your model and you need it
    // data.append("summary", formData.summary);

    if (coverImage) data.append("coverImage", coverImage);
    if (images)
      Array.from(images).forEach((file) => data.append("images", file));

    try {
      const endpoint = isEditMode ? `/products/${product?._id}` : "/products";
      const method = isEditMode ? "PUT" : "POST";

      const res = await apiFetch(endpoint, { method, body: data });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(
          resData.message ||
            `Failed to ${isEditMode ? "update" : "create"} product`
        );
      }

      router.push("/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stockUnit">Stock Unit</Label>
          <Input
            id="stockUnit"
            name="stockUnit"
            type="number"
            min="0"
            value={formData.stockUnit}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountPercentage">Discount (%)</Label>
          <Input
            id="discountPercentage"
            name="discountPercentage"
            type="number"
            min="0"
            max="100"
            value={formData.discountPercentage}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="brandId">Brand</Label>
          <select
            id="brandId"
            name="brandId"
            value={formData.brandId}
            onChange={handleChange}
            required
            className="w-full h-9 rounded-md border px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select a brand</option>
            {allBrands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            disabled={!formData.brandId}
            className="w-full h-9 rounded-md border px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:bg-gray-100"
          >
            <option value="">Select a category</option>
            {filteredCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">
          Cover Image {isEditMode && "(Leave blank to keep current)"}
        </Label>
        <Input
          id="coverImage"
          type="file"
          onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">
          Additional Images {isEditMode && "(Leave blank to keep current)"}
        </Label>
        <Input
          id="images"
          type="file"
          multiple
          onChange={(e) => setImages(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isEditMode
            ? "Update Product"
            : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
