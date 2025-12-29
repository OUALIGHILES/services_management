import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Truck, Package, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
}

interface WelcomeCarouselProps {
  onComplete: () => void;
}

export default function WelcomeCarousel({ onComplete }: WelcomeCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      title: "Welcome to GoDelivery",
      subtitle: "Your trusted delivery service",
      description: "Connect with reliable drivers for all your delivery needs. Fast, secure, and convenient service at your fingertips.",
      icon: <Package className="w-16 h-16 text-primary" />,
    },
    {
      title: "Easy Ordering",
      subtitle: "Simple and intuitive process",
      description: "Place your order in just a few clicks. Choose from various service categories and customize your delivery preferences.",
      icon: <MapPin className="w-16 h-16 text-primary" />,
    },
    {
      title: "Track Your Order",
      subtitle: "Real-time updates",
      description: "Monitor your delivery in real-time. Know exactly when your items will arrive with our GPS tracking system.",
      icon: <Truck className="w-16 h-16 text-primary" />,
    },
    {
      title: "Rate & Review",
      subtitle: "Share your experience",
      description: "Help us improve by rating your service experience. Your feedback matters to us and other customers.",
      icon: <Star className="w-16 h-16 text-primary" />,
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
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

  // Auto-advance after 5 seconds (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        nextSlide();
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentSlide, slides.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto">
        <div className="w-full text-center mb-8">
          <motion.h1 
            className="text-3xl font-bold font-display text-primary mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {slides[currentSlide].title}
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {slides[currentSlide].subtitle}
          </motion.p>
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {slides[currentSlide].icon}
          </motion.div>
          <motion.p 
            className="text-base text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {slides[currentSlide].description}
          </motion.p>
        </div>

        <div className="w-full max-w-sm">
          <motion.div 
            className="relative h-64 bg-muted rounded-xl mb-8 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
            <div className="relative z-0 text-white text-center p-4">
              <h2 className="text-xl font-bold mb-2">{slides[currentSlide].title}</h2>
              <p className="text-sm">{slides[currentSlide].description}</p>
            </div>
          </motion.div>

          <div className="flex justify-center space-x-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? "bg-primary scale-125" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <motion.div 
            className="flex justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex-1 mr-2"
            >
              Previous
            </Button>
            {currentSlide === slides.length - 1 ? (
              <Button onClick={nextSlide} className="flex-1 ml-2">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={nextSlide} className="flex-1 ml-2">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="p-4 text-center text-sm text-muted-foreground">
        <p>GoDelivery - Connecting you with reliable delivery services</p>
      </div>
    </div>
  );
}