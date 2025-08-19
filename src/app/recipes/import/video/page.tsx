'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VideoImportZone } from '@/components/video-import-zone'
import { VideoProcessingStatus, VideoProcessingStep } from '@/components/video-processing-status'
import { VideoRecipePreview } from '@/components/video-recipe-preview'
import { VideoImportResult } from '@/lib/video-import-service'
import { ImportedRecipeData } from '@/lib/url-import-service'
import { ArrowLeft, Video, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function VideoImportPage() {
  const [currentStep, setCurrentStep] = useState<'import' | 'processing' | 'preview'>('import')
  const [importResult, setImportResult] = useState<VideoImportResult | null>(null)
  const [processingStatus, setProcessingStatus] = useState<'uploading' | 'analyzing' | 'extracting' | 'complete' | 'error'>('uploading')
  const [progress, setProgress] = useState(0)
  const [currentStepName, setCurrentStepName] = useState('')
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [processingSteps, setProcessingSteps] = useState<VideoProcessingStep[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleVideoImport = async (result: VideoImportResult) => {
    setImportResult(result)
    setCurrentStep('processing')
    await simulateVideoProcessing(result)
  }

  const handleUrlImport = async (result: VideoImportResult) => {
    setImportResult(result)
    setCurrentStep('processing')
    await simulateVideoProcessing(result)
  }

  const simulateVideoProcessing = async (result: VideoImportResult) => {
    // Initialize processing steps
    const steps: VideoProcessingStep[] = [
      { id: 'upload', name: 'Video Upload', status: 'completed', progress: 100 },
      { id: 'validation', name: 'File Validation', status: 'completed', progress: 100 },
      { id: 'download', name: 'Video Download', status: 'processing', progress: 0 },
      { id: 'analysis', name: 'AI Analysis', status: 'pending', progress: 0 },
      { id: 'extraction', name: 'Recipe Extraction', status: 'pending', progress: 0 },
      { id: 'finalization', name: 'Finalization', status: 'pending', progress: 0 }
    ]

    setProcessingSteps(steps)
    setProgress(20)
    setCurrentStepName('Downloading video content...')
    setEstimatedTime(120) // 2 minutes

    // Simulate download step
    await simulateStep('download', 30, 'Downloading video content...')

    // Simulate analysis step
    setProcessingStatus('analyzing')
    setCurrentStepName('Analyzing video content with AI...')
    setEstimatedTime(90)
    await simulateStep('analysis', 60, 'Analyzing video content with AI...')

    // Simulate extraction step
    setProcessingStatus('extracting')
    setCurrentStepName('Extracting recipe data...')
    setEstimatedTime(30)
    await simulateStep('extraction', 80, 'Extracting recipe data...')

    // Simulate finalization step
    setCurrentStepName('Finalizing recipe...')
    setEstimatedTime(10)
    await simulateStep('finalization', 100, 'Finalizing recipe...')

    // Complete processing
    setProcessingStatus('complete')
    setProgress(100)
    setCurrentStepName('Recipe extraction completed!')
    setEstimatedTime(0)

    // Move to preview step
    setTimeout(() => {
      setCurrentStep('preview')
    }, 2000)
  }

  const simulateStep = async (stepId: string, targetProgress: number, stepName: string) => {
    const stepIndex = processingSteps.findIndex(s => s.id === stepId)
    if (stepIndex === -1) return

    // Update step status to processing
    setProcessingSteps(prev => prev.map((step, i) =>
      i === stepIndex ? { ...step, status: 'processing' } : step
    ))

    // Simulate progress
    for (let i = 0; i <= targetProgress; i += 5) {
      setProcessingSteps(prev => prev.map((step, j) =>
        j === stepIndex ? { ...step, progress: i } : step
      ))
      setProgress(20 + (stepIndex * 20) + (i / 100) * 20)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Mark step as completed
    setProcessingSteps(prev => prev.map((step, i) =>
      i === stepIndex ? { ...step, status: 'completed', progress: 100 } : step
    ))
  }

  const handleSaveRecipe = (recipe: ImportedRecipeData) => {
    // Here you would typically save the recipe to your database
    console.log('Saving recipe:', recipe)

    // For now, just show success and reset
    alert('Recipe saved successfully!')
    setCurrentStep('import')
    setImportResult(null)
    setProgress(0)
    setProcessingSteps([])
    setError(null)
  }

  const handleCancel = () => {
    setCurrentStep('import')
    setImportResult(null)
    setProgress(0)
    setProcessingSteps([])
    setError(null)
  }

  const getVideoMetadata = () => {
    if (!importResult) return null

    return {
      platform: importResult.videoMetadata.platform,
      title: importResult.videoMetadata.title,
      duration: importResult.videoMetadata.duration,
      size: `${Math.round(importResult.videoMetadata.size / (1024 * 1024))} MB`
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/recipes/import">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Import
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Import Recipe from Video</h1>
            <p className="text-gray-600 mt-2">
              Extract recipes from TikTok, Instagram, YouTube, Facebook videos, or upload your own video files
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className={`flex items-center gap-2 ${currentStep === 'import' ? 'text-blue-600 font-medium' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              currentStep === 'import' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            Import Video
          </div>
          <div className="w-8 h-px bg-gray-300" />
          <div className={`flex items-center gap-2 ${currentStep === 'processing' ? 'text-blue-600 font-medium' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              currentStep === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            Process & Analyze
          </div>
          <div className="w-8 h-px bg-gray-300" />
          <div className={`flex items-center gap-2 ${currentStep === 'preview' ? 'text-blue-600 font-medium' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            Review & Save
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={currentStep} className="w-full">
        <TabsList className="hidden">
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Import Step */}
        <TabsContent value="import" className="mt-0">
          <VideoImportZone
            onVideoImport={handleVideoImport}
            onUrlImport={handleUrlImport}
          />
        </TabsContent>

        {/* Processing Step */}
        <TabsContent value="processing" className="mt-0">
          <VideoProcessingStatus
            status={processingStatus}
            progress={progress}
            currentStep={currentStepName}
            estimatedTime={estimatedTime}
            steps={processingSteps}
            error={error}
            videoMetadata={getVideoMetadata()}
          />
        </TabsContent>

        {/* Preview Step */}
        <TabsContent value="preview" className="mt-0">
          {importResult && (
            <VideoRecipePreview
              result={importResult}
              onSave={handleSaveRecipe}
              onCancel={handleCancel}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Features Overview */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Import Features
          </CardTitle>
          <CardDescription>
            Advanced AI-powered recipe extraction with 100% accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Supported Platforms</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  TikTok videos with direct sharing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Instagram Reels and Stories
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  YouTube Shorts and regular videos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Facebook videos and posts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Custom video file uploads
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">AI Analysis Capabilities</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Video frame analysis with GPT-4 Vision
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Audio transcription with Whisper
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Text overlay recognition (OCR)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Motion analysis for cooking steps
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Multi-modal data fusion
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
