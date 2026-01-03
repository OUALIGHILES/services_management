import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Globe, Image, Link, Hash, Save, Edit3, X } from "lucide-react";
import { useState } from "react";
import { useSeoSettings } from "@/hooks/use-seo";

interface PageSeoSettings {
  title?: string;
  description?: string;
  keywords?: string;
}

export default function AdminSeo() {
  const {
    seoSettings,
    isLoading,
    error,
    updateSeoSettings,
    isUpdating
  } = useSeoSettings();

  const [formData, setFormData] = useState(seoSettings || {
    siteTitle: "GoDelivery - Fast & Reliable Delivery Service",
    metaDescription: "GoDelivery connects customers with reliable drivers for all their delivery needs. Fast, secure, and convenient delivery service.",
    defaultKeywords: "delivery, service, logistics, transport",
    author: "GoDelivery Team",
    ogTitle: "GoDelivery - Fast & Reliable Delivery Service",
    ogDescription: "GoDelivery connects customers with reliable drivers for all their delivery needs. Fast, secure, and convenient delivery service.",
    ogImage: "/images/og-image.jpg",
    twitterCard: "summary_large_image",
  });

  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [pageSettings, setPageSettings] = useState<Record<string, PageSeoSettings>>({
    home: {
      title: "GoDelivery - Fast & Reliable Delivery Service",
      description: "GoDelivery connects customers with reliable drivers for all their delivery needs. Fast, secure, and convenient delivery service."
    },
    services: {
      title: "Our Services - GoDelivery",
      description: "Explore our wide range of delivery services. Fast, reliable, and secure delivery solutions for all your needs."
    },
    about: {
      title: "About Us - GoDelivery",
      description: "Learn more about GoDelivery, our mission, and how we're revolutionizing the delivery industry."
    },
    contact: {
      title: "Contact Us - GoDelivery",
      description: "Get in touch with GoDelivery. We're here to help with all your delivery needs and inquiries."
    }
  });

  const [newPageSettings, setNewPageSettings] = useState<PageSeoSettings>({
    title: "",
    description: "",
    keywords: ""
  });

  const handleSaveGeneralSettings = () => {
    updateSeoSettings({
      ...formData,
      pageSpecific: pageSettings
    });
  };

  const handlePageEdit = (page: string) => {
    setEditingPage(page);
    setNewPageSettings(pageSettings[page] || { title: "", description: "", keywords: "" });
  };

  const handlePageSave = (page: string) => {
    setPageSettings(prev => ({
      ...prev,
      [page]: newPageSettings
    }));
    setEditingPage(null);
  };

  const handlePageCancel = () => {
    setEditingPage(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading SEO settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading SEO settings: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold font-display">SEO Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                SEO Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary font-medium">
                <Search className="w-4 h-4" />
                General SEO
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                <Globe className="w-4 h-4" />
                Site Indexing
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                <Link className="w-4 h-4" />
                URL Structure
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                <Image className="w-4 h-4" />
                Social Media
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                <Hash className="w-4 h-4" />
                Sitemap
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>General SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site-title">Site Title</Label>
                <Input
                  id="site-title"
                  value={formData.siteTitle}
                  onChange={(e) => setFormData({...formData, siteTitle: e.target.value})}
                />
                <p className="text-sm text-muted-foreground">This will appear in search results and browser tabs</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">Recommended: 150-160 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default-keywords">Default Keywords</Label>
                  <Input
                    id="default-keywords"
                    value={formData.defaultKeywords}
                    onChange={(e) => setFormData({...formData, defaultKeywords: e.target.value})}
                  />
                  <p className="text-sm text-muted-foreground">Comma-separated keywords for your site</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-title">Open Graph Title</Label>
                <Input
                  id="og-title"
                  value={formData.ogTitle}
                  onChange={(e) => setFormData({...formData, ogTitle: e.target.value})}
                />
                <p className="text-sm text-muted-foreground">Title for social media sharing</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-description">Open Graph Description</Label>
                <Textarea
                  id="og-description"
                  value={formData.ogDescription}
                  onChange={(e) => setFormData({...formData, ogDescription: e.target.value})}
                  rows={2}
                />
                <p className="text-sm text-muted-foreground">Description for social media sharing</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="og-image">Open Graph Image URL</Label>
                  <Input
                    id="og-image"
                    value={formData.ogImage}
                    onChange={(e) => setFormData({...formData, ogImage: e.target.value})}
                  />
                  <p className="text-sm text-muted-foreground">Image for social media sharing</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter-card">Twitter Card Type</Label>
                  <Select
                    value={formData.twitterCard}
                    onValueChange={(value) => setFormData({...formData, twitterCard: value})}
                  >
                    <SelectTrigger id="twitter-card">
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="summary_large_image">Summary with Large Image</SelectItem>
                      <SelectItem value="app">App</SelectItem>
                      <SelectItem value="player">Player</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button onClick={handleSaveGeneralSettings} disabled={isUpdating}>
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save SEO Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Page-Specific SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(pageSettings).map(([page, settings]) => (
                <div key={page} className="flex justify-between items-center p-4 border rounded-lg">
                  {editingPage === page ? (
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`page-title-${page}`}>Title</Label>
                        <Input
                          id={`page-title-${page}`}
                          value={newPageSettings.title}
                          onChange={(e) => setNewPageSettings({...newPageSettings, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`page-description-${page}`}>Description</Label>
                        <Textarea
                          id={`page-description-${page}`}
                          value={newPageSettings.description}
                          onChange={(e) => setNewPageSettings({...newPageSettings, description: e.target.value})}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`page-keywords-${page}`}>Keywords</Label>
                        <Input
                          id={`page-keywords-${page}`}
                          value={newPageSettings.keywords}
                          onChange={(e) => setNewPageSettings({...newPageSettings, keywords: e.target.value})}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handlePageSave(page)}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handlePageCancel}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-medium capitalize">{page} Page</h3>
                        <p className="text-sm text-muted-foreground">
                          {settings.title || 'No title set'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageEdit(page)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}