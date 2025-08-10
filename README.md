# Eye Coordination Training App

A simple web application designed to help practice eye coordination through visual tracking exercises. The app features a moving shape that follows random waypoints across the screen, providing customizable training for amblyopia and other vision coordination challenges.

## Features

### Core Functionality
- **Full viewport display** - Utilizes the entire browser window for maximum training area
- **Random waypoint movement** - Shape moves linearly between randomly selected targets
- **Edge reflection** - Shape bounces off screen boundaries while maintaining speed
- **Performance optimized** - 60 FPS animation using `requestAnimationFrame` and hardware-accelerated transforms

### Customizable Settings
Access the settings menu via the gear icon in the top-right corner:

- **Theme**: Light (white background, black shape) or Dark (dark blue background, white shape)
- **Shape Size**: Adjustable from 1px to 32px
- **Shape Type**: Circle, Square, Cross, or Cursor
- **Opacity**: Adjustable from 1% to 100%
- **Speed**: Variable from 96 px/s (slow) to 1920 px/s (fast)
- **Turn Type**: 
  - **Angular**: Immediate direction changes toward new targets
  - **Curved**: Smooth turning with constant turn rate
- **Turn Frequency**: Control how often new targets are selected (1.5s to 3s intervals)

### Controls
- **Space**: Pause/Resume animation
- **R**: Reset all settings to defaults
- **T**: Toggle between light and dark themes
- **Settings Icon**: Open/close settings menu

### Persistence
All settings are automatically saved to localStorage and restored on page reload.

## Technical Details

### Performance
- Uses `requestAnimationFrame` for smooth 60 FPS animation
- Delta-time calculations for frame-rate independence
- Hardware-accelerated positioning with `transform: translate3d()`
- Optimized for both desktop and mobile devices

### Responsive Design
- Automatically adapts to viewport changes
- Respects mobile safe-area insets
- Touch-friendly settings interface

### Browser Compatibility
Works in all modern browsers that support:
- ES6 classes and arrow functions
- `requestAnimationFrame`
- CSS `transform3d`
- `localStorage`

## Getting Started

1. Clone or download the repository
2. Open `index.html` in any modern web browser
3. The app will start immediately with default settings
4. Click the settings icon to customize your training experience

## Files Structure

```
cursor-follow/
├── index.html      # Main HTML structure
├── styles.css      # All styling and themes
├── app.js          # Core application logic
└── README.md       # This file
```

## Usage Tips

### For Eye Coordination Training
- Start with larger, more opaque shapes at slower speeds
- Gradually decrease size and increase speed as coordination improves
- Use curved movement for smoother tracking practice
- Switch between themes to practice with different contrast levels

### Performance
- The app targets 60 FPS but will adapt to your device's capabilities
- Close other browser tabs for optimal performance
- Use full-screen mode (F11) for maximum training area

## Development

The application is built with vanilla HTML, CSS, and JavaScript - no build process or dependencies required. The code is structured as a single ES6 class (`EyeTrainingApp`) that handles all functionality including:

- Settings management and persistence
- Animation loop and physics
- User interface interactions
- Responsive layout updates

---

*This app was created as an assistive tool for amblyopia and eye coordination training. Always consult with an eye care professional for medical advice.*