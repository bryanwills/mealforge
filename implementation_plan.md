# MealForge MVP Implementation Plan

## Project Overview
MealForge is a comprehensive recipe management and meal planning application with web, iOS, and Android platforms. The web app serves as the primary platform with mobile apps to follow.

## Tech Stack
- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **ORM**: Prisma (works with Supabase)
- **Deployment**: Local development on MacBook Pro, production on VPS
- **Domain**: mealforge.app
- **Cookie Banner**: @c15t/nextjs

## Phase 1: Foundation Setup (Days 1-2)

### 1.1 Fix Tailwind Configuration
- Update `tailwind.config.js` to match shadcn/ui requirements
- Verify proper content paths and theme configuration
- Test dark/light/system mode functionality

### 1.2 Database Setup
- Install Prisma CLI and client
- Configure Prisma with Supabase connection
- Create database schema based on recipehub-monorepo-docs.md
- Set up environment variables for Supabase
- Generate Prisma client

### 1.3 Install Dependencies
- Core dependencies: `@prisma/client`, `@dnd-kit/core`, `@dnd-kit/sortable`
- UI libraries: `framer-motion`, `@c15t/nextjs`
- Utilities: `tesseract.js`, `zod`
- Authentication: Clerk SDK
- Additional shadcn/ui components

### 1.4 Project Structure Setup
- Create proper folder structure for scalability
- Set up API routes structure
- Configure Clerk authentication
- Set up cookie banner

## Phase 2: Core Features (Days 3-6)

### 2.1 Authentication System
- Implement Clerk authentication
- Create protected routes
- User profile management
- Session handling

### 2.2 Recipe Management
- Recipe CRUD operations
- Recipe display components
- Recipe search and filtering
- Recipe categories and tags

### 2.3 Ingredient Database
- Ingredient CRUD operations
- Unit conversion system
- Nutritional information
- Ingredient substitutions

### 2.4 Basic UI Components
- Navigation components
- Recipe cards
- Forms for recipe creation
- Modal components
- Loading states

## Phase 3: Advanced Features (Days 7-10)

### 3.1 Recipe Import Features
- URL-based recipe import
- OCR/Tesseract for recipe image processing
- Public API integration for recipe fetching
- Recipe parsing and validation

### 3.2 Portion Scaling System
- Dynamic portion scaling (1/4x to 4x)
- Real-time ingredient quantity updates
- Unit conversion during scaling
- Visual portion indicators

### 3.3 Meal Planning
- Weekly/monthly meal planning
- Drag-and-drop meal scheduling
- Recipe calendar view
- Meal plan sharing

### 3.4 Grocery List Generation
- Automatic grocery list creation from meal plans
- Ingredient aggregation and deduplication
- Category-based grocery organization
- Export and sharing capabilities

## Phase 4: MVP Polish (Days 11-14)

### 4.1 Responsive Design
- Mobile-first responsive design
- Tablet and desktop optimizations
- Touch-friendly interactions

### 4.2 Error Handling & Validation
- Comprehensive error handling
- Form validation with Zod
- User-friendly error messages
- Loading states and feedback

### 4.3 Performance Optimization
- Image optimization
- Code splitting
- Database query optimization
- Caching strategies

### 4.4 Testing & Quality Assurance
- Unit tests for core functionality
- Integration tests for API routes
- E2E testing for critical user flows
- Performance testing

## Phase 5: Mobile App Planning (Future)

### 5.1 iOS App (React Native or Native Swift)
- Based on UltimateRecipeHub Xcode project
- Sync with web app data
- Offline functionality
- Push notifications

### 5.2 Android App
- Cross-platform or native Android
- Feature parity with iOS
- Google Play Store optimization

### 5.3 Mobile-Specific Features
- Camera integration for recipe photos
- Barcode scanning for ingredients
- Voice commands for hands-free cooking
- Smart notifications for meal prep

## Phase 6: E-commerce Integration (Future)

### 6.1 Walmart Integration
- API integration for product search
- Shopping cart management
- Order placement automation

### 6.2 Kroger Integration
- Product catalog integration
- Price comparison features
- Loyalty program integration

## Key Features for MVP

### Core Recipe Features
- ✅ Recipe creation and editing
- ✅ Recipe import via URL
- ✅ OCR recipe scanning
- ✅ Portion scaling (1/4x to 4x)
- ✅ Ingredient management
- ✅ Unit conversion

### Meal Planning
- ✅ Weekly meal planning
- ✅ Drag-and-drop scheduling
- ✅ Recipe calendar view

### Grocery Management
- ✅ Automatic grocery list generation
- ✅ Ingredient aggregation
- ✅ Category organization
- ✅ Export capabilities

### User Experience
- ✅ Dark/light/system theme
- ✅ Responsive design
- ✅ Intuitive navigation
- ✅ Fast loading times

## Technical Requirements

### Database Schema
- Users (Clerk integration)
- Recipes (with ingredients, instructions)
- Ingredients (with nutritional data)
- Meal Plans
- Grocery Lists
- User Preferences

### API Endpoints
- Recipe CRUD operations
- Ingredient management
- Meal planning
- Grocery list generation
- Recipe import/parsing

### Security
- Clerk authentication
- Row Level Security (RLS) in Supabase
- API route protection
- Data validation

## Success Metrics
- ✅ Functional recipe management
- ✅ Working meal planning
- ✅ Grocery list generation
- ✅ Responsive design
- ✅ Dark/light mode
- ✅ No critical bugs
- ✅ Good performance

## Timeline
- **Week 1**: Foundation and core features
- **Week 2**: Advanced features and polish
- **Future**: Mobile apps and e-commerce integration

## Risk Mitigation
- Start with core features, add complexity gradually
- Use established libraries (Clerk, Prisma, shadcn/ui)
- Regular testing and validation
- Backup and version control
- Performance monitoring from the start