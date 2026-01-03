import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Phone, Mail, MessageCircle, Search } from "lucide-react";

export default function CustomerHelp() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: "How do I book a delivery?",
      answer: "To book a delivery, go to the Services section, select the type of service you need, enter your pickup and dropoff locations, and confirm your booking. You can choose between direct booking or getting quotes from multiple drivers."
    },
    {
      question: "Can I track my order?",
      answer: "Yes, once your order is confirmed, you can track it in real-time from the Tracking section. You'll see the driver's location, estimated arrival time, and order status."
    },
    {
      question: "How do I pay for the service?",
      answer: "You can pay using electronic payment methods. Select your preferred payment method when booking the service."
    },
    {
      question: "What if I need to cancel my order?",
      answer: "You can cancel your order from the Orders section before the driver accepts it. Cancellation policies may apply depending on the timing."
    },
    {
      question: "How do I rate my driver?",
      answer: "After your order is completed, you'll receive a notification prompting you to rate your experience. You can also access the rating page from your order history."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground">Find answers to your questions or contact support</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex border-b mb-6">
        <Button
          variant={activeTab === 'faq' ? "default" : "ghost"}
          className="rounded-none border-b-2 -mb-px"
          onClick={() => setActiveTab('faq')}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          FAQ
        </Button>
        <Button
          variant={activeTab === 'contact' ? "default" : "ghost"}
          className="rounded-none border-b-2 -mb-px"
          onClick={() => setActiveTab('contact')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      </div>

      {activeTab === 'faq' ? (
        <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4" />
              <p>No FAQs match your search. Try different keywords.</p>
            </div>
          )}
        </Accordion>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex flex-col items-center justify-center p-6 h-32">
                  <Phone className="w-8 h-8 mb-2" />
                  <span>Call Us</span>
                  <span className="text-sm text-muted-foreground">+966 5XXXX XXXX</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center p-6 h-32">
                  <Mail className="w-8 h-8 mb-2" />
                  <span>Email Us</span>
                  <span className="text-sm text-muted-foreground">support@deliveryhub.com</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center p-6 h-32">
                  <MessageCircle className="w-8 h-8 mb-2" />
                  <span>Live Chat</span>
                  <span className="text-sm text-muted-foreground">24/7 Support</span>
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Send us a message</h3>
                <div className="space-y-4">
                  <Input placeholder="Your name" />
                  <Input placeholder="Your email" />
                  <Textarea placeholder="How can we help you?" rows={4} />
                  <Button className="w-full">Send Message</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}