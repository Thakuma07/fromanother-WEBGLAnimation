# fromanother Ripple Displacement Slider

A high-performance, cinematic ripple displacement slider built with **Three.js**, **GSAP**, and **GLSL Shaders**. This project features smooth text animations and a liquid-like transition effect between slides.

## ✨ Features
- **WebGL Ripple Effect**: Custom GLSL shaders for fluid, interactive displacement transitions.
- **Dynamic Text Splitting**: Uses `split-type` for high-performance text animations without premium dependencies.
- **Responsive Design**: Adapts layout and shader intensity for mobile and desktop screens.
- **Vite Powered**: Lightning-fast development and optimized production builds.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository or download the source code.
2. Navigate to the project directory:
   ```bash
   cd fromanother-slider
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the local development server:
```bash
npm run dev
```

### Build
Generate a production-ready bundle:
```bash
npm run build
```

## 📁 Project Structure
```text
├── assets/             # Static assets (images, icons)
├── shaders/            # GLSL shader files
│   ├── vertex.glsl     # Vertex shader logic
│   └── fragment.glsl   # Fragment shader logic
├── index.html          # Main entry point
├── script.js           # Core application logic
├── slides.js           # Slide content configuration
├── styles.css          # Global styling
└── vite.config.js      # Vite configuration
```

## 🛠️ Built With
- **[Vite](https://vitejs.dev/)** - Modern frontend build tool.
- **[Three.js](https://threejs.org/)** - 3D library for WebGL rendering.
- **[GSAP](https://greensock.com/gsap/)** - Industry-standard animation library.
- **[split-type](https://github.com/lukePeavey/SplitType)** - Lightweight text splitting utility.

## 🎨 Credits
- **Design Inspiration**: [fromanother](https://www.fromanother.love/)
- **Shader Source**: [Shock wave with saturation](https://www.shadertoy.com/view/llj3Dz) from Shadertoy

---
Developed with ❤️ by Antigravity.
