"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import { apiFetch } from '@/lib/api';
import type { Product } from '@/components/types';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const res = await apiFetch(`/products/${id}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || 'Failed to fetch product');
        }
        setProduct(json.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading product details...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="p-8">Product not found.</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}