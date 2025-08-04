"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Grid, List, Loader2, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { RecipeCard, type Recipe } from "@/components/recipe-card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ExplorePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  const fetchRecipes = useCallback(async (searchParams: Record<string, string> = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...searchParams,
        offset: offset.toString(),
        number: "12"
      })

      const response = await fetch(`/api/recipes/search?${params}`)
      const data = await response.json()

      if (searchParams.offset === "0" || !searchParams.offset) {
        setRecipes(data.results)
      } else {
        setRecipes(prev => [...prev, ...data.results])
      }

      setHasMore(data.results.length === 12)
    } catch (error) {
      console.error("Failed to fetch recipes:", error)
    } finally {
      setLoading(false)
    }
  }, [offset])

  useEffect(() => {
    fetchRecipes({ offset: "0" })
  }, [fetchRecipes])

  const handleSearch = () => {
    setOffset(0)
    fetchRecipes({
      query: searchQuery,
      offset: "0"
    })
  }

  const handleFilter = (filter: string) => {
    setActiveFilter(filter)
    setOffset(0)

    const searchParams: Record<string, string> = { offset: "0" }

    switch (filter) {
      case "personal":
        // TODO: Filter for personal recipes
        break
      case "external":
        // TODO: Filter for external recipes
        break
      case "quick":
        searchParams.maxReadyTime = "30"
        break
      case "vegetarian":
        searchParams.diet = "vegetarian"
        break
      case "desserts":
        searchParams.query = "dessert"
        break
    }

    fetchRecipes(searchParams)
  }

  const loadMore = () => {
    const newOffset = offset + 12
    setOffset(newOffset)
    fetchRecipes({
      query: searchQuery,
      offset: newOffset.toString()
    })
  }

  const handleSaveRecipe = (recipe: Recipe) => {
    // TODO: Implement save to user's collection
    console.log("Saving recipe:", recipe.title)
  }

  const handleViewRecipe = (recipe: Recipe) => {
    // Always navigate to our recipe detail page
    router.push(`/recipes/${recipe.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-orange-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">MealForge</h1>
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/recipes">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Recipes</Button>
              </Link>
              <Link href="/explore">
                <Button variant="ghost" className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20">Explore</Button>
              </Link>
              <Link href="/meal-plans">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Meal Plans</Button>
              </Link>
              <Link href="/grocery-lists">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">Grocery Lists</Button>
              </Link>
              <ThemeToggle />
              <UserMenu />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                suppressHydrationWarning
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Grid
              </Button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter("all")}
            >
              All Recipes
            </Button>
            <Button
              variant={activeFilter === "personal" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter("personal")}
            >
              Personal
            </Button>
            <Button
              variant={activeFilter === "external" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter("external")}
            >
              External
            </Button>
            <Button
              variant={activeFilter === "quick" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter("quick")}
            >
              Quick (&lt; 30 min)
            </Button>
            <Button
              variant={activeFilter === "vegetarian" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter("vegetarian")}
            >
              Vegetarian
            </Button>
            <Button
              variant={activeFilter === "desserts" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter("desserts")}
            >
              Desserts
            </Button>
          </div>
        </div>

        {/* Recipe Grid */}
        {loading && recipes.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading recipes...</span>
            </div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No recipes found</h3>
            <p className="text-gray-600 dark:text-gray-300">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSave={handleSaveRecipe}
                  onView={handleViewRecipe}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Recipes"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}