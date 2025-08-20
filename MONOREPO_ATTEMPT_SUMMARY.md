# Monorepo Attempt Summary - What NOT to Do

## Overview
This document summarizes our failed attempt to convert the MealForge project to a monorepo structure and serves as a reference for what NOT to do in future attempts.

## What We Attempted
We tried to convert the MealForge project from a single Next.js application to a monorepo structure using:
- **Turborepo** for monorepo management
- **pnpm** for package management
- **Workspace structure** with `apps/web`, `apps/mobile`, and `packages/*`

## What Went Wrong

### 1. **React Version Conflicts**
- **Problem**: Mixed React versions (React 19.1.0 in web, React 18.2.0 expected by packages)
- **Error**: "Invalid hook call" and "Cannot read properties of null (reading 'useContext')"
- **Root Cause**: Incompatible React versions between monorepo packages

### 2. **Package Manager Conflicts**
- **Problem**: Switching between pnpm and npm caused dependency resolution issues
- **Error**: `ERR_INVALID_THIS` during package installation
- **Root Cause**: Conflicting package manager configurations and lockfiles

### 3. **Clerk Authentication Issues**
- **Problem**: Clerk components not working properly in monorepo structure
- **Error**: Server Action failures and context issues
- **Root Cause**: Next.js 15 App Router + Clerk + monorepo compatibility issues

### 4. **API Route Misinterpretation**
- **Problem**: Next.js API routes being treated as Client Components
- **Error**: "This module cannot be imported from a Client Component module"
- **Root Cause**: Monorepo structure interfering with Next.js component detection

### 5. **Dependency Resolution Problems**
- **Problem**: Local package references (`workspace:*` vs `file:` protocol)
- **Error**: Package installation failures and missing dependencies
- **Root Cause**: Inconsistent workspace configuration between package managers

## What We Learned

### ✅ **Do's for Future Monorepo Attempts**
1. **Start with a working example**: Use a proven monorepo template (like the Convex example we found)
2. **Consistent package versions**: Ensure all packages use compatible React/Next.js versions
3. **Single package manager**: Stick with one package manager throughout the process
4. **Incremental migration**: Convert one package at a time, not everything at once
5. **Test each step**: Verify functionality after each major change

### ❌ **Don'ts for Future Monorepo Attempts**
1. **Don't mix package managers**: Don't switch between pnpm/npm during conversion
2. **Don't upgrade React versions**: Keep React versions consistent across all packages
3. **Don't ignore dependency conflicts**: Resolve version mismatches before proceeding
4. **Don't skip testing**: Test each component after changes
5. **Don't force incompatible versions**: Use versions that are known to work together

## Technical Details

### Package Versions That Caused Issues
- **React**: 19.1.0 (incompatible with many packages expecting 18.x)
- **Next.js**: 15.4.4 (App Router compatibility issues with Clerk)
- **Clerk**: 6.31.3 (Server Action issues in monorepo context)

### Files That Had Problems
- `apps/web/src/app/page.tsx` - Hook call errors
- `apps/web/src/app/layout.tsx` - Context provider issues
- `apps/web/src/app/api/dashboard/stats/route.ts` - Component type detection
- `apps/web/src/components/clerk-header.tsx` - Server Action failures

### Configuration Files That Caused Conflicts
- `package.json` (root) - Mixed package manager scripts
- `pnpm-workspace.yaml` - Workspace configuration conflicts
- `turbo.json` - Outdated syntax (`pipeline` vs `tasks`)
- `.npmrc` - Legacy peer deps causing issues

## Recovery Strategy

### What We Saved
1. **External ID Fix**: Successfully implemented recipe external ID functionality
2. **Documentation**: Created comprehensive fix documentation
3. **Stashed Changes**: Preserved monorepo attempt for reference

### What We Reset
1. **Monorepo Structure**: Removed all `apps/` and `packages/` directories
2. **Package Manager Changes**: Reverted to original package.json
3. **Configuration Files**: Removed Turborepo and workspace configs
4. **Dependency Changes**: Reverted to original dependency versions

## Next Steps for Future Attempts

### Phase 1: Preparation
1. **Research working examples**: Find proven monorepo setups with Next.js 15 + Clerk
2. **Version compatibility**: Ensure all packages support the same React/Next.js versions
3. **Template setup**: Use a working template as starting point

### Phase 2: Incremental Migration
1. **Start with shared packages**: Convert utilities and types first
2. **Test each step**: Verify functionality after each package conversion
3. **Maintain working state**: Keep the app functional throughout the process

### Phase 3: Full Migration
1. **Convert main app**: Move web app to monorepo structure
2. **Test thoroughly**: Ensure all functionality works
3. **Optimize**: Fine-tune monorepo configuration

## Conclusion
While the monorepo conversion attempt failed, we successfully:
- ✅ **Fixed the external ID issue** (the original goal)
- ✅ **Learned valuable lessons** about what not to do
- ✅ **Preserved working code** for future use
- ✅ **Created documentation** for future attempts

The project is now back to a working state, and we have a clear path forward for future monorepo attempts using the lessons learned from this experience.
