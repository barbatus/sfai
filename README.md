# SFAI Labs - Admin Panel

A professional document management admin panel with RAG API integration, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Secure Authentication** - JWT-based admin authentication
- 📄 **Document Management** - Upload, view, and delete documents
- 🎯 **Drag & Drop Upload** - Support for multiple file formats with progress tracking
- 🎨 **Neo-Brutalist Design** - Modern UI with shadcn/ui components
- ⚡ **Real-time Updates** - Live progress tracking for file uploads
- 🏗️ **Monorepo Structure** - Organized with pnpm workspaces and Turbo

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with neo-brutalism theme
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
# Authentication
ADMIN_EMAIL=admin@sfai.com
ADMIN_PASSWORD=SecureAdminPass123!
JWT_SECRET=sfai-admin-secret-key-2024

# RAG API
RAG_API_URL=https://classic-gas-rag-810898639913.us-central1.run.app
RAG_API_TOKEN=your_api_token_here
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
│       │   ├── app/            # App router pages
│       │   ├── components/     # React components
│       │   │   ├── common/     # shadcn/ui components
│       │   │   └── ...         # Feature components
│       │   ├── api/            # API client setup
│       │   └── lib/            # Utilities and auth
│       └── ...
├── packages/
│   ├── services/               # API contracts (ts-rest)
│   └── eslint-config/          # Shared ESLint configuration
├── turbo.json                  # Turbo configuration
└── pnpm-workspace.yaml         # pnpm workspace configuration
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm clean` - Clean build artifacts

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

## Authentication

The admin panel uses JWT-based authentication. Login credentials are stored in environment variables for security.

Default credentials (configurable in `.env.local`):
- Email: `admin@sfai.com`
- Password: `SecureAdminPass123!`

## API Integration

The application integrates with a RAG (Retrieval-Augmented Generation) API for document processing. All API calls are proxied through Next.js API routes for security.

### API Endpoints

- `GET /api/auth/me` - Get current user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/documents` - List all documents
- `POST /api/documents/upload` - Upload a document
- `DELETE /api/documents` - Delete a document

## Deployment

The application is ready to be deployed to Vercel:

1. Push your code to a Git repository
2. Import the project to Vercel
3. Set the following environment variables in Vercel:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `RAG_API_URL`
   - `RAG_API_TOKEN`
4. Deploy

## License

MIT