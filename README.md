# MealForge 🍳

A comprehensive recipe management and meal planning application built with Next.js, TypeScript, and modern web technologies.

## 🚀 Live Demo

**Current Deployment:** https://mealforge.bigbraincoding.com

*Note: This is a temporary domain while we configure the final domain at mealforge.app*

## 🛠️ Tech Stack

- **Framework:** Next.js 15.4.4 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Deployment:** Vercel
- **Analytics:** Vercel Web Analytics
- **State Management:** React Hooks
- **UI Components:** Radix UI + Lucide Icons

## 📱 Features

### ✅ Implemented (Phase 1)
- **User Authentication:** Secure sign-in/sign-up with Clerk
- **Recipe Management:** Save, organize, and search recipes
- **Navigation:** Consistent navigation across all pages
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Dark/Light Mode:** System theme support with smooth transitions
- **Recipe Modals:** Enhanced UX with modal recipe viewing
- **Import Interface:** UI for importing recipes via URL or image

### 🚧 In Progress (Phase 2)
- **Recipe Import:** Import recipes via URL or image (OCR)
- **API Integrations:** Spoonacular and other recipe APIs
- **Database Integration:** Full CRUD operations with Supabase

### 📋 Planned (Phase 3)
- **Meal Planning:** Create weekly meal plans
- **Grocery Lists:** Generate shopping lists from meal plans
- **Portion Scaling:** Dynamic recipe scaling (1/4x to 4x)
- **Ingredient Substitutions:** Smart substitution suggestions
- **Mobile App:** iOS and Android applications

## 🔗 Links

- **Production:** https://mealforge.bigbraincoding.com
- **GitHub Repository:** https://github.com/bryanwills/mealforge
- **Vercel Dashboard:** https://vercel.com/bryan-wills-projects/mealforge

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm
- Supabase account
- Clerk account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bryanwills/mealforge.git
   cd mealforge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="your-supabase-database-url"

   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"

   # APIs
   SPOONACULAR_API_KEY="your-spoonacular-api-key"

   # Cookie Consent
   CONSENT_URL="your-consent-url"
   ```

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── recipes/           # Recipe-related pages
│   ├── meal-plans/        # Meal planning pages
│   ├── grocery-lists/     # Grocery list pages
│   └── ingredients/       # Ingredient management
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Main navigation
│   └── recipe-modal.tsx  # Recipe viewing modal
├── lib/                  # Utility functions and configurations
└── prisma/               # Database schema and migrations
```

## 🎨 Design System

- **Color Palette:** Orange/amber theme with dark mode support
- **Typography:** Geist font family
- **Components:** shadcn/ui with custom styling
- **Animations:** Framer Motion for smooth transitions
- **Icons:** Lucide React icons

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript:** Strict type checking enabled
- **ESLint:** Configured with Next.js and Prettier
- **Prettier:** Consistent code formatting
- **Tailwind CSS:** Utility-first styling

## 🚀 Deployment

The application is deployed on Vercel with automatic deployments from the `dev/vercel-deploy` branch.

### Environment Variables

All environment variables are configured in the Vercel dashboard:
- Database connection
- Authentication keys
- API keys
- Analytics configuration

## 📈 Development Status

### Phase 1: ✅ Complete
- [x] Basic app structure and navigation
- [x] Authentication system with Clerk
- [x] Recipe management interface
- [x] Vercel deployment and domain configuration
- [x] Responsive design and dark/light mode
- [x] Recipe modal and import interface

### Phase 2: 🚧 In Progress
- [ ] Recipe import functionality (URL/OCR)
- [ ] Database integration and CRUD operations
- [ ] API integrations (Spoonacular)
- [ ] User profile and preferences

### Phase 3: 📋 Planned
- [ ] Meal planning features
- [ ] Grocery list generation
- [ ] Portion scaling functionality
- [ ] Ingredient substitution system
- [ ] Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for seamless deployment
- [Clerk](https://clerk.com/) for authentication
- [Supabase](https://supabase.com/) for the database
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for styling
