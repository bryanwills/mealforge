# MealForge Authentication System

## Overview

MealForge uses **Better Auth** as its authentication provider, replacing the previous Clerk.js implementation. This system provides secure, scalable authentication with support for multiple OAuth providers and email/password authentication.

## Architecture

### Authentication Flow
1. **User Authentication**: Users can sign in via Google, Facebook, GitHub, or email/password
2. **Session Management**: NextAuth.js handles session management and token refresh
3. **Database Integration**: Better Auth integrates with Prisma for user data persistence
4. **API Protection**: Middleware protects routes requiring authentication

### Supported Providers

#### OAuth Providers
- **Google OAuth**: Primary social login provider
- **Facebook OAuth**: Social login via Facebook
- **GitHub OAuth**: Developer-friendly social login

#### Email Authentication
- **Email/Password**: Traditional email-based authentication
- **Password Hashing**: Secure bcrypt password hashing
- **Email Verification**: Built-in email verification system

## Configuration

### Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Database
DATABASE_URL=your_database_connection_string

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Better Auth Configuration

The authentication system is configured in `apps/web/src/lib/better-auth-config.ts`:

```typescript
import { betterAuth } from "better-auth";
import { google, facebook, github } from "better-auth/social-providers";
import { prismaAdapter } from "better-auth/adapters/prisma-adapter";

export const auth = betterAuth({
  adapter: prismaAdapter({
    provider: "postgresql",
    client: db,
  }),
  providers: [
    google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user && user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name;
        session.user.image = user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
```

## Database Schema

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?   // For email/password authentication
  clerkId       String?   @unique // Legacy field for migration
  firstName     String?
  lastName      String?
  preferences   Json      @default("{}")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Better Auth relations
  accounts Account[]
  sessions Session[]

  // Custom relations
  recipes      Recipe[]
  mealPlans    MealPlan[]
  groceryLists GroceryList[]

  @@map("User")
}
```

### Better Auth Tables

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## API Routes

### Authentication Endpoints

- **`/api/auth/[...better-auth]`**: Better Auth API routes
- **`/sign-in`**: Custom sign-in page with all provider options

### Protected Routes

All API routes that require authentication use the `auth()` middleware:

```typescript
import { auth } from "@/lib/better-auth-config";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... protected logic
}
```

## Frontend Integration

### Session Provider

The app is wrapped with NextAuth's SessionProvider in `apps/web/src/app/layout.tsx`:

```typescript
import { NextAuthSessionProvider } from "@/components/providers/session-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
```

### User Menu Component

The user menu component (`apps/web/src/components/user-menu.tsx`) uses NextAuth hooks:

```typescript
import { useSession, signOut } from "next-auth/react";

function UserMenuWithAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") return <LoadingSpinner />;
  if (status === "unauthenticated") return <SignInButton />;

  return <UserDropdown user={session.user} />;
}
```

### Sign-In Page

The custom sign-in page (`apps/web/src/app/sign-in/page.tsx`) provides:

- Social login buttons (Google, Facebook, GitHub)
- Email/password form toggle
- Responsive design with dark mode support
- Consistent styling with the MealForge theme

## Migration from Clerk

### What Changed

1. **Authentication Provider**: Clerk.js → Better Auth + NextAuth
2. **Session Management**: Clerk hooks → NextAuth hooks
3. **API Protection**: Clerk middleware → Better Auth middleware
4. **User Data**: Clerk user object → NextAuth session user

### Migration Steps

1. **Remove Clerk Dependencies**
   ```bash
   npm uninstall @clerk/nextjs svix
   ```

2. **Install Better Auth**
   ```bash
   npm install better-auth @daveyplate/better-auth-ui next-auth
   ```

3. **Update Database Schema**
   - Add Better Auth tables
   - Keep `clerkId` field for data migration
   - Add `password` field for email authentication

4. **Update Components**
   - Replace Clerk hooks with NextAuth hooks
   - Update user menu and authentication flows
   - Remove Clerk-specific imports

5. **Update API Routes**
   - Replace `auth()` from Clerk with Better Auth
   - Update user ID references
   - Maintain existing functionality

## Security Features

### OAuth Security
- **State Parameter**: CSRF protection for OAuth flows
- **PKCE**: Proof Key for Code Exchange for enhanced security
- **Token Validation**: Secure token validation and refresh

### Session Security
- **JWT Tokens**: Secure session tokens with configurable expiration
- **Database Sessions**: Persistent session storage with automatic cleanup
- **Secure Cookies**: HttpOnly, Secure, and SameSite cookie attributes

### Password Security
- **Bcrypt Hashing**: Industry-standard password hashing
- **Salt Generation**: Unique salt per password
- **Rate Limiting**: Protection against brute force attacks

## Development Setup

### Local Development

1. **Set Environment Variables**
   ```bash
   cp .env.example .env.local
   # Fill in your OAuth credentials
   ```

2. **Database Setup**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Start Development Server**
   ```bash
   turbo run dev --filter=mealforge-web
   ```

### Testing Authentication

1. **OAuth Testing**: Use test OAuth apps for development
2. **Session Testing**: Verify session persistence across page reloads
3. **Protected Route Testing**: Ensure unauthenticated users are redirected

## Troubleshooting

### Common Issues

1. **OAuth Provider Errors**
   - Verify client ID and secret
   - Check redirect URI configuration
   - Ensure provider is enabled in Better Auth config

2. **Database Connection Issues**
   - Verify DATABASE_URL environment variable
   - Check Prisma schema compatibility
   - Ensure database tables exist

3. **Session Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check cookie domain configuration
   - Ensure SessionProvider is properly configured

### Debug Mode

Enable debug logging by setting:

```bash
NEXTAUTH_DEBUG=true
```

## Future Enhancements

### Planned Features
- **Two-Factor Authentication**: SMS or app-based 2FA
- **Role-Based Access Control**: User roles and permissions
- **Social Login Expansion**: Additional OAuth providers
- **Enterprise SSO**: SAML and OIDC integration

### Performance Optimizations
- **Session Caching**: Redis-based session storage
- **Database Optimization**: Connection pooling and query optimization
- **CDN Integration**: Global authentication endpoint distribution

## Support

For authentication-related issues:

1. **Check Environment Variables**: Ensure all required variables are set
2. **Verify OAuth Configuration**: Check provider app settings
3. **Review Database Schema**: Ensure tables are properly created
4. **Check Browser Console**: Look for authentication errors
5. **Review Server Logs**: Check for backend authentication issues

---

*Last Updated: August 21, 2025*
*Version: 2.0 (Better Auth)*
