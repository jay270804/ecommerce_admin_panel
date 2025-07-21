# Design Guidelines & UI Consistency Log

**Project Context:**
- This document applies to the admin panel for the ecommerce server.
- API contracts and backend endpoints referenced in this project are documented in:
  - `Ecommerce Backend - Auth APIs.postman_collection.json`
  - `Ecommerce Address & Order APIs.postman_collection.json`

## Project Structure
- `/components`: Shared, custom React components for the UI.
- `/lib`: Utility functions and the API client.
- `/hooks`: Custom React hooks for reusable logic.

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