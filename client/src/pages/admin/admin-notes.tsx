import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/routes';
import { AdminNote, InsertAdminNote, Subcategory } from '@shared/schema';
import { useSubcategories, useAdminNotesBySubcategory, useCreateAdminNote, useUpdateAdminNote, useDeleteAdminNote } from '@/hooks/use-subcategories';
import { Languages, Plus, Edit, Trash2, Save, X } from 'lucide-react';

export default function AdminNotesManagement() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [editingNote, setEditingNote] = useState<AdminNote | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertAdminNote>>({
    titleEn: '',
    titleAr: '',
    titleUr: '',
    contentEn: '',
    contentAr: '',
    contentUr: '',
    priority: 0,
    isActive: true,
    subcategoryId: ''
  });
  
  const queryClient = useQueryClient();
  const { data: subcategories } = useSubcategories();

  // Fetch admin notes for selected subcategory
  const { data: fetchedNotes, isLoading, refetch } = useAdminNotesBySubcategory(selectedSubcategory);

  useEffect(() => {
    if (fetchedNotes) {
      setNotes(fetchedNotes);
    }
  }, [fetchedNotes]);

  const createAdminNote = useCreateAdminNote();
  const updateAdminNote = useUpdateAdminNote();
  const deleteAdminNote = useDeleteAdminNote();

  const resetForm = () => {
    setFormData({
      titleEn: '',
      titleAr: '',
      titleUr: '',
      contentEn: '',
      contentAr: '',
      contentUr: '',
      priority: 0,
      isActive: true,
      subcategoryId: selectedSubcategory
    });
  };

  const handleSave = () => {
    const noteData = {
      ...formData,
      subcategoryId: selectedSubcategory,
      priority: formData.priority || 0,
      isActive: formData.isActive !== undefined ? formData.isActive : true
    };

    if (editingNote) {
      updateAdminNote.mutate({ id: editingNote.id, ...noteData });
    } else {
      createAdminNote.mutate(noteData);
    }
  };

  const handleEdit = (note: AdminNote) => {
    setEditingNote(note);
    setFormData({
      titleEn: note.titleEn || '',
      titleAr: note.titleAr || '',
      titleUr: note.titleUr || '',
      contentEn: note.contentEn || '',
      contentAr: note.contentAr || '',
      contentUr: note.contentUr || '',
      priority: note.priority || 0,
      isActive: note.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this admin note?')) {
      return;
    }

    deleteAdminNote.mutate(id);
  };

  const handleInputChange = (field: keyof InsertAdminNote, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Notes Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage notes that appear to customers based on service subcategories
          </p>
        </div>
      </div>

      {/* Subcategory Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Subcategory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories?.map(subcategory => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {typeof subcategory.name === 'object' 
                        ? (subcategory.name as any).en 
                        : subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingNote(null);
                    resetForm();
                  }}
                  disabled={!selectedSubcategory}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingNote ? 'Edit Admin Note' : 'Add New Admin Note'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Input
                        type="number"
                        value={formData.priority || 0}
                        onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                        min="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher numbers appear first
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Active</label>
                      <div className="flex items-center pt-2">
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={formData.isActive}
                              onChange={(e) => handleInputChange('isActive', e.target.checked)}
                            />
                            <div className={`block w-10 h-6 rounded-full ${formData.isActive ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'transform translate-x-4' : ''}`}></div>
                          </div>
                          <span className="ml-3 text-sm">
                            {formData.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      <h3 className="font-medium">Multi-language Content</h3>
                    </div>
                    
                    {/* English */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title (English)</label>
                      <Input
                        value={formData.titleEn || ''}
                        onChange={(e) => handleInputChange('titleEn', e.target.value)}
                        placeholder="Enter title in English"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content (English)</label>
                      <Textarea
                        value={formData.contentEn || ''}
                        onChange={(e) => handleInputChange('contentEn', e.target.value)}
                        placeholder="Enter content in English"
                        rows={3}
                      />
                    </div>
                    
                    {/* Arabic */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title (Arabic)</label>
                      <Input
                        value={formData.titleAr || ''}
                        onChange={(e) => handleInputChange('titleAr', e.target.value)}
                        placeholder="أدخل العنوان باللغة العربية"
                        dir="rtl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content (Arabic)</label>
                      <Textarea
                        value={formData.contentAr || ''}
                        onChange={(e) => handleInputChange('contentAr', e.target.value)}
                        placeholder="أدخل المحتوى باللغة العربية"
                        rows={3}
                        dir="rtl"
                      />
                    </div>
                    
                    {/* Urdu */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title (Urdu)</label>
                      <Input
                        value={formData.titleUr || ''}
                        onChange={(e) => handleInputChange('titleUr', e.target.value)}
                        placeholder="اردو میں عنوان درج کریں"
                        dir="rtl"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Content (Urdu)</label>
                      <Textarea
                        value={formData.contentUr || ''}
                        onChange={(e) => handleInputChange('contentUr', e.target.value)}
                        placeholder="اردو میں مواد درج کریں"
                        rows={3}
                        dir="rtl"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingNote(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={createAdminNote.isPending || updateAdminNote.isPending}
                    >
                      {(createAdminNote.isPending || updateAdminNote.isPending) ? (
                        <>
                          <Save className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingNote ? 'Update' : 'Create'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      {selectedSubcategory ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Notes for {subcategories?.find(s => s.id === selectedSubcategory)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading notes...</div>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No admin notes found for this subcategory.</p>
                <p className="mt-2">Click "Add Note" to create one.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes
                  .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                  .map(note => (
                    <div 
                      key={note.id} 
                      className={`p-4 rounded-lg border ${
                        note.isActive 
                          ? 'bg-card border-border' 
                          : 'bg-muted/30 border-dashed border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {note.titleEn || 'Untitled Note'}
                            </h3>
                            {!note.isActive && (
                              <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                                Inactive
                              </span>
                            )}
                            {note.priority && note.priority > 0 && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                Priority: {note.priority}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {note.contentEn || 'No content provided'}
                          </p>
                          
                          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                            <span>Created: {new Date(note.createdAt || '').toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(note)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(note.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Show other languages in collapsed section */}
                      <div className="mt-3 text-sm text-muted-foreground space-y-1">
                        {note.titleAr && (
                          <div>
                            <span className="font-medium">Arabic:</span> {note.titleAr}
                          </div>
                        )}
                        {note.titleUr && (
                          <div>
                            <span className="font-medium">Urdu:</span> {note.titleUr}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              Please select a subcategory to view and manage admin notes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}