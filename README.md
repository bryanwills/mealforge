# MealForge 🍳

**Comprehensive Recipe Management & Meal Planning Application**

MealForge is a modern, full-stack recipe management and meal planning application built with Next.js, TypeScript, and Clerk authentication. It provides users with a comprehensive platform to discover, save, create, and organize recipes while planning their meals efficiently.

## 🌟 Features

### 🔐 Authentication & User Management
- **Secure Authentication** with Clerk
- **User Profile Management** with automatic data synchronization
- **Protected Routes** and user-specific data isolation
- **Dark/Light Theme** support with system preference detection

### 📚 Recipe Management
- **Personal Recipe Creation** - Create and store your own recipes
- **External Recipe Discovery** - Browse recipes from external APIs (Spoonacular)
- **Recipe Saving System** - Save favorite recipes with persistent storage
- **Recipe Import** - Import recipes from URLs with automatic parsing
- **Recipe Details** - View comprehensive recipe information with ingredients and instructions
- **Search & Filter** - Find recipes by cuisine, diet, cooking time, and more

### 🗂️ Organization & Navigation
- **Dashboard Overview** - Quick stats and navigation to key features
- **Recipe Categories** - Personal vs. External recipe organization
- **Heart Indicators** - Visual saved state for external recipes
- **Responsive Design** - Works seamlessly on desktop and mobile devices

### 🛠️ Technical Features
- **File-based Storage** - Persistent saved recipes with user isolation
- **Real-time Updates** - Instant UI updates when saving/unsaving recipes
- **Error Handling** - Comprehensive error handling and user feedback
- **TypeScript** - Full type safety throughout the application
- **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icons

### Backend & Database
- **Next.js API Routes** - Server-side API endpoints
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database (via Supabase)
- **Clerk** - Authentication and user management

### Development & Deployment
- **ESLint** - Code linting and formatting
- **Vercel** - Deployment platform
- **GitHub** - Version control and collaboration

## 📋 Planned Features

### Phase 1 ✅ (Completed)
- [x] User authentication and profile management
- [x] Basic recipe browsing and saving
- [x] Dashboard with user statistics
- [x] Responsive UI with dark/light themes

### Phase 2 🚧 (In Progress)
- [ ] **Meal Planning System**
  - Weekly/monthly meal planning
  - Drag-and-drop calendar interface
  - Recipe scheduling and organization
- [ ] **Grocery List Management**
  - Automatic ingredient aggregation
  - Shopping list generation from meal plans
  - Category-based organization
- [ ] **Recipe Import Enhancements**
  - OCR-based recipe import from images
  - Advanced URL parsing for more sources
  - Recipe validation and cleanup

### Phase 3 📅 (Planned)
- [ ] **Social Features**
  - Recipe sharing and collaboration
  - User ratings and reviews
  - Recipe recommendations
- [ ] **Advanced Search**
  - AI-powered recipe recommendations
  - Dietary restriction filtering
  - Nutritional information integration
- [ ] **Mobile App**
  - React Native mobile application
  - Offline recipe access
  - Barcode scanning for ingredients

### Phase 4 🎯 (Future)
- [ ] **AI Integration**
  - Recipe generation from available ingredients
  - Dietary preference learning
  - Smart meal suggestions
- [ ] **Community Features**
  - Recipe contests and challenges
  - User-generated content moderation
  - Recipe version control and history

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- PostgreSQL database (via Supabase)
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bryanwills/mealforge.git
   cd mealforge
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   # Database
   DATABASE_URL="your-postgresql-connection-string"

   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"

   # External APIs (Optional)
   SPOONACULAR_API_KEY="your-spoonacular-api-key"

   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
MealForge/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── recipes/           # Recipe-related pages
│   │   └── ...
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...
│   └── lib/                  # Utility functions and services
├── prisma/                   # Database schema and migrations
├── data/                     # File-based storage for saved recipes
├── scripts/                  # Utility scripts for data management
└── public/                   # Static assets
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Clerk](https://clerk.com/) for authentication
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Spoonacular](https://spoonacular.com/) for recipe data
- [Vercel](https://vercel.com/) for deployment

## 📞 Support

If you have any questions or need help, please:
- Open an [issue](https://github.com/bryanwills/mealforge/issues)
- Check our [documentation](https://github.com/bryanwills/mealforge/wiki)
- Join our [Discord community](https://discord.gg/mealforge)

---

**Built with ❤️ by the MealForge Team**
