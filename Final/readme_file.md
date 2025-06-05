# OpenGrammar - Modern AI-Powered Grammar Checker

A sophisticated, modern grammar checking application built with vanilla JavaScript, featuring advanced AI analysis, real-time corrections, and comprehensive writing metrics.

## 🌟 Features

### Core Functionality
- **Real-time Grammar Checking** - Advanced AI-powered grammar and spelling analysis
- **Style Analysis** - Comprehensive writing style evaluation and suggestions
- **Document Metrics** - Detailed readability scores and text statistics
- **Multi-format Support** - Upload and analyze various file formats (.txt, .doc, .docx, .pdf, images)
- **Synonym Suggestions** - Context-aware synonym recommendations
- **Export Reports** - Generate detailed PDF analysis reports

### User Experience
- **Modern UI/UX** - Clean, responsive design with smooth animations
- **Dark/Light Theme** - Automatic theme detection based on system preferences
- **Keyboard Shortcuts** - Efficient navigation and actions
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Accessibility** - WCAG compliant with proper ARIA labels and keyboard navigation

### Technical Features
- **Vanilla JavaScript** - No external dependencies, fast loading
- **CSS Custom Properties** - Modern styling with CSS variables
- **Local Storage** - Auto-save functionality for user convenience
- **Progressive Enhancement** - Works without JavaScript for basic functionality
- **Performance Optimized** - Debounced inputs, lazy loading, efficient DOM updates

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for file upload functionality)
- Internet connection (for AI analysis and synonym lookup)

### Installation

1. **Clone or download the files:**
   ```bash
   git clone https://github.com/yourusername/opengrammar.git
   cd opengrammar
   ```

2. **Set up the file structure:**
   ```
   opengrammar/
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── static/
   │   └── logo.PNG
   └── README.md
   ```

3. **Start a local server:**
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Python 2
   python -m SimpleHTTPServer 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```

4. **Open in browser:**
   Navigate to `http://localhost:8000`

### Configuration

Update the API endpoint in `script.js`:
```javascript
this.config = {
    apiBaseUrl: 'your-api-endpoint-here',
    // ... other config options
};
```

## 📖 Usage Guide

### Basic Usage

1. **Enter Text:** Type or paste your text into the editor
2. **Analyze:** Click "Analyze Text" or press `Ctrl+Enter`
3. **Review:** Check suggestions in the results panel
4. **Apply:** Accept individual corrections or all at once
5. **Export:** Download a detailed PDF report

### Advanced Features

#### File Upload
- Drag and drop files onto the upload area
- Supports: `.txt`, `.doc`, `.docx`, `.pdf`, `.png`, `.jpg`, `.jpeg`
- Maximum file size: 10MB

#### Synonym Lookup
- Double-click any word in the editor
- Browse context-appropriate synonyms
- Click to replace with selected synonym

#### Writing Goals & Tone
- Set writing goal: Academic, Business, Email, Creative, Technical
- Choose tone: Formal, Informal, Professional, Friendly, Technical
- Get targeted suggestions based on your selections

#### Keyboard Shortcuts
- `Ctrl+Enter` - Analyze text
- `Ctrl+S` - Save text locally
- `Escape` - Close modals/tooltips
- `Tab` - Navigate through corrections

### Analysis Tabs

#### Corrections Tab
- View all grammar and style issues
- See original vs. corrected text
- Detailed explanation of each issue
- Accept or dismiss individual suggestions

#### Document Analysis Tab
- Overall quality metrics
- Readability scores (Flesch-Kincaid, Gunning Fog)
- Character, word, sentence counts
- Lexical diversity analysis

#### Paragraph Analysis Tab
- Paragraph-by-paragraph breakdown
- Topic sentence strength
- Development quality assessment
- Unity and coherence scores

## 🛠 Customization

### Styling
The application uses CSS custom properties for easy theming:

```css
:root {
  --primary: #3b82f6;
  --secondary: #8b5cf6;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  /* ... more variables */
}
```

### Configuration Options
Modify the configuration object in `script.js`:

```javascript
this.config = {
    apiBaseUrl: 'your-api-endpoint',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFileTypes: ['.txt', '.doc', '.docx', '.pdf'],
    autoSaveDelay: 2000, // ms
    animationDuration: 300 // ms
};
```

### Adding New Features

1. **Extend the GrammarChecker class:**
   ```javascript
   class ExtendedGrammarChecker extends GrammarChecker {
       constructor() {
           super();
           this.initCustomFeatures();
       }
       
       initCustomFeatures() {
           // Your custom initialization
       }
   }
   ```

2. **Add new UI components:**
   - Update `index.html` with new elements
   - Add corresponding styles in `styles.css`
   - Implement functionality in `script.js`

## 🔧 API Integration

The application expects the following API endpoints:

### POST `/check_grammar`
```json
{
  "text": "Text to analyze",
  "goal": "academic|business|email|creative|technical",
  "tone": "formal|informal|professional|friendly|technical",
  "include_metrics": true,
  "include_suggestions": true
}
```

### POST `/upload_file`
- FormData with file upload
- Returns extracted text content

### POST `/generate_pdf`
- Analysis data for PDF generation
- Returns PDF blob

### GET `/get_synonyms/:word`
- Returns array of synonyms for the given word

## 🎨 Design System

### Color Palette
- **Primary:** Blue gradient (#3b82f6 → #2563eb)
- **Secondary:** Purple gradient (#8b5cf6 → #7c3aed)
- **Success:** Green (#10b981)
- **Warning:** Amber (#f59e0b)
- **Error:** Red (#ef4444)

### Typography
- **Font Family:** Inter, system fonts
- **Sizes:** 12px - 30px with consistent scale
- **Weights:** 300, 400, 500, 600, 700, 800

### Spacing
- **Base unit:** 0.25rem (4px)
- **Scale:** 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Animations
- **Duration:** 150ms (fast), 200ms (base), 300ms (slow)
- **Easing:** ease-out for most interactions
- **Hover effects:** Subtle scale and shadow changes

## 📱 Browser Support

- **Chrome:** 60+
- **Firefox:** 55+
- **Safari:** 12+
- **Edge:** 79+

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced features require modern browser APIs
- Graceful degradation for older browsers

## 🚀 Performance

### Optimization Techniques
- **Debounced inputs** - Prevents excessive API calls
- **Lazy loading** - Components loaded when needed
- **Efficient DOM updates** - Minimal reflows and repaints
- **CSS containment** - Isolated rendering contexts
- **Web Workers** - Heavy computations off main thread (planned)

### Performance Metrics
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms

## 🔒 Security

### Client-side Security
- **Input sanitization** - All user inputs escaped
- **HTTPS only** - Secure API communications
- **No eval()** - No dynamic code execution
- **CSP headers** - Content Security Policy implementation

### Privacy
- **No tracking** - No analytics or tracking scripts
- **Local storage only** - Text saved locally, not transmitted
- **GDPR compliant** - No personal data collection

## 🧪 Testing

### Manual Testing Checklist
- [ ] Text input and editing
- [ ] Grammar analysis and corrections
- [ ] File upload functionality
- [ ] Synonym suggestions
- [ ] PDF export
- [ ] Responsive design
- [ ] Keyboard navigation
- [ ] Error handling

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## 🐛 Troubleshooting

### Common Issues

**Analysis not working:**
- Check API endpoint configuration
- Verify internet connection
- Check browser console for errors

**File upload failing:**
- Ensure file size < 10MB
- Check supported file formats
- Verify server permissions

**Styling issues:**
- Clear browser cache
- Check CSS file loading
- Verify custom property support

**Performance issues:**
- Disable browser extensions
- Check available memory
- Reduce text length for testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use 4 spaces for indentation
- Follow existing naming conventions
- Comment complex logic
- Update documentation

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Muhammad Muneeb**
- Email: muneebsiddique007@gmail.com
- Location: Queensland, Australia
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Inter font family by Google Fonts
- Font Awesome for icons
- Datamuse API for synonym lookup
- Community feedback and contributions

## 📈 Roadmap

### Version 2.0 (Planned)
- [ ] Real-time collaboration
- [ ] Plugin system
- [ ] Advanced AI models
- [ ] Offline mode
- [ ] Multi-language support
- [ ] Browser extension

### Version 1.1 (In Progress)
- [ ] Improved error handling
- [ ] Enhanced accessibility
- [ ] Performance optimizations
- [ ] Additional file formats
- [ ] Custom themes

---

**Built with ❤️ using modern web technologies**