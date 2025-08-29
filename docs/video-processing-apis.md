# Video Processing APIs Documentation

## Overview

The Video Processing APIs provide a comprehensive backend system for handling video recipe imports with AI-powered analysis. The system supports both file uploads and URL imports from social media platforms.

## Base URL

```
https://your-domain.com/api/videos
```

## Authentication

All endpoints require authentication. Include your authentication token in the request headers:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

## API Endpoints

### 1. Video Upload

**Endpoint:** `POST /api/videos/upload`

**Description:** Upload a video file for recipe extraction

**Request Body (FormData):**
```typescript
{
  file: File,                    // Video file (MP4, MOV, AVI, MKV, WebM, M4V)
  platform?: string,            // Optional: Platform identifier
  metadata?: string             // Optional: JSON string of metadata
}
```

**Response:**
```typescript
{
  success: boolean,
  videoId: string,
  uploadUrl: string,
  processingStatus: string,
  result: {
    recipe: ImportedRecipeData,
    confidence: number,
    extractionMethod: string,
    processingTime: number
  }
}
```

**Example Request:**
```bash
curl -X POST https://your-domain.com/api/videos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@recipe-video.mp4" \
  -F "platform=custom"
```

**Example Response:**
```json
{
  "success": true,
  "videoId": "video_1703123456789_abc123def",
  "uploadUrl": "/api/videos/recipe-video.mp4",
  "processingStatus": "completed",
  "result": {
    "recipe": {
      "title": "Chocolate Chip Cookies",
      "description": "Classic homemade cookies",
      "ingredients": [...],
      "instructions": [...]
    },
    "confidence": 0.95,
    "extractionMethod": "multi-modal",
    "processingTime": 45000
  }
}
```

### 2. Video Analysis

**Endpoint:** `POST /api/videos/analyze`

**Description:** Initiate AI-powered video analysis

**Request Body:**
```typescript
{
  videoId: string,
  analysisType?: 'full' | 'quick' | 'custom',
  options?: {
    extractAudio?: boolean,
    analyzeFrames?: boolean,
    detectMotion?: boolean,
    ocrText?: boolean
  }
}
```

**Response:**
```typescript
{
  success: boolean,
  analysisId: string,
  status: 'queued' | 'processing' | 'complete' | 'failed',
  progress: number,
  estimatedCompletion: string,
  analysisConfig: {
    extractAudio: boolean,
    analyzeFrames: boolean,
    detectMotion: boolean,
    ocrText: boolean
  }
}
```

**Example Request:**
```bash
curl -X POST https://your-domain.com/api/videos/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "video_1703123456789_abc123def",
    "analysisType": "full",
    "options": {
      "extractAudio": true,
      "analyzeFrames": true,
      "detectMotion": true,
      "ocrText": true
    }
  }'
```

**Get Analysis Status:**
**Endpoint:** `GET /api/videos/analyze?analysisId=ANALYSIS_ID`

**Response:**
```typescript
{
  success: boolean,
  analysisId: string,
  status: string,
  progress: number,
  estimatedCompletion: string,
  currentStep: string,
  steps: Array<{
    id: string,
    name: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    progress: number
  }>
}
```

### 3. Recipe Extraction

**Endpoint:** `POST /api/videos/extract-recipe`

**Description:** Extract recipe data from analyzed video

**Request Body:**
```typescript
{
  analysisId: string,
  extractionOptions?: {
    confidenceThreshold?: number,
    includeTiming?: boolean,
    includeNutrition?: boolean,
    language?: string
  }
}
```

**Response:**
```typescript
{
  success: boolean,
  recipe: ImportedRecipeData,
  confidence: number,
  extractionMethod: string,
  recommendations: string[],
  metadata: {
    analysisId: string,
    confidenceThreshold: number,
    includeTiming: boolean,
    includeNutrition: boolean,
    language: string,
    extractionTime: string
  }
}
```

**Example Request:**
```bash
curl -X POST https://your-domain.com/api/videos/extract-recipe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "analysis_1703123456789_xyz789abc",
    "extractionOptions": {
      "confidenceThreshold": 0.8,
      "includeTiming": true,
      "includeNutrition": false,
      "language": "en"
    }
  }'
```

### 4. Video URL Import

**Endpoint:** `POST /api/videos/import-url`

**Description:** Import recipe from social media video URL

**Request Body:**
```typescript
{
  url: string,
  platform?: string,
  options?: {
    priority?: 'low' | 'normal' | 'high',
    processingOptions?: ProcessingOptions
  }
}
```

**Response:**
```typescript
{
  success: boolean,
  videoId: string,
  platform: string,
  processingStatus: string,
  result: {
    recipe: ImportedRecipeData,
    confidence: number,
    extractionMethod: string,
    processingTime: number,
    videoMetadata: VideoMetadata
  }
}
```

**Example Request:**
```bash
curl -X POST https://your-domain.com/api/videos/import-url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.tiktok.com/@chef/video/1234567890",
    "platform": "tiktok"
  }'
```

**Get Supported Platforms:**
**Endpoint:** `GET /api/videos/import-url`

**Response:**
```typescript
{
  success: boolean,
  message: string,
  supportedPlatforms: string[],
  examples: {
    tiktok: string,
    instagram: string,
    youtube: string,
    facebook: string
  }
}
```

### 5. Processing Queue Management

**Endpoint:** `GET /api/videos/queue`

**Description:** Get queue statistics or job status

**Query Parameters:**
- `userId`: Get all jobs for a specific user
- `jobId`: Get status of a specific job

**Response (Queue Stats):**
```typescript
{
  success: boolean,
  stats: {
    totalJobs: number,
    queuedJobs: number,
    processingJobs: number,
    completedJobs: number,
    failedJobs: number,
    averageProcessingTime: number
  }
}
```

**Response (User Jobs):**
```typescript
{
  success: boolean,
  jobs: VideoProcessingJob[],
  count: number
}
```

**Response (Job Status):**
```typescript
{
  success: boolean,
  job: VideoProcessingJob
}
```

**Add Job to Queue:**
**Endpoint:** `POST /api/videos/queue`

**Request Body:**
```typescript
{
  videoId: string,
  platform: string,
  url?: string,
  file?: File,
  priority?: 'low' | 'normal' | 'high',
  processingOptions?: ProcessingOptions
}
```

**Cancel Job:**
**Endpoint:** `DELETE /api/videos/queue?jobId=JOB_ID`

**Update Job:**
**Endpoint:** `PATCH /api/videos/queue`

**Request Body:**
```typescript
{
  jobId: string,
  action: 'retry' | 'priority'
}
```

## Data Types

### ImportedRecipeData
```typescript
interface ImportedRecipeData {
  title: string
  description: string
  imageUrl?: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string
  tags: string[]
  instructions: string[]
  ingredients: Array<{
    quantity: number
    unit: string
    name: string
    notes?: string
  }>
  sourceUrl: string
  isPublic: boolean
  isShared: boolean
}
```

### VideoMetadata
```typescript
interface VideoMetadata {
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'custom'
  title: string
  description: string
  creator: string
  duration: number
  aspectRatio: 'vertical' | 'horizontal' | 'square'
  resolution: { width: number; height: number }
  format: string
  size: number
  uploadDate?: Date
  viewCount?: number
  likes?: number
}
```

### VideoProcessingJob
```typescript
interface VideoProcessingJob {
  id: string
  videoId: string
  url?: string
  file?: File
  platform: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  priority: 'low' | 'normal' | 'high'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  progress: number
  currentStep: string
  estimatedTime: number
  error?: string
  result?: VideoImportResult
  metadata?: VideoMetadata
  retryCount: number
  maxRetries: number
}
```

### ProcessingOptions
```typescript
interface ProcessingOptions {
  extractAudio?: boolean
  analyzeFrames?: boolean
  detectMotion?: boolean
  ocrText?: boolean
  confidenceThreshold?: number
  includeTiming?: boolean
  includeNutrition?: boolean
  language?: string
}
```

## Error Handling

All endpoints return consistent error responses:

```typescript
{
  success: false,
  error: string
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (missing parameters, validation errors)
- `401`: Unauthorized (authentication required)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Rate Limiting

- **Upload Endpoints**: 10 requests per minute per user
- **Analysis Endpoints**: 20 requests per minute per user
- **Queue Endpoints**: 50 requests per minute per user

## File Size Limits

- **Maximum Video Size**: 100MB
- **Maximum Video Duration**: 10 minutes
- **Supported Formats**: MP4, MOV, AVI, MKV, WebM, M4V

## Processing Time Estimates

- **Quick Analysis**: 1-2 minutes
- **Full Analysis**: 3-5 minutes
- **Custom Analysis**: 2-8 minutes (depending on options)

## Platform Support

### TikTok
- **URL Pattern**: `https://www.tiktok.com/@username/video/1234567890`
- **Features**: Direct video download, metadata extraction
- **Limitations**: Rate limited by TikTok API

### Instagram
- **URL Pattern**: `https://www.instagram.com/reel/ABC123/`
- **Features**: Reel and Story support, caption extraction
- **Limitations**: Requires Instagram Graph API access

### YouTube
- **URL Pattern**: `https://youtube.com/shorts/ABC123`
- **Features**: Shorts and regular videos, transcript support
- **Limitations**: YouTube Data API quota

### Facebook
- **URL Pattern**: `https://facebook.com/username/videos/123456789`
- **Features**: Video posts, engagement metrics
- **Limitations**: Facebook Graph API permissions

## Best Practices

### 1. Error Handling
```typescript
try {
  const response = await fetch('/api/videos/upload', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Upload failed')
  }

  const result = await response.json()
  // Handle success
} catch (error) {
  // Handle error
  console.error('Upload failed:', error)
}
```

### 2. Progress Tracking
```typescript
// For long-running operations, poll the status endpoint
const checkStatus = async (analysisId: string) => {
  const response = await fetch(`/api/videos/analyze?analysisId=${analysisId}`)
  const status = await response.json()

  if (status.status === 'completed') {
    // Analysis complete
    return status
  } else if (status.status === 'failed') {
    // Analysis failed
    throw new Error(status.error)
  } else {
    // Still processing, check again in a few seconds
    setTimeout(() => checkStatus(analysisId), 5000)
  }
}
```

### 3. Queue Management
```typescript
// Add job to queue with high priority for urgent videos
const addUrgentJob = async (videoId: string, platform: string) => {
  const response = await fetch('/api/videos/queue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoId,
      platform,
      priority: 'high'
    })
  })

  const result = await response.json()
  return result.jobId
}
```

## Webhook Support (Future)

Planned webhook endpoints for real-time notifications:

```typescript
// Webhook payload structure
{
  event: 'video.processing.completed' | 'video.processing.failed',
  jobId: string,
  videoId: string,
  platform: string,
  result?: VideoImportResult,
  error?: string,
  timestamp: string
}
```

## Monitoring and Analytics

### Queue Metrics
- **Queue Length**: Number of jobs waiting to be processed
- **Processing Time**: Average time to complete a job
- **Success Rate**: Percentage of successful extractions
- **Error Distribution**: Types and frequency of errors

### Performance Metrics
- **API Response Time**: Endpoint performance monitoring
- **File Processing Speed**: MB/second processing rate
- **AI Service Latency**: Time spent in AI analysis
- **Resource Utilization**: CPU, memory, and storage usage

## Security Considerations

### File Upload Security
- **Virus Scanning**: All uploaded files are scanned for malware
- **File Type Validation**: Strict MIME type checking
- **Size Limits**: Enforced file size restrictions
- **Content Filtering**: Automated content moderation

### API Security
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Authentication**: Required for all endpoints
- **Input Validation**: Comprehensive parameter validation
- **CORS Configuration**: Restricted to trusted domains

## Support and Troubleshooting

### Common Issues

1. **File Too Large**
   - Error: "File too large. Maximum size: 100MB"
   - Solution: Compress video or use shorter content

2. **Unsupported Format**
   - Error: "Invalid file type. Please upload a video file."
   - Solution: Convert to supported format (MP4 recommended)

3. **Processing Timeout**
   - Error: "Video processing timed out"
   - Solution: Try again or contact support for long videos

4. **Platform Rate Limit**
   - Error: "Rate limit exceeded. Please try again later."
   - Solution: Wait before making another request

### Getting Help

- **Documentation**: This API documentation
- **Support Email**: api-support@mealforge.com
- **Status Page**: https://status.mealforge.com
- **Community**: https://community.mealforge.com

---

*This documentation covers the complete Video Processing API system. For implementation examples and SDKs, visit our developer portal.*
