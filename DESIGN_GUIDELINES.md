# Design Guidelines & UI Consistency Log

**Project Context:**
- This document applies to the admin panel for the ecommerce server.
- The project uses a **separate API server** for all backend tasks; we do not use Next.js server-side components for backend logic.
- The main objective is to develop a modern UI for the existing API using Next.js (primarily client components).
- API contracts and backend endpoints referenced in this project are documented in:
  - `Ecommerce Backend - Auth APIs.postman_collection.json`
  - `Ecommerce Address & Order APIs.postman_collection.json`

## Project Structure
- `/components`: Shared, custom React components for the UI.
- `/lib`: Utility functions and the API client.
- `/hooks`: Custom React hooks for reusable logic.

## Authentication & Route Protection
- **All pages except `/login` must check if the user is authenticated and has the `admin` role.**
  - If not authenticated or not an admin, reroute to `/login`.
  - Use the `useAuthStore` hook for client-side authentication checks in React components/pages.
  - Use the `useHasHydrated` hook to ensure Zustand's persisted state is fully loaded before running auth logic. Show a loading state until hydration is complete to avoid unwanted redirects.
  - Middleware is used for server-side protection, but client-side checks are also required for UX and security.

This document tracks design decisions and rules for consistent UI development in this project. Refer to this when designing or reviewing components.

## Typography
- **Primary Font:** Use `Poppins` throughout all components and pages.
  - Integrated via Next.js font optimization and Tailwind CSS.
  - Use Tailwind's `font-sans` or `font-poppins` utility for all text.
  - Fallbacks: `var(--font-poppins), var(--font-geist-sans), var(--font-geist-mono), sans-serif`.

## Color Palette
- (Add rules here as you define your color system.)

## Spacing & Layout
- (Add spacing, padding, and margin conventions here.)

## Components
- (Document reusable component patterns, shadcn/ui usage, and customizations.)

## Other Rules
- (Add accessibility, responsiveness, and other design principles as adopted.)

---
*Update this file whenever a new design rule or UI decision is made to ensure project-wide consistency.*