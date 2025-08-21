'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, Video, Link, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VideoImportService, VideoImportResult, VideoMetadata } from '@/lib/video-import-service'

interface VideoImportZoneProps {
  onVideoImport: (result: VideoImportResult) => void
  onUrlImport: (result: VideoImportResult) => void
  className?: string
}

export const VideoImportZone: React.FC<VideoImportZoneProps> = ({
  onVideoImport,
  onUrlImport,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supportedFormats = VideoImportService.getSupportedFormats()
  const importLimits = VideoImportService.getImportLimits()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setError(null)
    setSuccess(null)

    const files = Array.from(e.dataTransfer.files)
    const videoFiles = files.filter(file => file.type.startsWith('video/'))

    if (videoFiles.length === 0) {
      setError('Please drop a valid video file')
      return
    }

    if (videoFiles.length > 1) {
      setError('Please drop only one video file at a time')
      return
    }

    await processVideoFile(videoFiles[0])
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await processVideoFile(files[0])
    }
  }, [])

  const processVideoFile = async (file: File) => {
    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(null)

      const result = await VideoImportService.importFromVideoFile(file)

      if (result.success) {
        setSuccess(`Successfully imported recipe from ${file.name}`)
        onVideoImport(result)
      } else {
        setError(result.error || 'Failed to import video')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUrlImport = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a video URL')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(null)

      const result = await VideoImportService.importFromVideoURL(videoUrl.trim())

      if (result.success) {
        setSuccess(`Successfully imported recipe from ${result.videoMetadata.platform}`)
        onUrlImport(result)
        setVideoUrl('')
        setDetectedPlatform(null)
      } else {
        setError(result.error || 'Failed to import video from URL')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const detectPlatform = (url: string) => {
    if (!url.trim()) {
      setDetectedPlatform(null)
      return
    }

    const platform = VideoImportService.getSupportedPlatforms().find(p =>
      url.includes(p)
    )
    setDetectedPlatform(platform || null)
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setVideoUrl(url)
    detectPlatform(url)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok':
        return '🎵'
      case 'instagram':
        return '📷'
      case 'youtube':
        return '▶️'
      case 'facebook':
        return '📘'
      default:
        return '🎥'
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'tiktok':
        return 'bg-black text-white'
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'youtube':
        return 'bg-red-600 text-white'
      case 'facebook':
        return 'bg-blue-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Upload Zone */}
      <Card className={`transition-all duration-200 ${isDragOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Import Recipe from Video
          </CardTitle>
          <CardDescription>
            Drag & drop a video file or click to browse. Supports {supportedFormats.join(', ')} up to {Math.round(importLimits.maxSize / (1024 * 1024))}MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? 'Drop your video here' : 'Drag & drop your video here'}
            </p>
            <p className="text-gray-500 mb-4">
              or click to browse files
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? 'Processing...' : 'Choose Video File'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* URL Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Import from Video URL
          </CardTitle>
          <CardDescription>
            Paste a video URL from TikTok, Instagram, YouTube, or Facebook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="https://www.tiktok.com/@username/video/1234567890"
                value={videoUrl}
                onChange={handleUrlChange}
                disabled={isProcessing}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleUrlImport}
              disabled={isProcessing || !videoUrl.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Importing...' : 'Import'}
            </Button>
          </div>

          {detectedPlatform && (
            <div className="flex items-center gap-2">
              <Badge className={getPlatformColor(detectedPlatform)}>
                {getPlatformIcon(detectedPlatform)} {detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)}
              </Badge>
              <span className="text-sm text-gray-600">
                Platform detected
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {VideoImportService.getSupportedPlatforms().map(platform => (
              <Badge key={platform} variant="outline" className="text-xs">
                {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Success:</span>
              <span>{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
              <span className="font-medium">Processing video...</span>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              This may take a few minutes depending on video length and complexity.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
