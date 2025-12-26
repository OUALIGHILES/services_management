import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
             <Button className="w-full">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
