import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface RatingSystemProps {
  orderId: string;
  onSubmitRating: (rating: number, feedback: string) => void;
}

export default function RatingSystem({ orderId, onSubmitRating }: RatingSystemProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingSubmit = () => {
    if (rating > 0) {
      onSubmitRating(rating, feedback);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Rate Your Service</CardTitle>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600 fill-current" />
              </div>
              <h3 className="text-xl font-bold mb-2">Thank You!</h3>
              <p className="text-muted-foreground">
                Your feedback helps us improve our service.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">How was your experience?</h3>
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
                            ? "text-yellow-400 fill-current"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-muted-foreground">
                  {rating > 0 ? `Rating: ${rating} star${rating > 1 ? 's' : ''}` : "Select a rating"}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium mb-2">
                    Additional Feedback
                  </label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button 
                  onClick={handleRatingSubmit} 
                  className="w-full" 
                  disabled={rating === 0}
                >
                  Submit Rating
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}