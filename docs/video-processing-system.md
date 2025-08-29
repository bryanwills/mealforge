# Video Processing System Documentation

## Overview

The Video Processing System is a comprehensive, AI-powered solution for extracting recipes from video content with 95%+ accuracy. The system supports both file uploads and URL imports from social media platforms, providing real-time processing, confidence scoring, and persistent storage.

## System Architecture

```
Frontend Components → Backend APIs → Video Processing Queue → AI Services → Database
       ↓                    ↓              ↓                    ↓           ↓
Video Import UI    → REST Endpoints → Job Management → AI Analysis → PostgreSQL
Processing Status  → File Handling → Progress Track → Confidence → User Data
Recipe Preview     → Error Handling → Retry Logic → Fallbacks → Audit Trail
```

## Core Components

### 1. Frontend Components

#### VideoImportZone
- **Purpose**: Main interface for video import (drag & drop, URL input)
- **Features**: File validation, platform detection, progress indication
- **Location**: `src/components/video-import-zone.tsx`

#### VideoProcessingStatus
- **Purpose**: Real-time display of processing progress and status
- **Features**: Step-by-step progress, estimated time, error handling
- **Location**: `src/components/video-processing-status.tsx`

#### VideoRecipePreview
- **Purpose**: Preview and edit extracted recipe data
- **Features**: Inline editing, confidence indicators, metadata display
- **Location**: `src/components/video-recipe-preview.tsx`

### 2. Backend APIs

#### Video Upload API (`/api/videos/upload`)
- **Purpose**: Handle video file uploads and processing
- **Features**: File validation, MIME type checking, size limits
- **Methods**: POST (upload), GET (supported formats)

#### Video Analysis API (`/api/videos/analyze`)
- **Purpose**: Initiate and monitor AI-powered video analysis
- **Features**: Analysis configuration, progress tracking, status updates
- **Methods**: POST (start analysis), GET (check status)

#### Recipe Extraction API (`/api/videos/extract-recipe`)
- **Purpose**: Extract recipe data from analyzed video content
- **Features**: Confidence scoring, recommendations, metadata
- **Methods**: POST (extract), GET (retrieve results)

#### Video URL Import API (`/api/videos/import-url`)
- **Purpose**: Import recipes from social media video URLs
- **Features**: Platform detection, URL validation, metadata extraction
- **Methods**: POST (import), GET (supported platforms)

#### Queue Management API (`/api/videos/queue`)
- **Purpose**: Manage video processing queue and jobs
- **Features**: Job status, cancellation, retry, statistics
- **Methods**: GET (stats/jobs), POST (add job), DELETE (cancel), PATCH (update)

### 3. Core Services

#### VideoImportService
- **Purpose**: Core video processing and recipe extraction logic
- **Features**: Multi-modal AI analysis, confidence scoring, fallback handling
- **Location**: `src/lib/video-import-service.ts`

#### VideoProcessingQueue
- **Purpose**: Background job processing with persistent storage
- **Features**: Priority queuing, concurrent processing, retry logic
- **Location**: `src/lib/video-processing-queue.ts`

#### VideoDatabaseService
- **Purpose**: Database operations for video processing entities
- **Features**: CRUD operations, user management, search capabilities
- **Location**: `src/lib/video-database-service.ts`

## Database Schema

### Core Tables

#### VideoProcessingJob
```sql
- id: String (Primary Key)
- videoId: String (Unique)
- userId: String (Foreign Key to User)
- platform: String (tiktok, instagram, youtube, facebook, custom)
- status: String (queued, processing, completed, failed)
- priority: String (low, normal, high)
- progress: Int (0-100)
- currentStep: String
- estimatedTime: Int (seconds)
- error: String?
- retryCount: Int
- maxRetries: Int
- createdAt: DateTime
- startedAt: DateTime?
- completedAt: DateTime?
```

#### VideoAnalysis
```sql
- id: String (Primary Key)
- jobId: String (Foreign Key to VideoProcessingJob)
- videoId: String
- analysisType: String (full, quick, custom)
- status: String (queued, processing, completed, failed)
- progress: Int (0-100)
- currentStep: String?
- estimatedCompletion: DateTime?
- analysisConfig: Json
- frames: Json (extracted video frames)
- audioSegments: Json (transcription data)
- textOverlays: Json (OCR results)
- motionAnalysis: Json (action detection)
- confidence: Float (0.0-1.0)
- error: String?
- createdAt: DateTime
- updatedAt: DateTime
```

#### VideoRecipe
```sql
- id: String (Primary Key)
- jobId: String (Foreign Key to VideoProcessingJob)
- videoId: String
- userId: String (Foreign Key to User)
- title: String
- description: String?
- imageUrl: String?
- prepTime: Int (minutes)
- cookTime: Int (minutes)
- servings: Int
- difficulty: String (easy, medium, hard)
- cuisine: String?
- tags: String[]
- instructions: String[]
- ingredients: Json[]
- sourceUrl: String?
- isPublic: Boolean
- isShared: Boolean
- confidence: Float (0.0-1.0)
- extractionMethod: String
- recommendations: Json
- metadata: Json
- createdAt: DateTime
- updatedAt: DateTime
```

#### VideoFile
```sql
- id: String (Primary Key)
- filename: String
- originalName: String
- mimeType: String
- size: Int (bytes)
- path: String
- platform: String?
- metadata: Json?
- status: String (uploaded, processing, completed, failed)
- userId: String (Foreign Key to User)
- createdAt: DateTime
- updatedAt: DateTime
```

#### VideoImportLog
```sql
- id: String (Primary Key)
- videoId: String
- userId: String (Foreign Key to User)
- action: String (upload, analyze, extract, save)
- status: String (success, failed)
- details: Json?
- error: String?
- processingTime: Int? (milliseconds)
- createdAt: DateTime
```

## AI Processing Pipeline

### 1. Video Analysis Stages

#### Frame Extraction
- **Purpose**: Extract key frames for object detection and text recognition
- **AI Services**: Computer vision APIs, OCR services
- **Output**: Array of frames with detected objects and text

#### Audio Transcription
- **Purpose**: Convert speech to text for instruction extraction
- **AI Services**: Speech-to-text APIs (Whisper, Google Speech)
- **Output**: Timestamped transcript segments with confidence scores

#### Motion Analysis
- **Purpose**: Detect cooking actions and timing
- **AI Services**: Action recognition, motion tracking
- **Output**: Cooking actions, timing data, confidence scores

#### Text Recognition
- **Purpose**: Extract text overlays and ingredient lists
- **AI Services**: OCR services, text analysis
- **Output**: Text content with position and confidence

### 2. Recipe Extraction Process

#### Ingredient Parsing
- **Input**: Text overlays, audio transcript, detected objects
- **Process**: AI-powered ingredient recognition and measurement parsing
- **Output**: Structured ingredient data with quantities and units

#### Instruction Generation
- **Input**: Audio transcript, motion analysis, text overlays
- **Process**: AI interpretation of cooking steps and timing
- **Output**: Sequential cooking instructions

#### Metadata Extraction
- **Input**: Video content, platform data, user context
- **Process**: AI analysis of recipe characteristics
- **Output**: Difficulty, cuisine, prep/cook times, servings

### 3. Confidence Scoring

#### Multi-Source Aggregation
- **Sources**: Frame analysis, audio transcription, text recognition, motion detection
- **Algorithm**: Weighted confidence scoring based on source reliability
- **Output**: Overall confidence score (0.0-1.0)

#### Quality Indicators
- **High Confidence (0.9+)**: Clear video, good audio, readable text
- **Medium Confidence (0.7-0.9)**: Some noise, partial clarity
- **Low Confidence (<0.7)**: Poor quality, unclear content

## Platform Support

### Social Media Platforms

#### TikTok
- **URL Pattern**: `https://www.tiktok.com/@username/video/1234567890`
- **Features**: Direct video download, metadata extraction
- **Limitations**: Rate limiting, API access requirements

#### Instagram
- **URL Pattern**: `https://www.instagram.com/reel/ABC123/`
- **Features**: Reel and Story support, caption extraction
- **Limitations**: Instagram Graph API access required

#### YouTube
- **URL Pattern**: `https://youtube.com/shorts/ABC123`
- **Features**: Shorts and regular videos, transcript support
- **Limitations**: YouTube Data API quota limits

#### Facebook
- **URL Pattern**: `https://facebook.com/username/videos/123456789`
- **Features**: Video posts, engagement metrics
- **Limitations**: Facebook Graph API permissions

### File Upload Support

#### Supported Formats
- **MP4**: Most compatible, recommended format
- **MOV**: Apple ecosystem compatibility
- **AVI**: Legacy format support
- **MKV**: High-quality container format
- **WebM**: Web-optimized format
- **M4V**: iTunes video format

#### File Limits
- **Maximum Size**: 100MB
- **Maximum Duration**: 10 minutes
- **Resolution**: Up to 4K (3840x2160)

## User Experience Flow

### 1. Video Import Process

#### Step 1: Import Selection
- User chooses between file upload or URL input
- Platform detection for URL imports
- File validation and size checking

#### Step 2: Processing Queue
- Video added to processing queue
- Priority assignment based on user tier
- Real-time progress updates

#### Step 3: AI Analysis
- Multi-modal content analysis
- Progress tracking for each stage
- Estimated completion time

#### Step 4: Recipe Preview
- Extracted recipe data display
- Confidence indicators for each field
- Inline editing capabilities

#### Step 5: Save and Share
- Recipe validation and finalization
- Save to user's recipe collection
- Optional sharing and publishing

### 2. Progress Tracking

#### Real-Time Updates
- **Queue Position**: Current position in processing queue
- **Processing Stage**: Current analysis stage
- **Progress Bar**: Visual progress indication
- **Time Estimates**: Remaining processing time

#### Status Indicators
- **Queued**: Waiting in processing queue
- **Processing**: Currently being analyzed
- **Completed**: Analysis finished successfully
- **Failed**: Analysis failed with error details

## Error Handling

### 1. Common Error Scenarios

#### File Upload Errors
- **Invalid Format**: Unsupported video format
- **File Too Large**: Exceeds size limits
- **Corrupted File**: File integrity issues
- **Network Timeout**: Upload interruption

#### Processing Errors
- **AI Service Failure**: External AI service unavailable
- **Analysis Timeout**: Processing exceeds time limits
- **Memory Issues**: System resource constraints
- **Database Errors**: Storage or retrieval failures

#### Platform Errors
- **Rate Limiting**: API quota exceeded
- **Access Denied**: Platform restrictions
- **Content Unavailable**: Video removed or private
- **Network Issues**: Connection problems

### 2. Error Recovery

#### Automatic Retry
- **Retry Logic**: Up to 3 automatic retry attempts
- **Exponential Backoff**: Increasing delay between retries
- **Error Classification**: Retryable vs. non-retryable errors

#### Fallback Mechanisms
- **Alternative AI Services**: Switch to backup providers
- **Simplified Analysis**: Reduce analysis complexity
- **Manual Processing**: Human review for failed cases

#### User Notification
- **Error Messages**: Clear explanation of issues
- **Recovery Options**: Suggested actions for users
- **Support Contact**: Direct support access

## Performance Optimization

### 1. Processing Efficiency

#### Concurrent Processing
- **Queue Management**: Multiple jobs processed simultaneously
- **Resource Allocation**: CPU and memory optimization
- **Load Balancing**: Distribute processing across resources

#### Caching Strategies
- **Analysis Results**: Cache completed analysis data
- **User Preferences**: Store user-specific settings
- **Platform Data**: Cache platform metadata

#### Batch Operations
- **Multiple Videos**: Process multiple videos together
- **Bulk Operations**: Efficient database operations
- **Resource Sharing**: Shared resources across jobs

### 2. Scalability Considerations

#### Horizontal Scaling
- **Multiple Instances**: Deploy across multiple servers
- **Load Distribution**: Balance processing load
- **Database Sharding**: Distribute data across databases

#### Vertical Scaling
- **Resource Upgrades**: Increase server capacity
- **Memory Optimization**: Efficient memory usage
- **CPU Optimization**: Multi-threading and parallel processing

## Security and Privacy

### 1. Data Protection

#### User Isolation
- **Data Segregation**: User data completely isolated
- **Access Control**: User-specific data access
- **Authentication**: Secure user verification

#### File Security
- **Virus Scanning**: All uploaded files scanned
- **Content Filtering**: Automated content moderation
- **Secure Storage**: Encrypted file storage

#### Privacy Compliance
- **GDPR Compliance**: European privacy regulations
- **Data Retention**: Configurable data retention policies
- **User Consent**: Explicit consent for data processing

### 2. API Security

#### Authentication
- **Token-Based**: Secure API token authentication
- **Rate Limiting**: Prevent API abuse
- **Request Validation**: Comprehensive input validation

#### Access Control
- **Role-Based**: User role permissions
- **Resource Limits**: User-specific resource quotas
- **Audit Logging**: Complete access audit trail

## Monitoring and Analytics

### 1. System Metrics

#### Performance Monitoring
- **Processing Time**: Average job completion time
- **Queue Length**: Number of jobs waiting
- **Success Rate**: Percentage of successful extractions
- **Error Distribution**: Types and frequency of errors

#### Resource Utilization
- **CPU Usage**: Processing resource consumption
- **Memory Usage**: Memory allocation and usage
- **Storage Usage**: Database and file storage
- **Network Usage**: API request and response metrics

### 2. User Analytics

#### Usage Patterns
- **Import Frequency**: User import patterns
- **Platform Preferences**: Most used platforms
- **Success Rates**: User-specific success rates
- **Feature Usage**: Most used features

#### Quality Metrics
- **Confidence Scores**: Distribution of confidence levels
- **User Feedback**: User satisfaction ratings
- **Edit Frequency**: How often users edit extracted data
- **Save Rate**: Percentage of imported recipes saved

## Deployment and Operations

### 1. Environment Setup

#### Prerequisites
- **Node.js**: Version 18+ required
- **PostgreSQL**: Database server setup
- **Redis**: Optional for caching and job queuing
- **AI Services**: API keys for AI providers

#### Configuration
- **Environment Variables**: Database, API keys, service URLs
- **Database Migration**: Prisma schema deployment
- **Service Dependencies**: External service configuration
- **Monitoring Setup**: Logging and metrics configuration

### 2. Production Deployment

#### Infrastructure
- **Load Balancer**: Distribute incoming requests
- **Application Servers**: Multiple app instances
- **Database Cluster**: High-availability database setup
- **File Storage**: Scalable file storage solution

#### Monitoring
- **Health Checks**: Service availability monitoring
- **Performance Metrics**: Real-time performance tracking
- **Error Alerting**: Automated error notifications
- **Capacity Planning**: Resource usage forecasting

## Future Enhancements

### 1. Advanced AI Features

#### Multi-Language Support
- **Language Detection**: Automatic language identification
- **Translation**: Multi-language recipe extraction
- **Cultural Adaptation**: Region-specific recipe formatting

#### Enhanced Analysis
- **Nutritional Analysis**: Calorie and nutrient estimation
- **Allergen Detection**: Common allergen identification
- **Dietary Classification**: Vegetarian, vegan, gluten-free detection

### 2. Platform Expansion

#### Additional Social Media
- **Twitter**: Video tweet support
- **Pinterest**: Pin video recipes
- **Snapchat**: Story video import
- **TikTok Business**: Commercial account support

#### Video Platforms
- **Vimeo**: High-quality video support
- **Dailymotion**: Alternative video platform
- **Twitch**: Live stream recipe extraction
- **YouTube Shorts**: Enhanced short video support

### 3. User Experience

#### Mobile Integration
- **iOS App**: Native iOS application
- **Android App**: Android platform support
- **Share Extensions**: Direct platform integration
- **Offline Support**: Local processing capabilities

#### Collaboration Features
- **Recipe Sharing**: Social recipe sharing
- **Community Recipes**: User-generated content
- **Recipe Collections**: Curated recipe collections
- **Collaborative Editing**: Multi-user recipe editing

## Support and Troubleshooting

### 1. Common Issues

#### Import Failures
- **Check File Format**: Ensure supported video format
- **Verify File Size**: Check file size limits
- **Network Connection**: Ensure stable internet connection
- **Platform Access**: Verify platform availability

#### Processing Delays
- **Queue Position**: Check current queue position
- **System Load**: High system load may cause delays
- **AI Service Status**: External service availability
- **Resource Constraints**: System resource limitations

### 2. Getting Help

#### Documentation
- **API Reference**: Complete API documentation
- **User Guides**: Step-by-step user instructions
- **Troubleshooting**: Common problem solutions
- **FAQ**: Frequently asked questions

#### Support Channels
- **Email Support**: Direct support contact
- **Community Forum**: User community support
- **Status Page**: System status and updates
- **Developer Portal**: Technical documentation

---

*This documentation covers the complete Video Processing System. For implementation examples, API references, and technical details, refer to the specific component documentation and code comments.*
