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
- **General Layout:** Use CSS Grid or Flexbox for all major layouts. Prefer `flex` for linear layouts (sidebars, navbars) and `grid` for dashboards or metric cards.
- **Spacing Scale:** Use Tailwind's spacing scale (`gap-2`, `gap-4`, `gap-6`, `gap-8`, `p-4`, `p-6`, `p-8`, etc.) for consistent padding and margin. Avoid arbitrary pixel values.
- **Gaps:** Use `gap-4` or `gap-6` for most grid/flex layouts. For dashboard metric cards, use at least `gap-6` or `gap-8`.
- **Padding:** Use `p-6` or `p-8` for main content containers. For cards (e.g., ShadcnUI Card), use `p-6` for content and `p-4` for compact areas.
- **Sidebar:** Sidebar width should be fixed (e.g., `w-64` or `min-w-[16rem]`), with `py-8` or `py-6` for vertical padding.
- **Header:** Add `px-6`/`px-8` and `py-4`/`py-6` to headers. Use `flex items-center justify-between` for header layout.
- **Cards:** Use ShadcnUI Card component for metric/stat blocks. Cards should have `rounded-xl`, `border`, and `shadow` (as in the default Card). Use `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6` for dashboard stats.
- **Responsiveness:** Always use responsive Tailwind classes (e.g., `sm:`, `md:`, `lg:`) to adjust spacing and layout for different breakpoints.
- **Alignment:** Use `items-center` and `justify-center` for centering content. For vertical layouts, use `flex-col` and `gap-6`.
- **No Arbitrary Spacing:** Do not use inline styles or arbitrary values unless absolutely necessary. Stick to the Tailwind scale for all spacing.
- **Reference:** Follow [Shadcn UI Layout](https://ui.shadcn.com/docs/components/layout) and [Tailwind Spacing](https://tailwindcss.com/docs/spacing) for further guidance.

## Components
- (Document reusable component patterns, shadcn/ui usage, and customizations.)

## Other Rules
- (Add accessibility, responsiveness, and other design principles as adopted.)

## API Response Deconstruction
- **API responses are always wrapped in a top-level `data` property.**
- When consuming API responses, always extract the actual payload from `data.data` (i.e., `const payload = response.data`).
- Example:
  ```js
  const res = await apiFetch(...);
  const response = await res.json();
  // Access your data as:
  const payload = response.data;
  ```
- All extractors, selectors, and UI logic should use this pattern to avoid mismatches and bugs.

---
*Update this file whenever a new design rule or UI decision is made to ensure project-wide consistency.*