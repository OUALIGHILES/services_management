import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  Download,
  Image as ImageIcon,
  Upload,
  Monitor,
  Smartphone,
  Tablet,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@shared/routes";
import { buildUrl } from "@shared/routes";

// Define the banner type
interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  position: number;
  status: 'active' | 'inactive';
  createdAt: string;
  modifiedAt: string;
}

// Form schema for validation
const bannerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  linkUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  position: z.number().min(1, "Position must be at least 1"),
  status: z.enum(['active', 'inactive']),
});

export default function AdminHomeBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Fetch banners from the backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(api.homeBanners.list.path, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setBanners(data);
        } else {
          console.error('Failed to fetch banners:', response.statusText);
          alert('Failed to load banners. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        alert('An error occurred while loading banners. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof bannerSchema>) => {
    // Check if image upload is still in progress
    if (saving) {
      alert('Please wait for the image upload to complete.');
      return;
    }

    setSaving(true);
    try {
      if (editingBanner) {
        // Update existing banner
        // If we're editing and no new image was uploaded, keep the existing image
        const imageUrlToUse = uploadedImageUrl || editingBanner.imageUrl;

        if (!imageUrlToUse) {
          alert('Banner must have an image. Please upload an image or keep the existing one.');
          return;
        }

        const response = await fetch(buildUrl(api.homeBanners.update.path, { id: editingBanner.id }), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            imageUrl: imageUrlToUse, // Use uploaded image or keep existing
            linkUrl: data.linkUrl,
            position: data.position,
            status: data.status
          })
        });

        if (response.ok) {
          const updatedBanner = await response.json();
          setBanners(banners.map(ban =>
            ban.id === editingBanner.id ? updatedBanner : ban
          ));
          setIsDialogOpen(false);
          setEditingBanner(null);
          setImagePreview(null);
          setUploadedImageUrl(null);
        } else {
          console.error('Failed to update banner:', response.statusText);
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to update banner: ${errorData.message || response.statusText}`);
        }
      } else {
        // Add new banner
        if (!uploadedImageUrl) {
          alert('Please upload a banner image');
          return;
        }

        const response = await fetch(api.homeBanners.create.path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            imageUrl: uploadedImageUrl,
            linkUrl: data.linkUrl,
            position: data.position,
            status: data.status
          })
        });

        if (response.ok) {
          const newBanner = await response.json();
          setBanners([...banners, newBanner]);
          setIsDialogOpen(false);
          setEditingBanner(null);
          setImagePreview(null);
          setUploadedImageUrl(null);
        } else {
          console.error('Failed to create banner:', response.statusText);
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to create banner: ${errorData.message || response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Error saving banner: ' + (error as Error).message);
    } finally {
      setSaving(false);
      form.reset();
    }
  };

  // Form setup
  const form = useForm<z.infer<typeof bannerSchema>>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: editingBanner?.title || "",
      description: editingBanner?.description || "",
      linkUrl: editingBanner?.linkUrl || "",
      position: editingBanner?.position || 1,
      status: editingBanner?.status || "active",
    },
  });

  // Handle edit action
  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    form.reset({
      title: banner.title,
      description: banner.description,
      linkUrl: banner.linkUrl || "",
      position: banner.position,
      status: banner.status,
    });
    setImagePreview(banner.imageUrl);
    setUploadedImageUrl(banner.imageUrl);
    setIsDialogOpen(true);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Check if user is authenticated by making a simple API call
    try {
      const response = await fetch('/api/user', {
        credentials: 'include'
      });

      if (!response.ok) {
        alert('Authentication required. Please log in first.');
        return;
      }
    } catch (error) {
      alert('Authentication required. Please log in first.');
      return;
    }

    // Upload image to server
    const formData = new FormData();
    formData.append('image', file);

    try {
      setSaving(true); // Use saving state to indicate upload in progress

      const response = await fetch('/api/images/banner', {
        method: 'POST',
        credentials: 'include', // Include session cookies for authentication
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.url) {
          setUploadedImageUrl(result.url);
          console.log('Image uploaded successfully:', result.url);
        } else {
          console.error('Upload succeeded but no URL returned:', result);
          alert('Upload succeeded but image URL not returned. Please try again.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to upload image:', response.statusText, errorData);
        alert(`Failed to upload image: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete action
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      setDeletingId(id);
      try {
        const response = await fetch(buildUrl(api.homeBanners.delete.path, { id }), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (response.ok) {
          setBanners(banners.filter(ban => ban.id !== id));
        } else {
          console.error('Failed to delete banner:', response.statusText);
          alert('Failed to delete banner. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('An error occurred while deleting the banner. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Filter banners based on search term
  const filteredBanners = banners.filter(ban =>
    ban.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ban.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold font-display">Home Banner Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search banners..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="image">Banner Image</Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Click to upload banner image</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => document.getElementById('image')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                        </div>
                        {imagePreview && (
                          <div className="mt-4">
                            <Label>Preview</Label>
                            <div className="mt-2 border rounded-md p-2">
                              <img
                                src={imagePreview}
                                alt="Banner preview"
                                className="w-full h-32 object-cover rounded-md"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter banner title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="linkUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="1" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value as 'active' | 'inactive')}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter banner description" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingBanner(null);
                        setImagePreview(null);
                        setUploadedImageUrl(null);
                        form.reset();
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingBanner ? "Updating..." : "Adding..."}
                        </>
                      ) : (
                        editingBanner ? "Update Banner" : "Add Banner"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Banner List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="w-16 h-10 rounded-md bg-muted flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{banner.title}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {banner.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{banner.position}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={banner.status} />
                      </TableCell>
                      <TableCell>
                        {new Date(banner.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(banner)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(banner.id)}
                            disabled={deletingId === banner.id}
                          >
                            {deletingId === banner.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBanners.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No banners found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-2">Desktop Preview</div>
                <div className="relative h-48 rounded-lg overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary to-indigo-600 flex items-center justify-center">
                      <div className="text-white text-center p-4">
                        <h3 className="text-xl font-bold mb-2">{form.watch('title') || 'Banner Title'}</h3>
                        <p className="text-sm">{form.watch('description') || 'Banner description will appear here'}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-muted-foreground mb-2">Mobile Preview</div>
                <div className="relative h-32 rounded-lg overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary to-indigo-600 flex items-center justify-center">
                      <div className="text-white text-center p-2">
                        <h3 className="text-lg font-bold mb-1">{form.watch('title') || 'Title'}</h3>
                        <p className="text-xs">{form.watch('description') || 'Description'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Monitor className="w-4 h-4 mt-0.5 text-primary" />
                  <span>Upload high-resolution images (1920x400 recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Smartphone className="w-4 h-4 mt-0.5 text-primary" />
                  <span>Mobile-optimized images (768x300 recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Tablet className="w-4 h-4 mt-0.5 text-primary" />
                  <span>Tablet-optimized images (1024x350 recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Upload className="w-4 h-4 mt-0.5 text-primary" />
                  <span>Maximum file size: 5MB per image</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}