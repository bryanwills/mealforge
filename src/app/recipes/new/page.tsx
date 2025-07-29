import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NewRecipePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-orange-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/recipes">
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Recipes
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
                Save Draft
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                <Save className="mr-2 h-4 w-4" />
                Save Recipe
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Create New Recipe</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Add a new recipe to your collection
          </p>
        </div>

        {/* Recipe Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Basic Information</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Enter the basic details of your recipe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Recipe Title</Label>
                  <Input id="title" placeholder="Enter recipe title" className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your recipe..."
                    rows={3}
                    className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime" className="text-gray-700 dark:text-gray-300">Prep Time (min)</Label>
                    <Input id="prepTime" type="number" placeholder="15" className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cookTime" className="text-gray-700 dark:text-gray-300">Cook Time (min)</Label>
                    <Input id="cookTime" type="number" placeholder="30" className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servings" className="text-gray-700 dark:text-gray-300">Servings</Label>
                    <Input id="servings" type="number" placeholder="4" className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-gray-700 dark:text-gray-300">Difficulty</Label>
                    <select id="difficulty" className="w-full p-2 border border-orange-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                      <option value="">Select difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuisine" className="text-gray-700 dark:text-gray-300">Cuisine</Label>
                    <Input id="cuisine" placeholder="e.g., Italian, Mexican" className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Ingredients</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  List all the ingredients needed for this recipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input placeholder="Ingredient name" className="flex-1 bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                    <Input placeholder="Amount" className="w-24 bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                    <Input placeholder="Unit" className="w-24 bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                    <Button variant="outline" size="sm" className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">Add</Button>
                  </div>

                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No ingredients added yet</p>
                    <p className="text-sm">Add your first ingredient above</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Instructions</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Step-by-step cooking instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter step-by-step instructions..."
                    rows={8}
                    className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                  <Button variant="outline" size="sm" className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
                    Add Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Recipe Image</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Add a photo of your finished dish
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-orange-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <p>Click to upload image</p>
                    <p className="text-sm">or drag and drop</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-white">Tags</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Add tags to help organize your recipes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder="Add tags (comma separated)" className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400" />
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Example: vegetarian, quick, healthy
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}