# External ID Fix Documentation

## Overview
This document outlines the fix for the external ID issue with recipes imported from external sources (like Spoonacular). The fix ensures proper recipe identification and save/unsave functionality.

## Problem Description
- Recipes imported from external sources weren't properly storing their external IDs
- This caused issues with saving/unsaving and recipe identification
- External recipes couldn't be properly tracked in the database

## Solution Components

### 1. API Route for Updating External IDs
**File**: `src/app/api/recipes/update-external-ids/route.ts`
- Finds all recipes without `externalId` set
- Extracts external IDs from `sourceUrl` for Spoonacular recipes
- Creates temporary external IDs for blog recipes
- Updates the database with proper external IDs

### 2. Enhanced Recipe Saving
**File**: `src/app/api/recipes/saved/route.ts`
- Properly extracts external IDs from recipe IDs (e.g., "external-716406" → "716406")
- Stores external IDs in the database when saving recipes
- Uses external IDs for recipe identification

### 3. Recipe API Service Updates
**File**: `src/lib/recipe-api.ts`
- Converts external recipes to internal format
- Properly maps external IDs from Spoonacular API responses
- Maintains consistency between external and internal recipe representations

### 4. Database Schema Updates
**Files**: `prisma/schema.prisma`, `packages/shared-types/src/index.ts`
- Added `externalId` field to recipes table
- Added `externalSource` field to track where recipes came from
- Updated types to include external ID fields

### 5. Frontend Integration Updates
**Files**:
- `src/components/recipe-card.tsx`
- `src/app/recipes/[id]/page.tsx`
- `src/app/recipes/page.tsx`
- `src/app/explore/page.tsx`

## Key Benefits
✅ **Proper Recipe Identification**: External recipes now have consistent IDs
✅ **Save/Unsave Functionality**: Works correctly for both external and personal recipes
✅ **Data Consistency**: External IDs are properly stored and retrieved
✅ **API Integration**: Spoonacular recipes maintain their original IDs
✅ **Future-Proof**: Easy to add more external recipe sources

## Implementation Notes
- External ID format: `external-{id}` (e.g., "external-716406")
- Database stores the actual external ID (e.g., "716406")
- Frontend uses the full format for identification
- API routes handle conversion between formats

## Files Modified
1. `src/app/api/recipes/update-external-ids/route.ts` - NEW FILE
2. `src/app/api/recipes/saved/route.ts` - MODIFIED
3. `src/lib/recipe-api.ts` - MODIFIED
4. `prisma/schema.prisma` - MODIFIED
5. `packages/shared-types/src/index.ts` - MODIFIED
6. `src/components/recipe-card.tsx` - MODIFIED
7. `src/app/recipes/[id]/page.tsx` - MODIFIED
8. `src/app/recipes/page.tsx` - MODIFIED
9. `src/app/explore/page.tsx` - MODIFIED

## Database Migration Required
After applying these changes, run:
```bash
npx prisma generate
npx prisma db push
```

## Testing
- Save an external recipe from the explore page
- Verify it appears in saved recipes
- Test unsave functionality
- Check that external IDs are properly stored in database
