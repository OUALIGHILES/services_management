import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Globe, Image, Link, Hash } from "lucide-react";

export default function AdminSeo() {
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
                <Input id="site-title" defaultValue="GoDelivery - Fast & Reliable Delivery Service" />
                <p className="text-sm text-muted-foreground">This will appear in search results and browser tabs</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea 
                  id="meta-description" 
                  defaultValue="GoDelivery connects customers with reliable drivers for all their delivery needs. Fast, secure, and convenient delivery service." 
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">Recommended: 150-160 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default-keywords">Default Keywords</Label>
                  <Input id="default-keywords" defaultValue="delivery, service, logistics, transport" />
                  <p className="text-sm text-muted-foreground">Comma-separated keywords for your site</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input id="author" defaultValue="GoDelivery Team" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-title">Open Graph Title</Label>
                <Input id="og-title" defaultValue="GoDelivery - Fast & Reliable Delivery Service" />
                <p className="text-sm text-muted-foreground">Title for social media sharing</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-description">Open Graph Description</Label>
                <Textarea 
                  id="og-description" 
                  defaultValue="GoDelivery connects customers with reliable drivers for all their delivery needs. Fast, secure, and convenient delivery service." 
                  rows={2}
                />
                <p className="text-sm text-muted-foreground">Description for social media sharing</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="og-image">Open Graph Image URL</Label>
                  <Input id="og-image" defaultValue="/images/og-image.jpg" />
                  <p className="text-sm text-muted-foreground">Image for social media sharing</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter-card">Twitter Card Type</Label>
                  <Select defaultValue="summary_large_image">
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
                <Button>Save SEO Settings</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Page-Specific SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Home Page</h3>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Services Page</h3>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="font-medium">About Page</h3>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Contact Page</h3>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}