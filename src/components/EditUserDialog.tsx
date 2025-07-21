import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "./types";
import { apiFetch } from "@/lib/api";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedUser: User) => void;
}

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];

export function EditUserDialog({ user, open, onOpenChange, onSave }: EditUserDialogProps) {
  const [role, setRole] = useState(user?.role || "user");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setRole(user?.role || "user");
    setIsActive(user?.isActive ?? true);
    setError("");
  }, [user, open]);

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user");
      if (onSave) onSave(data.data);
      onOpenChange(false);
    } catch (e: any) {
      setError(e.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user's role or status.
          </DialogDescription>
        </DialogHeader>
        {user && (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block mb-1 font-medium">Role</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={role}
                onChange={e => setRole(e.target.value)}
                disabled={loading}
              >
                {roleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={isActive ? "true" : "false"}
                onChange={e => setIsActive(e.target.value === "true")}
                disabled={loading}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={loading}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}