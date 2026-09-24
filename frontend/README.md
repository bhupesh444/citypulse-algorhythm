# CityPulse Frontend

Civic Intelligence Command Center frontend built with React, TypeScript, Vite, and MapLibre GL JS.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Configure your MapTiler API Key in `.env`:
   ```env
   VITE_MAPTILER_API_KEY=your_actual_key
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## MapTiler API Setup

1. Create a free account at [MapTiler Cloud](https://cloud.maptiler.com/).
2. Create an API key in your MapTiler dashboard.
3. Open the frontend `.env` file.
4. Add:
   ```env
   VITE_MAPTILER_API_KEY=your_actual_key
   ```
5. Restart the Vite development server.

> **Security Note**: Never commit `.env` or any real API keys to GitHub. `.env` and `.env.local` are automatically ignored by `.gitignore`.
