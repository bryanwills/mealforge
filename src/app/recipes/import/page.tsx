"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, Camera, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { RecipeImportPreview } from "@/components/recipe-import-preview";
import { ImportedRecipeData } from "@/lib/url-import-service";
import { useRouter } from "next/navigation";

interface ImportProgress {
  status: 'initializing' | 'processing' | 'saving' | 'completed' | 'error'
  progress: number
  message: string
}

interface ValidationResult {
  isValid: boolean
  issues: Array<{
    field: string
    expected: any
    actual: any
    severity: 'error' | 'warning' | 'info'
    message: string
  }>
  suggestions: string[]
}

export default function ImportRecipePage() {
  const [importMethod, setImportMethod] = useState<'image' | 'url' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [extractedRecipe, setExtractedRecipe] = useState<ImportedRecipeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

<<<<<<< Updated upstream
  const handleUrlSubmit = async () => {
    if (!url.trim()) return;

    setIsProcessing(true);
    try {
      // TODO: Implement URL recipe extraction
      console.log('Processing URL:', url);
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error processing URL:', error);
=======
  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle camera/gallery selection for mobile
  const handleMobileImageCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Cancel import
  const handleCancelImport = async () => {
    try {
      await fetch('/api/recipes/import/cancel', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error cancelling import:', error)
    }

    setIsProcessing(false)
    setProgress(null)
    setError(null)
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsProcessing(true)
    setError('')

    const formData = new FormData()
    formData.append('importType', 'url')
    formData.append('url', url)

    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to import recipe')
      }

      const data = await response.json()

      if (data.success) {
        setExtractedRecipe(data.recipe)
        setSuccess('Recipe imported successfully! You can now edit and save it.');
        setProgress({
          status: 'completed',
          progress: 1.0,
          message: 'Recipe imported successfully!'
        });

        // Log validation issues if any
        if (data.validation && data.validation.issues.length > 0) {
          console.log('Validation issues:', data.validation.issues)
          console.log('Suggestions:', data.validation.suggestions)
        }
      } else {
        setError(data.error || 'Failed to import recipe')
      }
    } catch (error) {
      setError('Failed to import recipe. Please try again.')
>>>>>>> Stashed changes
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImageProcess = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    try {
<<<<<<< Updated upstream
      // TODO: Implement OCR processing with Tesseract.js
      console.log('Processing image:', imageFile.name);
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000));
=======
      const formData = new FormData();
      formData.append('importType', 'image');
      formData.append('imageFile', imageFile);

      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract recipe from image');
      }

      const result = await response.json();
      if (result.success && result.recipe) {
        setExtractedRecipe(result.recipe);
        setSuccess('Recipe extracted successfully! You can now edit and save it.');
        setProgress({
          status: 'completed',
          progress: 1.0,
          message: 'Recipe extraction completed!'
        });
      } else {
        throw new Error('Invalid response from server');
      }
>>>>>>> Stashed changes
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

<<<<<<< Updated upstream
=======
  const handleSaveRecipe = async () => {
    setIsProcessing(true);
    try {
      // Save the recipe to the database
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractedRecipe),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save recipe');
      }

      setSuccess('Recipe saved successfully!');

      // Reset form
      setTimeout(() => {
        setExtractedRecipe(null);
        setImageFile(null);
        setUrl('');
        setImportMethod(null);
        setSuccess(null);
        setProgress(null);
        router.push('/recipes');
      }, 2000);
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError('Failed to save recipe. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

>>>>>>> Stashed changes
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Import Recipe</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Import recipes from images or URLs
          </p>
        </div>

<<<<<<< Updated upstream
=======
        {/* Progress Bar */}
        {progress && (
          <div className="mb-6 p-4 bg-white/70 dark:bg-gray-800/70 border border-orange-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {progress.message}
              </span>
              {isProcessing && (
                <Button
                  onClick={handleCancelImport}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
            <Progress value={progress.progress * 100} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{Math.round(progress.progress * 100)}%</span>
              <span>{progress.status}</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-green-700 dark:text-green-300">{success}</p>
            </div>
          </div>
        )}

        {/* Recipe Preview */}
        {extractedRecipe && (
          <RecipeImportPreview
            recipe={extractedRecipe}
            onSave={handleSaveRecipe}
            onCancel={handleCancelImport}
            isProcessing={isProcessing}
          />
        )}

>>>>>>> Stashed changes
        {/* Import Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            className={`cursor-pointer transition-all hover:scale-105 ${
              importMethod === 'image'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'bg-white/70 dark:bg-gray-800/70 border-orange-200 dark:border-gray-700'
            }`}
            onClick={() => setImportMethod('image')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-white">
                <Camera className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                <span>Image Upload</span>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Upload a photo of a recipe to extract ingredients and instructions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:scale-105 ${
              importMethod === 'url'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'bg-white/70 dark:bg-gray-800/70 border-orange-200 dark:border-gray-700'
            }`}
            onClick={() => setImportMethod('url')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-white">
                <LinkIcon className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                <span>URL Import</span>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Import recipe from a website URL
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 border-orange-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-white">
                <FileText className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                <span>Manual Entry</span>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Create a recipe manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/recipes/new">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white">
                  Create Recipe
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Import Method Content */}
        {importMethod === 'image' && (
          <Card className="bg-white/70 dark:bg-gray-800/70 border-orange-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-white">Upload Recipe Image</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Take a photo or upload an image of a recipe to extract the ingredients and instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-orange-300 dark:border-orange-600 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-orange-500 dark:text-orange-400 mb-4" />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-300">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {imageFile && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Selected: {imageFile.name}
                    </span>
                  </div>
                  <Button
                    onClick={handleImageProcess}
                    disabled={isProcessing}
                    className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Extract Recipe
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {importMethod === 'url' && (
          <Card className="bg-white/70 dark:bg-gray-800/70 border-orange-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-white">Import from URL</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Enter a recipe URL to import the recipe details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipe-url" className="text-gray-700 dark:text-gray-300">
                  Recipe URL
                </Label>
                <Input
                  id="recipe-url"
                  type="url"
                  placeholder="https://example.com/recipe"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleUrlSubmit}
                disabled={!url.trim() || isProcessing}
                className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Import Recipe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <Link href="/recipes">
            <Button variant="outline" className="text-gray-700 dark:text-gray-300 border-orange-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-gray-800">
              ← Back to Recipes
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}