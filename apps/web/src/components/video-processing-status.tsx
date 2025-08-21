'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export interface VideoProcessingStep {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  estimatedTime?: number
  error?: string
}

export interface VideoProcessingStatusProps {
  status: 'uploading' | 'analyzing' | 'extracting' | 'complete' | 'error'
  progress: number
  currentStep: string
  estimatedTime: number
  steps: VideoProcessingStep[]
  error?: string
  videoMetadata?: {
    platform: string
    title: string
    duration: number
    size: string
  }
}

export const VideoProcessingStatus: React.FC<VideoProcessingStatusProps> = ({
  status,
  progress,
  currentStep,
  estimatedTime,
  steps,
  error,
  videoMetadata
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-5 w-5 animate-spin" />
      case 'analyzing':
        return <Loader2 className="h-5 w-5 animate-spin" />
      case 'extracting':
        return <Loader2 className="h-5 w-5 animate-spin" />
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600'
      case 'analyzing':
        return 'text-purple-600'
      case 'extracting':
        return 'text-green-600'
      case 'complete':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'pending':
        return 'text-gray-500'
      case 'processing':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.round(seconds % 60)
      return `${minutes}m ${remainingSeconds}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)} Video
          </span>
        </CardTitle>
        <CardDescription>
          {currentStep} • {formatTime(estimatedTime)} remaining
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Video Metadata */}
        {videoMetadata && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Video Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Platform:</span>
                <Badge variant="outline" className="ml-2">
                  {videoMetadata.platform.charAt(0).toUpperCase() + videoMetadata.platform.slice(1)}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <span className="ml-2 font-medium">{formatTime(videoMetadata.duration)}</span>
              </div>
              <div>
                <span className="text-gray-500">Title:</span>
                <span className="ml-2 font-medium truncate">{videoMetadata.title}</span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-2 font-medium">{videoMetadata.size}</span>
              </div>
            </div>
          </div>
        )}

        {/* Processing Steps */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Processing Steps</h4>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${getStepColor(step.status)}`}>
                      {step.name}
                    </span>
                    {step.status === 'processing' && step.progress > 0 && (
                      <span className="text-xs text-gray-500">
                        {Math.round(step.progress)}%
                      </span>
                    )}
                  </div>
                  {step.status === 'processing' && step.progress > 0 && (
                    <Progress value={step.progress} className="h-1 mt-1" />
                  )}
                  {step.error && (
                    <p className="text-xs text-red-600 mt-1">{step.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Processing Error:</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{error}</p>
          </div>
        )}

        {/* Time Estimate */}
        {estimatedTime > 0 && status !== 'complete' && status !== 'error' && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Estimated completion in {formatTime(estimatedTime)}</span>
          </div>
        )}

        {/* Success Message */}
        {status === 'complete' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Video processing completed successfully!</span>
            </div>
            <p className="text-sm text-green-600 mt-2">
              Your recipe has been extracted and is ready for review.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
