"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link as LinkIcon, Camera, FileText, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ImportRecipePage() {
  const [importMethod, setImportMethod] = useState<'image' | 'url' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageProcess = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    try {
      // TODO: Implement OCR processing with Tesseract.js
      console.log('Processing image:', imageFile.name);
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

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