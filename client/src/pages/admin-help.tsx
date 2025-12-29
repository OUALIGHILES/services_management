import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MessageSquare, Headphones, FileText, Users, Clock, MessageCircle, Bot, AlertTriangle, CheckCircle, XCircle, Send } from "lucide-react";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Mock data for help center
const mockTickets = [
  {
    id: "1",
    subject: "Payment not processed",
    category: "Billing",
    priority: "high",
    status: "open",
    customer: "John Doe",
    date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: "2",
    subject: "Driver not showing up",
    category: "Delivery",
    priority: "medium",
    status: "in-progress",
    customer: "Jane Smith",
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "3",
    subject: "App not working properly",
    category: "Technical",
    priority: "low",
    status: "resolved",
    customer: "Ahmed Hassan",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: "4",
    subject: "Refund request",
    category: "Billing",
    priority: "medium",
    status: "open",
    customer: "Fatima Ali",
    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

const mockArticles = [
  {
    id: "1",
    title: "How to place an order",
    category: "Getting Started",
    views: 1245,
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "2",
    title: "Payment methods accepted",
    category: "Billing",
    views: 987,
    date: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "3",
    title: "How to track your order",
    category: "Delivery",
    views: 765,
    date: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "4",
    title: "Canceling an order",
    category: "Orders",
    views: 543,
    date: new Date(Date.now() - 345600000).toISOString(),
  },
];

// Mock data for messages
const mockMessages = [
  {
    id: "1",
    conversationId: "conv-1",
    sender: "customer",
    senderName: "John Doe",
    message: "I'm having trouble with my order #12345. It hasn't been delivered yet.",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    read: false,
  },
  {
    id: "2",
    conversationId: "conv-1",
    sender: "driver",
    senderName: "Ahmed Driver",
    message: "I'm on my way now and will arrive in 10 minutes.",
    timestamp: new Date(Date.now() - 3500000).toISOString(), // 58 minutes ago
    read: true,
  },
  {
    id: "3",
    conversationId: "conv-2",
    sender: "customer",
    senderName: "Jane Smith",
    message: "Can you please update me on the status of my delivery?",
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: "4",
    conversationId: "conv-3",
    sender: "driver",
    senderName: "Khalid Driver",
    message: "Your order has been delivered. Please confirm receipt.",
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    read: true,
  },
];

export default function AdminHelp() {
  const [tickets] = useState(mockTickets);
  const [articles] = useState(mockArticles);
  const [messages] = useState(mockMessages);
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'articles', or 'messages'
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Get unique conversation IDs
  const conversationIds = [...new Set(messages.map(msg => msg.conversationId))];

  // Get messages for selected conversation
  const conversationMessages = selectedConversation
    ? messages.filter(msg => msg.conversationId === selectedConversation)
    : [];

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", newMessage, "to conversation:", selectedConversation);
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold font-display">Help Center</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search help content..."
              className="pl-10 pr-4 py-2 w-full md:w-64"
            />
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Support Tickets
            </div>
          </TabsTrigger>
          <TabsTrigger value="messages">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Message Center
            </div>
          </TabsTrigger>
          <TabsTrigger value="articles">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Knowledge Base
            </div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tickets">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{tickets.length}</div>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Total Tickets
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {tickets.filter(t => t.status === 'open').length}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    Open Tickets
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {tickets.filter(t => t.status === 'in-progress').length}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Headphones className="w-4 h-4" />
                    In Progress
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {tickets.filter(t => t.status === 'resolved').length}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" />
                    Resolved
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{ticket.subject}</h3>
                            <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'default' : 'secondary'}>
                              {ticket.priority}
                            </Badge>
                            <Badge variant={ticket.status === 'open' ? 'secondary' : ticket.status === 'in-progress' ? 'default' : 'outline'}>
                              {ticket.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{ticket.category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{ticket.customer}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(ticket.date).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          View Ticket
                        </Button>
                      </div>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No support tickets found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conversationIds.map((convId, index) => {
                      const convMessages = messages.filter(msg => msg.conversationId === convId);
                      const lastMessage = convMessages[convMessages.length - 1];
                      const unreadCount = convMessages.filter(msg => !msg.read && msg.sender !== 'admin').length;

                      return (
                        <div
                          key={convId}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedConversation === convId ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => setSelectedConversation(convId)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">Conversation {index + 1}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {lastMessage.senderName}: {lastMessage.message}
                              </p>
                            </div>
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="h-6 w-6 p-0 flex items-center justify-center">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(lastMessage.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      );
                    })}
                    {conversationIds.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No conversations found.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message View */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <Card className="shadow-lg h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Conversation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto mb-4 max-h-96">
                      <div className="space-y-4">
                        {conversationMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.sender === 'admin'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{msg.senderName}</span>
                                <span className="text-xs opacity-70">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p>{msg.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* AI Assistant and Admin Intervention */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Bot className="w-4 h-4 mr-2" />
                        AI Response
                      </Button>
                      <Button variant="outline" size="sm">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Admin Intervention
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg h-full flex items-center justify-center">
                  <CardContent className="text-center text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p>Select a conversation to view messages</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="articles">
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Knowledge Base Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map(article => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{article.title}</h3>
                          <Badge variant="secondary">{article.category}</Badge>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{article.views} views</span>
                          </div>
                          <div>{new Date(article.date).toLocaleDateString()}</div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {articles.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-muted-foreground">
                      No knowledge base articles found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}