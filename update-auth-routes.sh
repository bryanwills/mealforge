#!/bin/bash

# Script to update all API routes from Clerk to NextAuth

echo "Updating API routes from Clerk to NextAuth..."

# Update all API route files
find apps/web/src/app/api -name "*.ts" -type f | while read -r file; do
    echo "Updating $file..."

    # Replace Clerk imports with NextAuth
    sed -i '' 's|import { auth } from '\''@clerk/nextjs/server'\''|import { auth } from '\''@/lib/auth-config'\''|g' "$file"
    sed -i '' 's|import { auth, currentUser } from '\''@clerk/nextjs/server'\''|import { auth } from '\''@/lib/auth-config'\''|g' "$file"

    # Replace Clerk auth() calls with NextAuth session
    sed -i '' 's|const { userId } = await auth()|const session = await auth()|g' "$file"
    sed -i '' 's|if (!userId) {|if (!session?.user?.id) {|g' "$file"

    # Replace userId usage with session.user.id
    sed -i '' 's|userId|session.user.id|g' "$file"

    # Replace ClerkAuthProvider with NextAuthProvider
    sed -i '' 's|ClerkAuthProvider|NextAuthProvider|g' "$file"

    echo "Updated $file"
done

echo "All API routes updated!"
