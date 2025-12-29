import { useRatings } from "@/hooks/use-ratings";
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
import { Star, Eye, MessageCircle, Filter, Search, Edit, Trash2, User, Truck } from "lucide-react";
import { useState } from "react";
import { Rating } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminRatings() {
  const { data: ratings, isLoading } = useRatings();
  const [filters, setFilters] = useState({
    minRating: 0,
    maxRating: 5,
    dateRange: "",
  });
  const [editingRating, setEditingRating] = useState<Rating | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate stats
  const averageRating = ratings && ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : "0.0";

  const totalReviews = ratings?.length || 0;
  const positiveReviews = ratings?.filter(r => r.rating >= 4).length || 0;
  const positivePercentage = totalReviews > 0
    ? Math.round((positiveReviews / totalReviews) * 100)
    : 0;

  // Handle edit action
  const handleEdit = (rating: Rating) => {
    setEditingRating(rating);
    setIsDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this rating?")) {
      // In a real app, this would call an API to delete the rating
      console.log("Deleting rating:", id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold font-display">Ratings & Reviews</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search reviews..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{averageRating}</div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{totalReviews}</div>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">{positivePercentage}%</div>
            <p className="text-sm text-muted-foreground">Positive Reviews</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold">4.2</div>
            <p className="text-sm text-muted-foreground">Driver Rating</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Reviews List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feedback Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratings?.map((rating) => (
                <TableRow key={rating.id}>
                  <TableCell className="font-mono text-xs">#{rating.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Customer {rating.raterId.slice(0, 8)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <span>Driver {rating.ratedId.slice(0, 8)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                        />
                      ))}
                      <span className="ml-1">{rating.rating}.0</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{rating.feedback}</TableCell>
                  <TableCell>
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(rating)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(rating)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(rating.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!ratings || ratings.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No ratings found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Rating Dialog */}
      {editingRating && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rating Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Customer {editingRating.raterId.slice(0, 8)}</h3>
                  <p className="text-sm text-muted-foreground">Feedback ID: {editingRating.id.slice(0, 8)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver:</span>
                  <span>Driver {editingRating.ratedId.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < editingRating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                      />
                    ))}
                    <span>{editingRating.rating}.0</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(editingRating.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Feedback</h4>
                <p className="text-sm">{editingRating.feedback}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
              <Button onClick={() => setIsDialogOpen(false)}>Edit Rating</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}