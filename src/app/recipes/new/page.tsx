import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";

export default function NewRecipePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link href="/recipes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Recipes
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                Save Draft
              </Button>
              <Button>
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
          <h1 className="text-3xl font-bold mb-2">Create New Recipe</h1>
          <p className="text-muted-foreground">
            Add a new recipe to your collection
          </p>
        </div>

        {/* Recipe Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details of your recipe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title</Label>
                  <Input id="title" placeholder="Enter recipe title" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your recipe..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (min)</Label>
                    <Input id="prepTime" type="number" placeholder="15" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cookTime">Cook Time (min)</Label>
                    <Input id="cookTime" type="number" placeholder="30" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input id="servings" type="number" placeholder="4" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select id="difficulty" className="w-full p-2 border rounded-md">
                      <option value="">Select difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuisine">Cuisine</Label>
                    <Input id="cuisine" placeholder="e.g., Italian, Mexican" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>
                  List all the ingredients needed for this recipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Input placeholder="Ingredient name" className="flex-1" />
                    <Input placeholder="Amount" className="w-24" />
                    <Input placeholder="Unit" className="w-24" />
                    <Button variant="outline" size="sm">Add</Button>
                  </div>

                  <div className="text-center py-8 text-muted-foreground">
                    <p>No ingredients added yet</p>
                    <p className="text-sm">Add your first ingredient above</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>
                  Step-by-step cooking instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter step-by-step instructions..."
                    rows={8}
                  />
                  <Button variant="outline" size="sm">
                    Add Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recipe Image</CardTitle>
                <CardDescription>
                  Add a photo of your finished dish
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <div className="text-muted-foreground">
                    <p>Click to upload image</p>
                    <p className="text-sm">or drag and drop</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Add tags to help organize your recipes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder="Add tags (comma separated)" />
                <div className="mt-2 text-sm text-muted-foreground">
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