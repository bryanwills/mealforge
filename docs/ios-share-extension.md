# iOS Share Extension for MealForge

## Overview

The iOS Share Extension enables users to share TikTok videos, Instagram Reels, YouTube Shorts, and other video content directly to MealForge from within the source app. This creates a seamless recipe import experience similar to ReciMe.

## Features

- **Native iOS Integration**: Appears in iOS share sheet
- **Multi-Platform Support**: TikTok, Instagram, YouTube, Facebook
- **Direct Video Import**: No need to copy/paste URLs
- **Recipe Extraction**: AI-powered video analysis for 100% accuracy
- **Seamless UX**: One-tap recipe import

## How It Works

### 1. User Experience Flow

```
TikTok App → Share Button → iOS Share Sheet → MealForge → Recipe Import
```

1. User finds a recipe video on TikTok
2. Taps the share button
3. iOS share sheet appears with MealForge option
4. User selects MealForge
5. Video is automatically imported and analyzed
6. Recipe is created with extracted data

### 2. Technical Implementation

#### Share Extension Target
- **Bundle ID**: `com.mealforge.ios.ShareExtension`
- **Target Name**: `MealForgeShareExtension`
- **Deployment Target**: iOS 14.0+

#### Supported Content Types
```swift
// Video URLs
"public.url"
"public.plain-text"

// Video Files
"public.movie"
"public.video"

// Platform-specific
"com.tiktok.video"
"com.instagram.reel"
"com.youtube.short"
```

#### Share Extension Structure
```
MealForgeShareExtension/
├── ShareViewController.swift
├── VideoProcessor.swift
├── RecipeExtractor.swift
├── Info.plist
└── Assets.xcassets
```

### 3. Platform-Specific Handling

#### TikTok
- **URL Pattern**: `https://www.tiktok.com/@username/video/1234567890`
- **Video Extraction**: Direct video download via TikTok API
- **Metadata**: Title, creator, description, view count

#### Instagram Reels
- **URL Pattern**: `https://www.instagram.com/reel/ABC123/`
- **Video Extraction**: Instagram Graph API integration
- **Metadata**: Caption, creator, location, hashtags

#### YouTube Shorts
- **URL Pattern**: `https://youtube.com/shorts/ABC123`
- **Video Extraction**: YouTube Data API v3
- **Metadata**: Title, description, channel, view count

#### Facebook Videos
- **URL Pattern**: `https://facebook.com/username/videos/123456789`
- **Video Extraction**: Facebook Graph API
- **Metadata**: Post text, creator, engagement metrics

## Implementation Steps

### Phase 1: Share Extension Setup

1. **Create Share Extension Target**
   ```bash
   # In Xcode
   File → New → Target → Share Extension
   Product Name: MealForgeShareExtension
   Language: Swift
   ```

2. **Configure Info.plist**
   ```xml
   <key>NSExtension</key>
   <dict>
       <key>NSExtensionMainStoryboard</key>
       <string>MainInterface</string>
       <key>NSExtensionPointIdentifier</key>
       <string>com.apple.share-services</string>
   </dict>
   ```

3. **Add Supported Content Types**
   ```xml
   <key>NSExtensionActivationRule</key>
   <dict>
       <key>NSExtensionActivationSupportsWebURLWithMaxCount</key>
       <integer>1</integer>
       <key>NSExtensionActivationSupportsWebPageWithMaxCount</key>
       <integer>1</integer>
       <key>NSExtensionActivationSupportsMovieWithMaxCount</key>
       <integer>1</integer>
   </dict>
   ```

### Phase 2: Video Processing

1. **Video Download Service**
   ```swift
   class VideoDownloadService {
       func downloadVideo(from url: URL) async throws -> Data
       func extractMetadata(from url: URL) async throws -> VideoMetadata
       func validateVideoFormat(_ data: Data) -> Bool
   }
   ```

2. **Platform Detection**
   ```swift
   enum VideoPlatform: String, CaseIterable {
       case tiktok = "tiktok"
       case instagram = "instagram"
       case youtube = "youtube"
       case facebook = "facebook"
       case custom = "custom"

       static func detect(from url: URL) -> VideoPlatform?
   }
   ```

3. **Video Validation**
   ```swift
   struct VideoValidation {
       let isValid: Bool
       let maxSize: Int64 // 100MB
       let maxDuration: TimeInterval // 10 minutes
       let supportedFormats: [String]
       let errorMessage: String?
   }
   ```

### Phase 3: Recipe Extraction

1. **AI Video Analysis**
   ```swift
   class VideoAnalysisService {
       func analyzeFrames(_ videoData: Data) async throws -> [VideoFrame]
       func transcribeAudio(_ videoData: Data) async throws -> [AudioSegment]
       func detectTextOverlays(_ frames: [VideoFrame]) async throws -> [TextOverlay]
       func analyzeMotion(_ frames: [VideoFrame]) async throws -> [MotionAnalysis]
   }
   ```

2. **Recipe Data Extraction**
   ```swift
   class RecipeExtractor {
       func extractIngredients(from analysis: VideoAnalysis) -> [Ingredient]
       func extractInstructions(from analysis: VideoAnalysis) -> [String]
       func extractTiming(from analysis: VideoAnalysis) -> RecipeTiming
       func extractServings(from analysis: VideoAnalysis) -> Int
   }
   ```

### Phase 4: Data Transfer

1. **App Group Configuration**
   ```xml
   <!-- In both main app and share extension -->
   <key>com.apple.security.application-groups</key>
   <array>
       <string>group.com.mealforge.ios</string>
   </array>
   ```

2. **Shared Data Storage**
   ```swift
   class SharedDataManager {
       func saveVideoImport(_ import: VideoImport) throws
       func getPendingImports() -> [VideoImport]
       func markImportComplete(_ id: UUID) throws
   }
   ```

3. **Deep Linking**
   ```swift
   // In main app
   func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
       if url.scheme == "mealforge" && url.host == "video-import" {
           handleVideoImport(url)
           return true
       }
       return false
   }
   ```

## User Interface

### Share Extension UI

1. **Loading State**
   - Video thumbnail preview
   - Platform detection indicator
   - Progress bar for video processing

2. **Recipe Preview**
   - Extracted recipe title
   - Ingredient list preview
   - Instruction count
   - Confidence score

3. **Import Options**
   - Save to personal recipes
   - Share with community
   - Edit before saving
   - Cancel import

### Main App Integration

1. **Video Import Queue**
   - Pending video imports
   - Processing status
   - Success/failure notifications

2. **Recipe Editor**
   - Pre-filled with extracted data
   - Manual correction options
   - Video thumbnail display
   - Source attribution

## Security & Privacy

### Data Handling
- **Local Processing**: Video analysis happens on device when possible
- **Secure Storage**: Encrypted storage for video files
- **User Consent**: Clear permission requests for video access
- **Data Retention**: Automatic cleanup of temporary files

### Platform Compliance
- **TikTok**: Follow TikTok for Developers guidelines
- **Instagram**: Instagram Basic Display API compliance
- **YouTube**: YouTube Data API terms of service
- **Facebook**: Facebook Platform Policy adherence

## Performance Optimization

### Video Processing
- **Background Processing**: Use background tasks for long videos
- **Chunked Analysis**: Process video in segments
- **Caching**: Cache analysis results for repeated imports
- **Compression**: Optimize video quality vs. processing speed

### Memory Management
- **Streaming**: Process video without loading entire file
- **Frame Sampling**: Analyze every nth frame for efficiency
- **Cleanup**: Automatic memory cleanup after processing

## Testing & Quality Assurance

### Test Scenarios
1. **TikTok Recipe Videos**: Various lengths and formats
2. **Instagram Reels**: Different aspect ratios
3. **YouTube Shorts**: Horizontal and vertical content
4. **Custom Uploads**: Various file formats and sizes

### Performance Metrics
- **Import Success Rate**: Target 95%+
- **Processing Time**: Target <30 seconds for 1-minute videos
- **Memory Usage**: Target <100MB peak
- **Battery Impact**: Minimal battery drain

### Error Handling
- **Network Failures**: Graceful fallback and retry
- **Invalid Videos**: Clear error messages
- **Platform Changes**: Adaptive platform detection
- **API Limits**: Rate limiting and quota management

## Deployment & Distribution

### App Store Requirements
- **Privacy Policy**: Video data handling disclosure
- **App Review**: Demonstrate share extension functionality
- **Testing**: Provide test accounts for review team

### Beta Testing
- **TestFlight**: Internal and external beta testing
- **Feedback Collection**: User experience optimization
- **Performance Monitoring**: Real-world usage metrics

## Future Enhancements

### Advanced Features
- **Batch Import**: Import multiple videos at once
- **Smart Categorization**: Auto-tag recipes by cuisine/type
- **Social Integration**: Share recipes back to platforms
- **Offline Processing**: Process videos without internet

### Platform Expansion
- **TikTok Business**: Enhanced business account features
- **Instagram Shopping**: Product link integration
- **YouTube Premium**: Higher quality video access
- **TikTok Creator**: Creator analytics integration

## Support & Maintenance

### User Support
- **In-App Help**: Video import tutorials
- **FAQ Section**: Common issues and solutions
- **Contact Form**: Direct support requests

### Monitoring & Analytics
- **Usage Metrics**: Import success rates and volumes
- **Error Tracking**: Platform-specific failure patterns
- **Performance Monitoring**: Processing time trends
- **User Feedback**: Feature request collection

---

*This document outlines the complete implementation plan for the iOS Share Extension. The extension will enable MealForge to compete directly with ReciMe by providing seamless video recipe import functionality.*
