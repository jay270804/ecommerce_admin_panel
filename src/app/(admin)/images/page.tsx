"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "../../hooks/useAuthStore";
import { useHasHydrated } from "../../hooks/useHasHydrated";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Trash, Plus } from "lucide-react";

export default function ImagesPage() {
  const [images, setImages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [deleteKey, setDeleteKey] = React.useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useHasHydrated();

  const fetchImages = React.useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch("/products/s3-images")
      .then((res) => res.json())
      .then((data) => {
        setImages(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load images");
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    if (!hasHydrated) return;
    if (!user || user.role !== "admin") return;
    fetchImages();
  }, [hasHydrated, user, fetchImages]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await apiFetch("/products/upload-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to upload image");
      }
      setAddDialogOpen(false);
      setFile(null);
      fetchImages();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!deleteKey) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const encodedKey = encodeURIComponent(deleteKey);
      const res = await apiFetch(`/products/s3-images/${encodedKey}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete image");
      }
      setDeleteKey(null);
      fetchImages();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete image");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (!hasHydrated) return <div>Loading...</div>;
  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">S3 Images</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Image
        </Button>
      </div>
      {loading ? (
        <div>Loading images...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <Card key={img.key} className="flex flex-col items-center p-4 gap-4 relative group">
              <img
                src={img.url}
                alt={img.key}
                className="w-full h-48 object-cover rounded border"
                style={{ background: "#f3f3f3" }}
              />
              <div className="w-full text-xs break-all text-muted-foreground">
                <div className="font-medium">{img.key}</div>
                <div>Size: {(img.size / 1024).toFixed(1)} KB</div>
                <div>Last Modified: {new Date(img.lastModified).toLocaleString()}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-70 group-hover:opacity-100"
                onClick={() => setDeleteKey(img.key)}
                aria-label="Delete image"
              >
                <Trash className="h-5 w-5 text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Add Image Dialog */}
      <AlertDialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Image</AlertDialogTitle>
            <AlertDialogDescription>
              Select an image file to upload. Only images are allowed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
              required
              disabled={uploading}
            />
            {uploadError && <div className="text-red-500 text-sm">{uploadError}</div>}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={uploading}>Cancel</AlertDialogCancel>
              <Button type="submit" disabled={uploading || !file}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteKey} onOpenChange={open => !open && setDeleteKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}