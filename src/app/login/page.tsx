"use client";
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore, AuthState } from "../hooks/useAuthStore";
import { jwtDecode } from "jwt-decode";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state: AuthState) => state.setAuth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      const accessToken = data.data?.accessToken;
      const refreshToken = data.data?.refreshToken;
      if (!accessToken || !refreshToken) throw new Error("Invalid response from server");
      const userPayload = jwtDecode<{ userId?: string; id?: string; role?: string }>(accessToken);
      const user = {
        id: userPayload.userId || userPayload.id || "",
        role: userPayload.role || "",
      };
      if (user.role !== "admin") {
        setError("Only admin users can log in to this panel.");
        return;
      }
      setAuth({ accessToken, refreshToken, user });
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400;`;
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>Admin Login</CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}