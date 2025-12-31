import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, XCircle, HelpCircle, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";

export default function SpecialCasesPage() {
  const [location, setLocation] = useLocation();
  const [caseType, setCaseType] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [problemDescription, setProblemDescription] = useState('');

  const handleCancelOrder = () => {
    // In a real app, this would send cancellation request to backend
    console.log({ cancellationReason });
    // Redirect to orders after cancellation
    setLocation("/customer/orders");
  };

  const handleReportProblem = () => {
    // In a real app, this would send problem report to backend
    console.log({ problemDescription });
    // Redirect to help/support after reporting
    setLocation("/customer/help");
  };

  const handleRequestHelp = () => {
    // Redirect to help/support
    setLocation("/customer/help");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            Special Cases
          </CardTitle>
          <p className="text-muted-foreground">Handle special situations with your order</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* No Driver Accepts */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              No Driver Accepts Order
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              If no driver accepts your order, the system will alert the admin who can manually assign a driver.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll receive a notification: "Looking for alternative driver"
            </p>
          </div>

          {/* Cancel Order */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-500" />
              Cancel Order
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Please select a reason for cancellation:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Plans changed",
                  "Driver delay", 
                  "Found better price",
                  "Other reasons"
                ].map((reason) => (
                  <Button
                    key={reason}
                    variant={cancellationReason === reason ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCancellationReason(reason)}
                  >
                    {reason}
                  </Button>
                ))}
              </div>
              {cancellationReason === "Other reasons" && (
                <Textarea
                  placeholder="Please provide more details about why you're cancelling..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  rows={3}
                />
              )}
              <Button 
                className="w-full" 
                disabled={!cancellationReason}
                onClick={handleCancelOrder}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>

          {/* Problem During Execution */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              Problem During Execution
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If a problem occurs during service execution:
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleRequestHelp}>
                  🆘 Request Help
                </Button>
                <Button variant="outline" onClick={handleReportProblem}>
                  📞 Contact Technical Support
                </Button>
                <Button variant="outline">
                  💬 Chat with Admin
                </Button>
                <Button variant="outline">
                  🔄 Reschedule Service
                </Button>
              </div>
              <Textarea
                placeholder="Describe the problem you're experiencing..."
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.history.back()}
          >
            Back to Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}