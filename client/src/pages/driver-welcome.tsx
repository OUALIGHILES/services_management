import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Truck, Package, MapPin, Star } from "lucide-react";
import { useState } from "react";

export default function DriverWelcome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Welcome Driver",
      subtitle: "Join our delivery network",
      description: "Earn money by providing reliable delivery services. Connect with customers and grow your business with our platform.",
      icon: <Truck className="w-16 h-16 text-primary" />,
      image: "/placeholder-driver-1.jpg"
    },
    {
      title: "Manage Orders",
      subtitle: "Simple order management",
      description: "Accept, manage, and track your delivery orders all in one place. Get real-time updates and notifications.",
      icon: <Package className="w-16 h-16 text-primary" />,
      image: "/placeholder-driver-2.jpg"
    },
    {
      title: "GPS Navigation",
      subtitle: "Easy route planning",
      description: "Built-in navigation helps you find the fastest routes to your destinations. Save time and fuel with smart routing.",
      icon: <MapPin className="w-16 h-16 text-primary" />,
      image: "/placeholder-driver-3.jpg"
    },
    {
      title: "Get Paid",
      subtitle: "Earn with every delivery",
      description: "Receive payments directly to your account. Track your earnings and manage your finances with our dashboard.",
      icon: <Star className="w-16 h-16 text-primary" />,
      image: "/placeholder-driver-4.jpg"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto">
        <div className="w-full text-center mb-8">
          <h1 className="text-3xl font-bold font-display text-primary mb-2">
            {slides[currentSlide].title}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {slides[currentSlide].subtitle}
          </p>
          <div className="flex justify-center mb-6">
            {slides[currentSlide].icon}
          </div>
          <p className="text-base text-muted-foreground">
            {slides[currentSlide].description}
          </p>
        </div>

        <div className="w-full max-w-sm">
          <div className="relative h-64 bg-muted rounded-xl mb-8 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
            <div className="relative z-0 text-white text-center p-4">
              <h2 className="text-xl font-bold mb-2">{slides[currentSlide].title}</h2>
              <p className="text-sm">{slides[currentSlide].description}</p>
            </div>
          </div>

          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevSlide} 
              disabled={currentSlide === 0}
              className="flex-1 mr-2"
            >
              Previous
            </Button>
            {currentSlide === slides.length - 1 ? (
              <Button className="flex-1 ml-2">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={nextSlide} className="flex-1 ml-2">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 text-center text-sm text-muted-foreground">
        <p>GoDelivery - Connecting you with reliable delivery services</p>
      </div>
    </div>
  );
}