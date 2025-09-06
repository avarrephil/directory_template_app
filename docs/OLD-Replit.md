# Local Business Directory Platform

## Overview

This is a SaaS web application for creating AI-powered local business directory platforms. The system enables semi-automated or manual data collection to build niche business directories using Google Maps data. The platform currently features an admin dashboard for managing CSV data files with upload, download, and file management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and API caching
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful API with centralized route handling
- **File Upload**: Multer middleware for CSV file processing with local file storage
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development Server**: Vite integration for hot module replacement in development

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **File Storage**: Local filesystem storage for CSV uploads with organized directory structure

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL storage
- **User Model**: Basic username/password authentication schema
- **Access Control**: Admin-only dashboard access (user roles implemented in schema)

### External Dependencies
- **Database**: Neon Database serverless PostgreSQL instance
- **UI Components**: Radix UI for accessible component primitives
- **File Processing**: Native Node.js fs module with Multer for uploads
- **Styling**: Tailwind CSS for utility-first styling approach
- **Development Tools**: Replit-specific plugins for development environment integration

The application follows a monorepo structure with shared schemas and types, separating client and server code while maintaining type safety across the full stack. The admin dashboard focuses on CSV data management with plans for future user dashboard and business directory features.