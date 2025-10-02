# SFAI Labs - Admin Panel

A professional document management admin panel with RAG API integration, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Secure Authentication** - JWT-based admin authentication
- 📄 **Document Management** - Upload, view, and delete documents
- 🎯 **Drag & Drop Upload** - Support for multiple file formats with progress tracking
- 🎨 **Dual Theme Support** - Switch between Neo-Brutalist and Classic Blue themes
- ⚡ **Real-time Updates** - Live progress tracking for file uploads
- 🏗️ **Monorepo Structure** - Organized with pnpm workspaces and Turbo

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dual theme support
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **API Client**: ts-rest
- **Authentication**: JWT with jose
- **Monorepo**: pnpm workspaces + Turbo
- **File Upload**: react-dropzone

## Prerequisites

- Node.js 18+
- pnpm 9.14.2+

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Setup

Create a `.env.local` file in `apps/web/` with the following variables:

```env
# Admin Authentication
ADMIN_EMAIL=admin@sfai.com
ADMIN_PASSWORD=SecureAdminPass123!
JWT_SECRET=sfai-admin-secret-key-2024

# RAG API
RAG_API_URL=https://classic-gas-rag-810898639913.us-central1.run.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_EMAIL=service@example.com
SUPABASE_SERVICE_PASSWORD=service-password

# Development Options
USE_MOCK_UPLOAD=true  # Set to true to use local mock upload service
```

### Development

```bash
# Start the development server
pnpm dev

# The app will be available at http://localhost:3000
```

### Building for Production

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

## Project Structure

```
sfai/
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/            # App router pages and API routes
│       │   │   ├── admin/      # Admin panel page
│       │   │   ├── api/        # Next.js API routes
│       │   │   │   └── v1/     # API v1 endpoints
│       │   │   ├── components/ # Page-specific components
│       │   │   ├── login/      # Login page
│       │   │   └── page.tsx    # Homepage
│       │   ├── api/            # Client-side API hooks (ts-rest + React Query)
│       │   ├── components/     # Shared React components
│       │   │   ├── common/     # shadcn/ui components
│       │   │   ├── box.tsx     # Layout utility component
│       │   │   ├── space.tsx   # Spacing utility component
│       │   │   └── data-table.tsx  # Reusable data table
│       │   ├── lib/            # Utilities
│       │   └── utils/          # Helper functions
│       ├── public/             # Static assets
│       └── package.json        # Next.js dependencies
├── packages/
│   ├── services/               # Backend services with DI
│   │   ├── auth.service.ts    # Authentication service
│   │   ├── documents.service.ts # Document management
│   │   ├── supabase-auth.service.ts # Supabase integration
│   │   ├── config/             # Configuration management
│   │   ├── di.ts               # Dependency injection setup
│   │   └── utils/exceptions.ts # Custom exception classes
│   ├── ts-rest/                # API contracts
│   │   ├── auth.contract.ts    # Auth endpoints
│   │   └── documents.contract.ts # Document endpoints
│   └── eslint-config/          # Shared ESLint configuration
├── scripts/
│   └── deploy-vercel.sh        # Deployment script
├── turbo.json                  # Turbo configuration
├── pnpm-workspace.yaml         # pnpm workspace configuration
└── pnpm-lock.yaml              # Lockfile for dependencies
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm type-check` - Run TypeScript type checking
- `pnpm clean` - Clean build artifacts and node_modules

## Supported File Formats

- PDF (.pdf)
- Word Documents (.docx)
- Excel Spreadsheets (.xlsx)
- PowerPoint Presentations (.pptx)
- Text Files (.txt)
- CSV Files (.csv)
- JSON Files (.json)
- HTML Files (.html)
- XML Files (.xml)
- ZIP Archives (.zip)

**Maximum file size**: 50MB per document

## UI Themes

The application supports two distinct visual themes that can be switched on-the-fly:

- **Neo-Brutalist** (Default) - Bold, high-contrast design with sharp edges and strong shadows
- **Classic Blue** - Clean, professional appearance with subtle shadows and rounded corners

To switch themes, use the theme switcher button (🎨) in the admin panel header. The selected theme is automatically saved to your browser's local storage.

## Authentication

The admin panel uses JWT-based authentication. Login credentials are stored in environment variables for security.

Default credentials (configurable in `.env.local`):
- Email: `admin@sfai.com`
- Password: `SecureAdminPass123!`

## API Integration

The application integrates with a RAG (Retrieval-Augmented Generation) API for document processing. All API calls are proxied through Next.js API routes for security.

### API Endpoints

- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/documents/list` - List all documents
- `POST /api/v1/documents/upload` - Upload a document (multipart/form-data)
- `DELETE /api/v1/documents/delete` - Delete a document

## Deployment

The application is configured for deployment to Vercel as a monorepo:

1. Push your code to a Git repository
2. Import the project to Vercel
3. Set the following environment variables in Vercel:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `RAG_API_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_EMAIL`
   - `SUPABASE_SERVICE_PASSWORD`
   - `USE_MOCK_UPLOAD` (optional, for development)
4. Deploy

## License

MIT