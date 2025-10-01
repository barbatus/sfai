import { FileText, Shield, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/common/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/common/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            SFAI Labs
            <span className="block text-2xl md:text-4xl mt-2 text-primary">Admin Panel</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Professional document management system powered by RAG technology for intelligent
            document processing and retrieval.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/admin">
              <Button size="lg" className="text-lg">
                Access Admin Panel
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View and organize all your documents in one centralized location with an intuitive
                interface.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Upload className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload multiple file formats with drag-and-drop support. Real-time progress tracking
                included.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Trash2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Easy Deletion</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Remove documents safely with confirmation dialogs and instant updates to your
                document list.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Protected admin area with JWT authentication ensuring only authorized access to
                sensitive operations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Supported Formats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Supported File Formats</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  '.pdf',
                  '.docx',
                  '.xlsx',
                  '.pptx',
                  '.txt',
                  '.csv',
                  '.json',
                  '.html',
                  '.xml',
                  '.zip',
                ].map((format) => (
                  <span
                    key={format}
                    className="px-4 py-2 border-2 border-foreground bg-secondary text-secondary-foreground font-mono font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {format}
                  </span>
                ))}
              </div>
              <p className="text-center mt-6 text-muted-foreground">
                Maximum file size: 50MB per document
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t-2 border-foreground">
        <p className="text-center text-muted-foreground">
          © 2024 SFAI Labs. Document Management System with RAG API Integration.
        </p>
      </footer>
    </div>
  );
}
