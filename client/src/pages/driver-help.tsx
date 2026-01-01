import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Phone, Mail, MessageCircle, Search, AlertTriangle, FileText, CreditCard, Package } from "lucide-react";
import { useCreateHelpTicket } from "@/hooks/use-help-center";
import { useCreateNotification } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";

export default function DriverHelp() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'report'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general',
    description: '',
    priority: 'medium'
  });

  const createTicketMutation = useCreateHelpTicket();
  const createNotificationMutation = useCreateNotification();
  const { user } = useAuth();

  const faqs = [
    {
      question: "How do I update my vehicle information?",
      answer: "Go to your profile section and select 'Vehicle Details' to update your vehicle information including make, model, license plate, and insurance details."
    },
    {
      question: "What if I have payment issues?",
      answer: "If you're experiencing payment issues, please contact support immediately. You can also check your payment history in the 'Earnings' section."
    },
    {
      question: "How do I report an order problem?",
      answer: "You can report order problems using the 'Report Issue' form in the Contact Support section. Include order number and detailed description of the issue."
    },
    {
      question: "What are the working hours?",
      answer: "You can set your own working hours in your profile. The app will show you available orders based on your preferred working times."
    },
    {
      question: "How do I update my availability?",
      answer: "You can update your availability status directly from the dashboard - either 'Available' or 'Not Available'."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTicket = () => {
    if (ticketForm.subject.trim() && ticketForm.description.trim()) {
      createTicketMutation.mutate({
        subject: ticketForm.subject,
        category: ticketForm.category,
        description: ticketForm.description,
        priority: ticketForm.priority,
        customerName: user?.name || "Driver",
        customerEmail: user?.email || "driver@example.com"
      }, {
        onSuccess: (ticket) => {
          // If the ticket is high priority, send a notification to admins
          if (ticket.priority === 'high') {
            createNotificationMutation.mutate({
              title: "Urgent Help Request",
              message: `A high priority help ticket has been created by a driver: ${ticket.subject}`,
              type: "urgent",
              userId: "admin", // This should be the admin user ID in a real implementation
              read: false
            });
          }

          // Reset form
          setTicketForm({
            subject: '',
            category: 'general',
            description: '',
            priority: 'medium'
          });
        }
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Driver Help Center</h1>
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
        <Button
          variant={activeTab === 'report' ? "default" : "ghost"}
          className="rounded-none border-b-2 -mb-px"
          onClick={() => setActiveTab('report')}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Report Issue
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
      ) : activeTab === 'contact' ? (
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
                  <span className="text-sm text-muted-foreground">driver-support@deliveryhub.com</span>
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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Report an Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Issue Category</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { value: 'payment', label: 'Payment', icon: CreditCard },
                      { value: 'order', label: 'Order Problem', icon: Package },
                      { value: 'vehicle', label: 'Vehicle', icon: FileText },
                      { value: 'general', label: 'General', icon: HelpCircle }
                    ].map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <Button
                          key={category.value}
                          variant={ticketForm.category === category.value ? "default" : "outline"}
                          className="flex flex-col items-center justify-center p-3 h-20"
                          onClick={() => setTicketForm({...ticketForm, category: category.value})}
                        >
                          <IconComponent className="w-5 h-5 mb-1" />
                          <span className="text-xs">{category.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { value: 'low', label: 'Low', color: 'text-gray-500' },
                      { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
                      { value: 'high', label: 'High', color: 'text-red-500' }
                    ].map((priority) => (
                      <Button
                        key={priority.value}
                        variant={ticketForm.priority === priority.value ? "default" : "outline"}
                        className={`p-3 ${priority.value === 'high' ? 'bg-red-100 text-red-700 hover:bg-red-200' : ''}`}
                        onClick={() => setTicketForm({...ticketForm, priority: priority.value})}
                      >
                        {priority.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Brief description of the issue"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Please provide detailed information about the issue..."
                  rows={5}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleCreateTicket}
                disabled={createTicketMutation.isPending || !ticketForm.subject.trim() || !ticketForm.description.trim()}
              >
                {createTicketMutation.isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}