"use client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";

const statsEndpoints = [
  {
    key: "users",
    label: "Total Users",
    endpoint: "/users/stats",
    extract: (data: any) => {
      const d = data?.data;
      if (Array.isArray(d?.usersByRole)) {
        const userRole = d.usersByRole.find((r: any) => r._id === "user");
        return userRole?.count ?? 0;
      }
      return 0;
    },
  },
  {
    key: "products",
    label: "Total Products",
    endpoint: "/products",
    extract: (data: any) => data?.data?.pagination?.totalProducts ?? 0,
  },
  {
    key: "categories",
    label: "Total Categories",
    endpoint: "/categories/stats",
    extract: (data: any) => data?.data?.totalCategories ?? 0,
  },
  {
    key: "brands",
    label: "Total Brands",
    endpoint: "/brands/stats",
    extract: (data: any) => data?.data?.totalBrands ?? 0,
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          statsEndpoints.map(async (stat) => {
            const res = await apiFetch(stat.endpoint);
            if (!res.ok) throw new Error(`Failed to fetch ${stat.label}`);
            const data = await res.json();
            return [stat.key, stat.extract(data)];
          })
        );
        setStats(Object.fromEntries(results));
      } catch (err: any) {
        setError(err.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      {loading ? (
        <div>Loading stats...</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {statsEndpoints.map((stat) => (
            <Card key={stat.key}>
              <CardHeader>
                <CardTitle>{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{stats[stat.key]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}