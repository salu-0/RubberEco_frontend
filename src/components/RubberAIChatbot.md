# Rubber AI Chatbot

## Overview
The Rubber AI Chatbot is a specialized AI assistant powered by Google's Gemini AI that provides expert guidance on rubber plantation farming. It's designed to help farmers, agricultural professionals, and enthusiasts with comprehensive information about rubber cultivation.

## Features

### 🤖 AI-Powered Responses
- Powered by Google Gemini Pro AI model
- Specialized knowledge base for rubber plantation farming
- Human-like conversational interface
- Context-aware responses

### 🌱 Specialized Topics Coverage
1. **Land Preparation and Planting Techniques**
2. **Ideal Climate and Soil Conditions**
3. **Irrigation and Fertilization Practices**
4. **Pest and Disease Identification and Management**
5. **Harvesting and Latex Collection Methods**
6. **Post-Harvest Handling and Storage**
7. **Market Prices and Selling Options**
8. **Government Subsidies or Schemes**
9. **Organic vs. Conventional Rubber Farming**
10. **Sustainability and Environmental Impact**

### 🎨 User Interface Features
- **Floating Chat Button**: Always accessible from the bottom-right corner
- **Minimizable Window**: Can be minimized while keeping the conversation
- **Quick Suggestions**: Pre-defined topic buttons for easy access
- **Typing Indicators**: Shows when AI is processing
- **Message Timestamps**: Track conversation history
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Animations**: Enhanced user experience with Framer Motion

### 🔧 Technical Features
- **Error Handling**: Graceful handling of API failures
- **Rate Limiting**: Manages API quota efficiently
- **Safety Filters**: Content safety measures
- **Environment Variables**: Secure API key management
- **Custom Styling**: Tailored CSS animations and effects

## Installation & Setup

### 1. Environment Configuration
Add the Gemini API key to your `.env` file:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Component Integration
The chatbot is already integrated into the Home page:
```jsx
import RubberAIChatbot from '../components/RubberAIChatbot';

// In your component
<RubberAIChatbot />
```

### 3. Dependencies
Ensure these packages are installed:
```json
{
  "framer-motion": "^10.x.x",
  "lucide-react": "^0.x.x"
}
```

## Usage Examples

### Quick Start Questions
- "How to prepare land for rubber planting?"
- "Best irrigation practices for rubber trees?"
- "Common rubber tree diseases and treatment?"
- "When is the best time to harvest latex?"
- "Current rubber market prices and trends?"
- "Government subsidies for rubber farmers?"

### Advanced Queries
- "What's the ideal spacing between rubber trees for maximum yield?"
- "How to identify and treat pink disease in rubber trees?"
- "Organic fertilizer recommendations for young rubber plants?"
- "Post-harvest latex processing techniques?"
- "Climate change impact on rubber cultivation?"

## API Configuration

### Gemini AI Settings
```javascript
generationConfig: {
  temperature: 0.7,        // Balanced creativity
  topK: 40,               // Token selection diversity
  topP: 0.95,             // Nucleus sampling
  maxOutputTokens: 1024,  // Response length limit
}
```

### Safety Settings
- Harassment: BLOCK_MEDIUM_AND_ABOVE
- Hate Speech: BLOCK_MEDIUM_AND_ABOVE
- Sexually Explicit: BLOCK_MEDIUM_AND_ABOVE
- Dangerous Content: BLOCK_MEDIUM_AND_ABOVE

## Customization

### Styling
Modify `RubberAIChatbot.css` for custom styling:
- Chat window dimensions
- Color schemes
- Animation effects
- Button styles

### System Context
Update the `SYSTEM_CONTEXT` variable to modify AI behavior:
```javascript
const SYSTEM_CONTEXT = `Your custom system prompt here...`;
```

### Quick Suggestions
Add or modify quick suggestion topics:
```javascript
const quickSuggestions = [
  { icon: TreePine, text: "Your question", category: "Category" },
  // Add more suggestions
];
```

## Error Handling

### Common Issues
1. **API Key Missing**: Check environment variable configuration
2. **Rate Limiting**: Implement request throttling
3. **Network Issues**: Graceful fallback messages
4. **Invalid Responses**: Content safety filtering

### Error Messages
- API configuration errors
- Rate limit exceeded
- Network connectivity issues
- Content safety violations

## Performance Optimization

### Best Practices
1. **Lazy Loading**: Component loads only when needed
2. **Message Caching**: Store conversation history locally
3. **API Throttling**: Prevent excessive API calls
4. **Efficient Rendering**: Optimized React components

### Memory Management
- Automatic message cleanup for long conversations
- Efficient state management
- Proper component unmounting

## Security Considerations

### API Key Protection
- Store in environment variables
- Never expose in client-side code
- Use server-side proxy for production

### Content Filtering
- Built-in safety filters
- Custom content validation
- User input sanitization

## Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Mobile Responsiveness
- Touch-friendly interface
- Responsive design
- Mobile-optimized animations
- Keyboard handling

## Future Enhancements
- Voice input/output
- Multi-language support
- Conversation export
- Integration with farm management systems
- Offline mode with cached responses
- Advanced analytics and insights

## Support
For technical support or feature requests, contact the development team or create an issue in the project repository.

## License
This component is part of the RubberEco platform and follows the project's licensing terms.