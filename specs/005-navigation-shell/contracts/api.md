# API Contracts: Navigation Shell

**Feature**: 005-navigation-shell
**Date**: 2026-01-14

## Overview

This feature is UI-only and does not introduce any new API endpoints or database operations.

## Existing APIs Used

The navigation shell uses existing routes and does not create new API contracts:

- **Wedding Dashboard**: `/weddings/:weddingId` - Existing route
- **Events Timeline**: `/weddings/:weddingId/events` - Existing route
- **Create Event**: `/weddings/:weddingId/events/new` - Existing route
- **Edit Event**: `/weddings/:weddingId/events/:eventId/edit` - Existing route

## No New Endpoints Required

All navigation is client-side routing via React Router. No backend API changes needed.
