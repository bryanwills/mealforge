# MealForge Implementation Plan

## Current Status
- ✅ Basic recipe management (CRUD operations)
- ✅ User authentication with Clerk
- ✅ Recipe import from URL (basic implementation)
- ✅ Recipe import from image (OCR mock)
- ✅ Recipe saving/unsaving functionality
- ✅ Ingredients aggregation and conversion
- ✅ User statistics and dashboard
- ✅ Recipe search and filtering
- ✅ Theme switching (light/dark mode)

## URL Import Accuracy Improvements

### Current Issues Identified
1. **Low Accuracy (~15%)**: Current import shows poor ingredient parsing and incorrect instructions
2. **Title Extraction**: Not properly extracting "Butterfinger Bars" from URL path
3. **Ingredient Parsing**: All ingredients showing as "1 piece" instead of proper quantities
4. **Instruction Accuracy**: Completely wrong instructions being imported
5. **Image Import**: No images being extracted from recipe pages
6. **URL Handling**: No referral link removal or URL cleaning

### Proposed Solutions (Prioritized)

#### Phase 1: Immediate Improvements (Next Steps #1, #4, #5)
**Target: 60-80% accuracy improvement**

1. **Enhanced Web Scraping with Print URL Detection**
   - Detect print-friendly URLs (e.g., `/wprm_print/`, `/print/`, `/print-recipe/`)
   - Automatically redirect to print version when available
   - Parse cleaner HTML structure from print pages
   - Implement fallback to original URL if print version unavailable

2. **Improved Ingredient Parsing with AI-like Logic**
   - Enhanced regex patterns for quantity/unit extraction
   - Fraction parsing (1 1/2 cups → 1.5 cups)
   - Unit normalization (tbsp → tablespoon)
   - Ingredient name cleaning and categorization

3. **Better Title and Metadata Extraction**
   - URL path analysis for title extraction
   - Schema.org structured data parsing
   - Meta tag extraction for description and images
   - Social media meta tags (Open Graph, Twitter Cards)

#### Phase 2: Advanced Solutions (Next Steps #2, #3)
**Target: 85-95% accuracy**

4. **Professional Recipe Scraping Service Integration**
   - Recipe Keeper API integration
   - Zestful API for ingredient parsing
   - Chefkoch API for recipe data extraction
   - Fallback to custom scraping if APIs fail

5. **AI-Powered Ingredient Parsing**
   - OpenAI GPT-4 integration for ingredient parsing
   - Claude API for recipe structure analysis
   - Local AI models for privacy-sensitive parsing
   - Machine learning for continuous improvement

#### Phase 3: Production-Ready Solutions
**Target: 95%+ accuracy**

6. **Headless Browser Scraping (Puppeteer/Playwright)**
   - Full browser rendering for JavaScript-heavy sites
   - Screenshot capture for recipe images
   - Dynamic content extraction
   - Anti-bot detection bypass

7. **Multi-Source Aggregation**
   - Combine multiple scraping methods
   - Confidence scoring for each data point
   - User feedback integration for accuracy improvement
   - A/B testing for different parsing strategies

## Implementation Details

### Print URL Detection Logic

```typescript
interface PrintURLPatterns {
  pattern: RegExp
  replacement: string
  priority: number
}

const PRINT_URL_PATTERNS: PrintURLPatterns[] = [
  {
    pattern: /^https:\/\/[^\/]+\/([^\/]+)$/,
    replacement: 'https://$1/wprm_print/$2',
    priority: 1
  },
  {
    pattern: /^https:\/\/[^\/]+\/([^\/]+)\/([^\/]+)$/,
    replacement: 'https://$1/print/$2',
    priority: 2
  },
  {
    pattern: /^https:\/\/[^\/]+\/([^\/]+)\/([^\/]+)$/,
    replacement: 'https://$1/print-recipe/$2',
    priority: 3
  }
]
```

### Enhanced Scraping Strategy

1. **Primary**: Try print-friendly URL first
2. **Secondary**: Fallback to original URL with enhanced selectors
3. **Tertiary**: Use professional API services
4. **Quaternary**: AI-powered parsing for difficult cases

### Accuracy Metrics

- **Title Accuracy**: 95%+ (extract from URL path)
- **Ingredient Accuracy**: 85%+ (proper quantities and units)
- **Instruction Accuracy**: 90%+ (correct step-by-step)
- **Image Accuracy**: 70%+ (extract recipe images)
- **Metadata Accuracy**: 80%+ (time, servings, difficulty)

## Technical Considerations

### Multiple Solution Integration
**No conflicts expected** - Each solution can be implemented as a fallback chain:

1. **Print URL Detection** → **Enhanced Scraping** → **Professional APIs** → **AI Parsing**
2. **Confidence Scoring**: Each method provides confidence score
3. **User Feedback**: Allow users to correct and improve accuracy
4. **Caching**: Store successful parsing patterns for future use

### Performance Considerations
- **Print URLs**: Faster parsing (cleaner HTML)
- **API Services**: Rate limiting and cost management
- **AI Services**: Token usage optimization
- **Browser Scraping**: Resource-intensive, use sparingly

### Error Handling
- **Graceful Degradation**: Fallback to simpler methods
- **User Notification**: Clear error messages with suggestions
- **Retry Logic**: Automatic retry with different methods
- **Manual Override**: Allow users to manually edit imported data

## Implementation Timeline

### Week 1: Print URL Detection & Enhanced Scraping
- [ ] Implement print URL detection logic
- [ ] Update scraping selectors for print pages
- [ ] Test with iambaker.net and similar sites
- [ ] Add fallback to original URL

### Week 2: Professional API Integration
- [ ] Research and select primary API service
- [ ] Implement API integration with error handling
- [ ] Add rate limiting and cost management
- [ ] Test accuracy improvements

### Week 3: AI-Powered Parsing
- [ ] Integrate OpenAI API for ingredient parsing
- [ ] Implement confidence scoring system
- [ ] Add user feedback collection
- [ ] Optimize token usage

### Week 4: Production Optimization
- [ ] Implement caching for successful patterns
- [ ] Add comprehensive error handling
- [ ] Performance optimization
- [ ] User experience improvements

## Success Metrics

### Accuracy Targets
- **Phase 1**: 60-80% accuracy improvement
- **Phase 2**: 85-95% accuracy
- **Phase 3**: 95%+ accuracy

### User Experience
- **Import Success Rate**: >90%
- **User Satisfaction**: >4.5/5 stars
- **Manual Corrections**: <20% of imports
- **Processing Time**: <10 seconds per import

### Technical Performance
- **API Response Time**: <5 seconds
- **Error Rate**: <5%
- **Cost per Import**: <$0.01
- **Scalability**: Support 1000+ imports/day

## Risk Mitigation

### API Dependencies
- **Multiple Providers**: Reduce single point of failure
- **Fallback Chains**: Always have backup methods
- **Cost Monitoring**: Track API usage and costs
- **Rate Limiting**: Respect API limits

### Accuracy Concerns
- **User Feedback Loop**: Learn from corrections
- **A/B Testing**: Compare different methods
- **Manual Override**: Always allow user editing
- **Transparency**: Show confidence scores to users

### Performance Issues
- **Caching Strategy**: Cache successful patterns
- **Async Processing**: Don't block UI during import
- **Progress Indicators**: Show import progress
- **Timeout Handling**: Graceful timeout management

## Future Enhancements

### Advanced Features
- **Recipe Validation**: Check for common recipe patterns
- **Nutrition Calculation**: Auto-calculate nutrition facts
- **Ingredient Substitution**: Suggest ingredient alternatives
- **Recipe Scaling**: Adjust quantities for different servings

### User Experience
- **Import History**: Track successful import patterns
- **Favorite Sources**: Remember user's preferred sites
- **Batch Import**: Import multiple recipes at once
- **Recipe Templates**: Pre-defined recipe structures

### Integration Opportunities
- **Grocery List Integration**: Auto-add ingredients to lists
- **Meal Planning**: Suggest recipes based on ingredients
- **Social Sharing**: Share imported recipes
- **Recipe Rating**: Rate imported recipe accuracy
- **Pantry Recipe Suggestions**: Suggest recipes based on pantry ingredients
- **Restaurant Roulette**: Suggest a restaurant based on dietary preferences and recipes made