# Vapi Phone Interface

<div align="center">
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Next.js-13+-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vapi.ai-Voice_AI-FF6B6B?style=for-the-badge" alt="Vapi.ai">
</div>

<div align="center">
  <h3>A Professional Mobile-First Voice Assistant Interface</h3>
  <p>Elegant phone-style UI for seamless AI voice conversations powered by Vapi.ai</p>
</div>

---

## 🌟 Features

### 📱 **Mobile-First Design**

- Responsive phone-like interface
- Professional black theme with subtle animations
- Touch-optimized controls for mobile devices
- Authentic smartphone status bar and layout

### 🎙️ **Voice Capabilities**

- Real-time voice conversations with AI
- One-touch call initiation and termination
- Live call duration tracking
- Connection status indicators with visual feedback

### 🎨 **Premium UI/UX**

- Sleek dark theme for professional appearance
- Smooth animations and transitions
- Visual call state indicators (connecting, connected, error)
- Intuitive single-button interface

### ⚡ **Performance**

- Lightweight React component
- Efficient state management
- Dynamic SDK loading
- Proper cleanup and memory management

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.0 or higher
- **React** 18.0 or higher
- **Next.js** 13.0 or higher (optional)
- **Vapi.ai** account with API credentials

### Installation

1. **Clone or copy the component**

   ```bash
   # Create your project directory
   mkdir vapi-phone-interface
   cd vapi-phone-interface
   ```

2. **Install dependencies**

   ```bash
   npm install react react-dom
   # If using Next.js
   npm install next
   # For styling
   npm install tailwindcss
   ```

3. **Set up environment variables**

   ```bash
   # Create .env.local file
   touch .env.local
   ```

   Add your Vapi credentials:

   ```env
   NEXT_PUBLIC_VAPI_API_KEY=your_actual_vapi_api_key_here
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_actual_assistant_id_here
   ```

4. **Import and use the component**

   ```jsx
   import VapiPhoneInterface from "./components/VapiPhoneInterface";

   export default function App() {
     return <VapiPhoneInterface />;
   }
   ```

---

## ⚙️ Configuration

### Required Environment Variables

| Variable                        | Description                  | Example               |
| ------------------------------- | ---------------------------- | --------------------- |
| `NEXT_PUBLIC_VAPI_API_KEY`      | Your Vapi.ai API key         | `sk-xxx...xxx`        |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Your configured assistant ID | `assistant_123...abc` |

### Getting Vapi.ai Credentials

1. **Sign up** at [Vapi.ai](https://vapi.ai)
2. **Create an Assistant** in your dashboard
3. **Copy your API Key** from the settings
4. **Copy your Assistant ID** from the assistant configuration

---

## 🎯 Usage

### Basic Implementation

```jsx
import VapiPhoneInterface from "./VapiPhoneInterface";

function App() {
  return (
    <div className="App">
      <VapiPhoneInterface />
    </div>
  );
}
```

### Call States

The interface handles multiple call states automatically:

- **🔵 Idle**: Ready to initiate calls
- **🟡 Connecting**: Establishing connection with animated indicators
- **🟢 Connected**: Active call with live timer
- **🔴 Error**: Connection failures with error messages
- **⚫ Ended**: Call completed successfully

---

## 📋 Component API

### Props

Currently, the component uses environment variables for configuration and doesn't accept props. This ensures security and simplifies deployment.

### Internal State

```javascript
// Call status management
const [callStatus, setCallStatus] = useState({
  status: "idle" | "connecting" | "connected" | "ended" | "error",
  duration?: number,
  error?: string
})

// SDK loading state
const [isVapiLoaded, setIsVapiLoaded] = useState(false)
```

### Key Methods

- `startCall()` - Initiates voice conversation
- `endCall()` - Terminates active call
- `formatDuration()` - Formats call timer display

---

## 🎨 Customization

### Styling

The component uses **Tailwind CSS** for styling. Key customizable elements:

```css
/* Main container */
.min-h-screen.bg-black.text-white

/* Call button (idle) */
/* Call button (idle) */
/* Call button (idle) */
/* Call button (idle) */
.w-20.h-20.bg-green-500.rounded-full

/* End call button (active) */
.w-20.h-20.bg-red-500.rounded-full

/* Status indicators */
.animate-pulse /* Connecting animation */
.bg-green-500; /* Connected indicator */
```

### Theme Variants

Create custom themes by modifying color classes:

```jsx
// Light theme variant
const lightTheme = "bg-white text-black";

// Blue theme variant
const blueTheme = "bg-blue-900 text-blue-100";
```

---

## 🔧 Troubleshooting

### Common Issues

**❌ "Failed to load Vapi SDK"**

- Check internet connection
- Verify CDN accessibility
- Ensure script loading permissions

**❌ "Call failed" / Connection errors**

- Validate API credentials
- Check assistant configuration in Vapi dashboard
- Verify microphone permissions in browser

**❌ Component not rendering**

- Ensure React 18+ compatibility
- Check Tailwind CSS configuration
- Verify environment variables are set

### Debug Mode

Enable console logging for development:

```javascript
// Add to useEffect for debugging
console.log("Call status:", callStatus);
console.log("Vapi loaded:", isVapiLoaded);
```

---

## 📚 Dependencies

### Core Dependencies

- `react`: ^18.0.0
- `react-dom`: ^18.0.0

### Optional Dependencies

- `next`: ^13.0.0 (for Next.js projects)
- `tailwindcss`: ^3.0.0 (for styling)

### External Resources

- **Vapi.ai SDK**: Loaded dynamically from CDN
- **Tailwind CSS**: For responsive styling

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone the repo
git clone <repository-url>
cd vapi-phone-interface

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Documentation

- [Vapi.ai Documentation](https://docs.vapi.ai)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)

### Community

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Discord**: [Vapi.ai Community](https://discord.gg/vapi)

---

<div align="center">
  <p>Made with ❤️ for the voice AI community</p>
  <p>
    <a href="https://vapi.ai">Vapi.ai</a> •
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#configuration">Configuration</a> •
    <a href="#support">Support</a>
  </p>
</div>
