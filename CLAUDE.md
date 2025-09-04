# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with Turbopack (localhost:3000)
- `npm run build` - Build production application with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Testing Commands
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI interface
- `npm run test:coverage` - Run tests with coverage report

## Architecture Overview

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS.

### Key Technologies
- **Next.js 15** with App Router for full-stack React development
- **Turbopack** for fast development and build processes
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Geist fonts** (Sans and Mono) from Vercel
- **Vitest** for unit and integration testing
- **Fast-check** for property-based testing

### Project Structure
```
app/
├── layout.tsx          # Root layout with fonts and metadata
├── page.tsx            # Home page component
├── globals.css         # Global styles with Tailwind
└── favicon.ico         # App icon
```

### Configuration Files
- `next.config.ts` - Next.js configuration (currently minimal)
- `tsconfig.json` - TypeScript configuration with Next.js paths
- `eslint.config.mjs` - ESLint configuration using Next.js presets
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `tailwind.config.ts` - Tailwind CSS configuration
- `vitest.config.ts` - Vitest testing configuration
- `vitest.setup.ts` - Vitest setup file with testing-library/jest-dom

### Key Features
- App Router with TypeScript support
- Optimized fonts (Geist Sans/Mono) with CSS variables
- Dark mode support via Tailwind CSS
- ESLint configured with Next.js and TypeScript rules
- Path mapping configured (`@/*` points to root)

## Development Notes

### Starting Development
Run `npm run dev` to start the development server. The page will auto-reload when you edit `app/page.tsx`.

### Building for Production
Use `npm run build` to create an optimized production build, then `npm start` to serve it.

### Code Quality
Always run `npm run lint` before committing to ensure code quality standards are met.

### Testing
- **Vitest** is configured for unit and integration testing
- **Fast-check** is available for property-based testing
- Test files should use `.test.ts` or `.spec.ts` extensions
- Place test files in the same directory as the source file being tested
- Use `npm test` to run all tests, `npm run test:ui` for interactive testing
- Component tests use React Testing Library with jsdom environment