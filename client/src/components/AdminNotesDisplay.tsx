import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, Languages } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/routes';
import { AdminNote } from '@shared/schema';

interface AdminNotesDisplayProps {
  subcategoryId: string;
  language?: 'en' | 'ar' | 'ur';
}

const AdminNotesDisplay: React.FC<AdminNotesDisplayProps> = ({ 
  subcategoryId, 
  language = 'en' 
}) => {
  const { data: adminNotes, isLoading, error } = useQuery({
    queryKey: [api.adminNotes.listBySubcategory.path, subcategoryId],
    queryFn: async () => {
      const url = api.adminNotes.listBySubcategory.path.replace(':subcategoryId', subcategoryId);
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch admin notes');
      return res.json() as Promise<AdminNote[]>;
    },
    enabled: !!subcategoryId,
  });

  if (isLoading) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-6 flex items-center justify-center h-24">
          <div className="text-muted-foreground">Loading admin notes...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Error loading admin notes</p>
            <p className="text-sm text-destructive/70">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!adminNotes || adminNotes.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Info className="w-8 h-8 mx-auto mb-2" />
          <p>No admin notes available for this service</p>
        </CardContent>
      </Card>
    );
  }

  // Filter active notes and sort by priority
  const activeNotes = adminNotes
    .filter(note => note.isActive)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-lg">Admin Notes</h3>
        <Badge variant="secondary" className="ml-auto">
          {activeNotes.length} note{activeNotes.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {activeNotes.map((note) => {
          // Get the content based on the selected language
          let title = note.titleEn;
          let content = note.contentEn;

          if (language === 'ar' && note.titleAr) {
            title = note.titleAr;
            content = note.contentAr;
          } else if (language === 'ur' && note.titleUr) {
            title = note.titleUr;
            content = note.contentUr;
          }

          // Fallback to English if the selected language content is not available
          if (!title && !content) {
            title = note.titleEn;
            content = note.contentEn;
          }

          return (
            <Card key={note.id} className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base text-blue-800">
                    {title || 'Untitled Note'}
                  </CardTitle>
                  {note.priority !== undefined && note.priority > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Priority: {note.priority}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {content || 'No content provided'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminNotesDisplay;