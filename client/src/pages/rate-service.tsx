import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, Clock, Package } from "lucide-react";
import { useLocation } from "wouter";

export default function RateService() {
  const [location, setLocation] = useLocation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tags = [
    { id: 'fast', label: 'Fast', icon: <Clock className="w-4 h-4" /> },
    { id: 'polite', label: 'Polite', icon: <ThumbsUp className="w-4 h-4" /> },
    { id: 'clean', label: 'Clean', icon: <Package className="w-4 h-4" /> },
    { id: 'careful', label: 'Careful', icon: <Package className="w-4 h-4" /> },
    { id: 'professional', label: 'Professional', icon: <ThumbsUp className="w-4 h-4" /> },
  ];

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = () => {
    // In a real app, this would submit the rating to the backend
    console.log({ rating, comment, selectedTags });
    // Redirect to customer orders after rating
    setLocation("/customer/orders");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Rate Your Service</CardTitle>
          <p className="text-muted-foreground">How was your experience with our service?</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Rating Section */}
          <div className="text-center">
            <h3 className="text-lg font-medium mb-4">Rate your experience</h3>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-2 text-muted-foreground">
              {rating > 0 ? `You rated ${rating} star${rating > 1 ? 's' : ''}` : 'Select your rating'}
            </p>
          </div>

          {/* Tags Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Select tags that apply</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  onClick={() => toggleTag(tag.id)}
                  className="flex items-center gap-2"
                >
                  {tag.icon}
                  {tag.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Additional Comments</h3>
            <Textarea
              placeholder="Tell us more about your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={handleSubmit}
              disabled={rating === 0}
            >
              Submit Review
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setLocation("/customer/orders")}
            >
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}