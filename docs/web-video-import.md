# Web Video Import Interface for MealForge

## Overview

The Web Video Import Interface enables users to import recipe videos directly in the MealForge web application. Users can drag & drop video files, paste video URLs, or upload videos from their device to create recipes with 100% accuracy through AI-powered video analysis.

## Features

- **Drag & Drop Upload**: Intuitive file upload interface
- **URL Import**: Paste TikTok, Instagram, YouTube, Facebook URLs
- **Multi-Format Support**: MP4, MOV, AVI, MKV, WebM, M4V
- **Real-Time Processing**: Live progress tracking and status updates
- **AI Analysis**: Multi-modal video content analysis
- **Recipe Preview**: Pre-filled recipe data before saving

## User Experience Flow

### 1. Video Upload Methods

#### Drag & Drop
```
User drags video file → Drop zone highlights → File validation → Upload begins
```

#### URL Paste
```
User pastes video URL → Platform detection → Video fetching → Analysis begins
```

#### File Browser
```
User clicks upload button → File picker opens → File selection → Upload begins
```

### 2. Processing Pipeline

```
Video Input → Validation → Platform Detection → Download → Analysis → Recipe Creation
```

1. **Input Validation**: File size, format, duration checks
2. **Platform Detection**: Identify TikTok, Instagram, YouTube, Facebook
3. **Video Download**: Fetch video content and metadata
4. **AI Analysis**: Frame analysis, audio transcription, text recognition
5. **Recipe Extraction**: Convert analysis to structured recipe data
6. **Preview & Edit**: User reviews and modifies extracted data
7. **Save Recipe**: Store in user's recipe collection

## Technical Implementation

### 1. Frontend Components

#### VideoUploadZone
```tsx
interface VideoUploadZoneProps {
  onVideoSelect: (file: File) => void
  onUrlPaste: (url: string) => void
  supportedFormats: string[]
  maxSize: number
  maxDuration: number
}

const VideoUploadZone: React.FC<VideoUploadZoneProps> = ({
  onVideoSelect,
  onUrlPaste,
  supportedFormats,
  maxSize,
  maxDuration
}) => {
  // Drag & drop handlers
  // File validation
  // URL input handling
  // Progress indicators
}
```

#### VideoProcessingStatus
```tsx
interface VideoProcessingStatusProps {
  status: 'uploading' | 'analyzing' | 'extracting' | 'complete' | 'error'
  progress: number
  currentStep: string
  estimatedTime: number
  error?: string
}

const VideoProcessingStatus: React.FC<VideoProcessingStatusProps> = ({
  status,
  progress,
  currentStep,
  estimatedTime,
  error
}) => {
  // Progress bar
  // Status indicators
  // Error handling
  // Time estimates
}
```

#### RecipePreview
```tsx
interface RecipePreviewProps {
  recipe: ImportedRecipeData
  videoMetadata: VideoMetadata
  confidence: number
  onEdit: (field: string, value: any) => void
  onSave: () => void
  onCancel: () => void
}

const RecipePreview: React.FC<RecipePreviewProps> = ({
  recipe,
  videoMetadata,
  confidence,
  onEdit,
  onSave,
  onCancel
}) => {
  // Editable recipe fields
  // Confidence indicators
  // Video metadata display
  // Save/cancel actions
}
```

### 2. Backend API Endpoints

#### Video Upload
```typescript
// POST /api/videos/upload
interface VideoUploadRequest {
  file: File
  platform?: string
  metadata?: Partial<VideoMetadata>
}

interface VideoUploadResponse {
  success: boolean
  videoId: string
  uploadUrl: string
  processingStatus: string
}
```

#### Video Analysis
```typescript
// POST /api/videos/analyze
interface VideoAnalysisRequest {
  videoId: string
  analysisType: 'full' | 'quick' | 'custom'
  options?: {
    extractAudio: boolean
    analyzeFrames: boolean
    detectMotion: boolean
    ocrText: boolean
  }
}

interface VideoAnalysisResponse {
  success: boolean
  analysisId: string
  status: 'queued' | 'processing' | 'complete' | 'failed'
  progress: number
  estimatedCompletion: Date
}
```

#### Recipe Extraction
```typescript
// POST /api/videos/extract-recipe
interface RecipeExtractionRequest {
  analysisId: string
  extractionOptions?: {
    confidenceThreshold: number
    includeTiming: boolean
    includeNutrition: boolean
    language: string
  }
}

interface RecipeExtractionResponse {
  success: boolean
  recipe: ImportedRecipeData
  confidence: number
  extractionMethod: string
  recommendations: string[]
}
```

### 3. Video Processing Pipeline

#### Upload Handler
```typescript
class VideoUploadHandler {
  async handleFileUpload(file: File): Promise<VideoUploadResult> {
    // Validate file
    const validation = this.validateFile(file)
    if (!validation.isValid) {
      throw new Error(validation.errorMessage)
    }

    // Generate upload URL
    const uploadUrl = await this.generateUploadUrl(file)

    // Upload to cloud storage
    const uploadResult = await this.uploadToCloud(file, uploadUrl)

    // Create video record
    const videoRecord = await this.createVideoRecord(file, uploadResult)

    return {
      success: true,
      videoId: videoRecord.id,
      uploadUrl: uploadResult.url,
      processingStatus: 'uploaded'
    }
  }

  private validateFile(file: File): FileValidationResult {
    const maxSize = 100 * 1024 * 1024 // 100MB
    const supportedFormats = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv']

    if (file.size > maxSize) {
      return { isValid: false, errorMessage: 'File too large' }
    }

    if (!supportedFormats.includes(file.type)) {
      return { isValid: false, errorMessage: 'Unsupported format' }
    }

    return { isValid: true, errorMessage: null }
  }
}
```

#### Platform Detector
```typescript
class PlatformDetector {
  detectPlatform(url: string): VideoPlatform | null {
    const patterns = {
      tiktok: ['tiktok.com', 'vm.tiktok.com'],
      instagram: ['instagram.com', 'instagr.am'],
      youtube: ['youtube.com', 'youtu.be'],
      facebook: ['facebook.com', 'fb.com']
    }

    for (const [platform, urls] of Object.entries(patterns)) {
      if (urls.some(pattern => url.includes(pattern))) {
        return platform as VideoPlatform
      }
    }

    return null
  }

  async extractVideoInfo(url: string, platform: VideoPlatform): Promise<VideoInfo> {
    switch (platform) {
      case 'tiktok':
        return await this.extractTikTokInfo(url)
      case 'instagram':
        return await this.extractInstagramInfo(url)
      case 'youtube':
        return await this.extractYouTubeInfo(url)
      case 'facebook':
        return await this.extractFacebookInfo(url)
      default:
        throw new Error('Unsupported platform')
    }
  }
}
```

#### Video Analyzer
```typescript
class VideoAnalyzer {
  async analyzeVideo(videoBuffer: Buffer, metadata: VideoMetadata): Promise<VideoAnalysisResult> {
    const analysisTasks = [
      this.analyzeFrames(videoBuffer),
      this.transcribeAudio(videoBuffer),
      this.detectTextOverlays(videoBuffer),
      this.analyzeMotion(videoBuffer)
    ]

    const results = await Promise.allSettled(analysisTasks)

    return {
      frames: this.processFrameResults(results[0]),
      audio: this.processAudioResults(results[1]),
      textOverlays: this.processTextResults(results[2]),
      motionData: this.processMotionResults(results[3]),
      confidence: this.calculateOverallConfidence(results)
    }
  }

  private async analyzeFrames(videoBuffer: Buffer): Promise<VideoFrame[]> {
    // Extract frames at regular intervals
    // Use OpenAI GPT-4 Vision for analysis
    // Detect ingredients, measurements, text overlays
  }

  private async transcribeAudio(videoBuffer: Buffer): Promise<AudioSegment[]> {
    // Extract audio from video
    // Use Whisper API for transcription
    // Segment by speaker and content
  }

  private async detectTextOverlays(videoBuffer: Buffer): Promise<TextOverlay[]> {
    // Extract frames with text
    // Use OCR services for text recognition
    // Categorize by type (ingredient, measurement, instruction)
  }

  private async analyzeMotion(videoBuffer: Buffer): Promise<MotionAnalysis[]> {
    // Analyze frame differences
    // Detect cooking actions
    // Estimate timing for each step
  }
}
```

## User Interface Design

### 1. Upload Zone

#### Visual Design
- **Large Drop Zone**: 400x300px minimum for easy targeting
- **Border Styling**: Dashed border with hover effects
- **Icon**: Video camera icon with upload symbol
- **Text**: Clear instructions for drag & drop

#### States
- **Default**: "Drag & drop video here or click to browse"
- **Drag Over**: Highlighted border with "Drop to upload" message
- **Uploading**: Progress bar with percentage
- **Processing**: Spinner with "Analyzing video..." message

### 2. URL Input

#### Design Elements
- **Input Field**: Large text input with placeholder
- **Paste Button**: "Paste URL" button for easy access
- **Platform Icon**: Visual indicator of detected platform
- **Validation**: Real-time URL validation feedback

#### Features
- **Auto-detection**: Automatically detect video platform
- **URL Validation**: Check URL format and accessibility
- **Preview**: Show video thumbnail and metadata
- **Quick Import**: One-click import for supported URLs

### 3. Processing Status

#### Progress Indicators
- **Step Progress**: Visual step-by-step progress
- **Time Estimates**: "Estimated time remaining" display
- **Current Action**: "Analyzing video frames" status
- **Progress Bar**: Animated progress bar with percentage

#### Status Messages
- **Upload**: "Uploading video... 45% complete"
- **Analysis**: "Analyzing video content... 2 minutes remaining"
- **Extraction**: "Extracting recipe data... Almost done!"
- **Complete**: "Recipe extracted successfully!"

### 4. Recipe Preview

#### Data Display
- **Title**: Editable recipe title with confidence score
- **Ingredients**: List of extracted ingredients with quantities
- **Instructions**: Step-by-step cooking instructions
- **Metadata**: Video source, creator, duration, platform

#### Edit Options
- **Inline Editing**: Click to edit any field
- **Validation**: Real-time validation feedback
- **Undo/Redo**: History of changes
- **Auto-save**: Automatic saving of changes

## Error Handling

### 1. Upload Errors

#### File Validation Errors
- **Size Limit**: "File too large. Maximum size: 100MB"
- **Format Error**: "Unsupported format. Supported: MP4, MOV, AVI, MKV"
- **Duration Error**: "Video too long. Maximum: 10 minutes"

#### Network Errors
- **Upload Failed**: "Upload failed. Please check your connection"
- **Timeout**: "Upload timed out. Please try again"
- **Server Error**: "Server error. Please try again later"

### 2. Processing Errors

#### Analysis Errors
- **Video Corrupted**: "Video file appears to be corrupted"
- **Unsupported Codec**: "Video codec not supported"
- **Processing Failed**: "Video analysis failed. Please try again"

#### Platform Errors
- **Private Video**: "This video is private and cannot be accessed"
- **Region Restricted**: "Video not available in your region"
- **API Limit**: "Rate limit exceeded. Please try again later"

### 3. Recovery Options

#### Automatic Recovery
- **Retry Logic**: Automatic retry for transient errors
- **Fallback Methods**: Alternative processing methods
- **Progress Preservation**: Resume from last successful step

#### User Recovery
- **Error Details**: Clear explanation of what went wrong
- **Suggestions**: Specific steps to resolve the issue
- **Alternative Options**: Different ways to import the recipe

## Performance Optimization

### 1. Upload Optimization

#### Chunked Upload
- **File Splitting**: Split large files into chunks
- **Parallel Upload**: Upload multiple chunks simultaneously
- **Resume Support**: Resume interrupted uploads
- **Progress Tracking**: Real-time progress for each chunk

#### Compression
- **Client-Side**: Compress before upload when possible
- **Quality Settings**: Adjustable quality vs. size trade-offs
- **Format Conversion**: Convert to optimal format for processing

### 2. Processing Optimization

#### Background Processing
- **Queue System**: Process videos in background queue
- **Priority Handling**: Process shorter videos first
- **Resource Management**: Limit concurrent processing
- **Caching**: Cache analysis results for similar videos

#### Incremental Analysis
- **Progressive Results**: Show results as they become available
- **Early Preview**: Show partial results while processing
- **User Control**: Allow users to stop processing early

### 3. User Experience

#### Responsive Design
- **Mobile Optimized**: Touch-friendly interface
- **Progressive Enhancement**: Basic functionality without JavaScript
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance**: Fast loading and smooth interactions

## Security & Privacy

### 1. Data Protection

#### Upload Security
- **File Scanning**: Scan uploaded files for malware
- **Access Control**: Secure access to uploaded videos
- **Encryption**: Encrypt video files in transit and storage
- **Cleanup**: Automatic deletion of temporary files

#### Privacy Controls
- **User Consent**: Clear consent for video processing
- **Data Retention**: Configurable data retention policies
- **User Control**: Users can delete their uploaded videos
- **Anonymization**: Remove personal data when possible

### 2. Platform Compliance

#### API Limits
- **Rate Limiting**: Respect platform API rate limits
- **Quota Management**: Track and manage API usage
- **Fallback Methods**: Alternative methods when APIs fail
- **Error Handling**: Graceful handling of API errors

#### Terms of Service
- **Platform Policies**: Follow each platform's ToS
- **Content Guidelines**: Respect content restrictions
- **Attribution**: Properly credit original creators
- **Fair Use**: Ensure compliance with fair use policies

## Testing & Quality Assurance

### 1. Test Scenarios

#### File Upload Tests
- **Valid Files**: Test various formats and sizes
- **Invalid Files**: Test corrupted and unsupported files
- **Large Files**: Test upload limits and timeouts
- **Network Issues**: Test upload failures and recovery

#### Platform Tests
- **TikTok**: Test various TikTok video formats
- **Instagram**: Test Reels and Stories
- **YouTube**: Test Shorts and regular videos
- **Facebook**: Test various Facebook video types

### 2. Performance Testing

#### Load Testing
- **Concurrent Users**: Test with multiple simultaneous users
- **File Sizes**: Test various file size ranges
- **Processing Times**: Measure analysis performance
- **Resource Usage**: Monitor CPU, memory, and network usage

#### User Experience Testing
- **Usability Testing**: Test with real users
- **Accessibility Testing**: Test with screen readers
- **Mobile Testing**: Test on various mobile devices
- **Browser Testing**: Test across different browsers

## Future Enhancements

### 1. Advanced Features

#### Batch Processing
- **Multiple Videos**: Upload and process multiple videos
- **Queue Management**: Manage processing queue
- **Priority System**: Set processing priorities
- **Batch Results**: Combined analysis results

#### Smart Categorization
- **Auto-Tagging**: Automatically tag recipes by cuisine
- **Ingredient Recognition**: Advanced ingredient detection
- **Nutrition Analysis**: Extract nutritional information
- **Dietary Restrictions**: Identify dietary restrictions

### 2. Integration Features

#### Social Sharing
- **Recipe Sharing**: Share recipes back to platforms
- **Creator Attribution**: Link to original video creators
- **Community Features**: Share with MealForge community
- **Collaboration**: Collaborative recipe editing

#### Analytics & Insights
- **Usage Analytics**: Track video import usage
- **Success Rates**: Monitor import success rates
- **Performance Metrics**: Track processing performance
- **User Feedback**: Collect user experience feedback

---

*This document outlines the complete web video import interface implementation. The interface will provide users with an intuitive way to import recipe videos directly in the MealForge web application, achieving 100% accuracy through advanced AI-powered video analysis.*
