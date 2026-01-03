import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MessageSquare, Headphones, FileText, Users, Clock, MessageCircle, Bot, AlertTriangle, CheckCircle, XCircle, Send, ArrowLeft, Edit3, Eye, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  useHelpTickets,
  useHelpArticles,
  useCreateHelpArticle,
  useUpdateHelpArticle,
  useUpdateHelpTicket,
  usePublishHelpArticle
} from "@/hooks/use-help-center";
import {
  useHelpMessages,
  useCreateHelpMessage
} from "@/hooks/use-help-messages";
import { useAuth } from "@/hooks/use-auth";

export default function AdminHelp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'articles', or 'messages'
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: '' });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  // Fetch help tickets and articles
  const { data: tickets = [], isLoading: ticketsLoading, refetch: refetchTickets } = useHelpTickets();
  const { data: articles = [], isLoading: articlesLoading, refetch: refetchArticles } = useHelpArticles();

  // Mutations for help center
  const createArticleMutation = useCreateHelpArticle();
  const updateArticleMutation = useUpdateHelpArticle();
  const updateTicketMutation = useUpdateHelpTicket();
  const publishArticleMutation = usePublishHelpArticle();

  // Fetch help messages for the selected ticket
  const { data: messages = [], isLoading: messagesLoading } = useHelpMessages(selectedTicket?.id);

  // Get unique conversation IDs (in this case, it's just the ticket ID)
  // For now, we'll use the ticket ID as the conversation ID
  const conversationIds = selectedTicket ? [selectedTicket.id] : [];

  // Get messages for selected conversation (ticket)
  const conversationMessages = messages;

  // Mutation for creating messages
  const createMessageMutation = useCreateHelpMessage();

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() && selectedTicket && user) {
      createMessageMutation.mutate({
        ticketId: selectedTicket.id,
        senderId: user.id,
        message: newMessage
      });
      setNewMessage('');
    }
  };

  // Handle creating a new article
  const handleCreateArticle = () => {
    if (newArticle.title.trim() && newArticle.content.trim() && newArticle.category.trim() && user) {
      createArticleMutation.mutate({
        title: newArticle.title,
        content: newArticle.content,
        category: newArticle.category,
        authorId: user.id,
        status: 'draft'
      });
      setNewArticle({ title: '', content: '', category: '' });
      setIsCreatingArticle(false);
    }
  };

  // Handle updating an article
  const handleUpdateArticle = () => {
    if (selectedArticle && newArticle.title.trim() && newArticle.content.trim() && newArticle.category.trim()) {
      updateArticleMutation.mutate({
        id: selectedArticle.id,
        updates: {
          title: newArticle.title,
          content: newArticle.content,
          category: newArticle.category
        }
      });
      setNewArticle({ title: '', content: '', category: '' });
      setSelectedArticle(null);
      setIsCreatingArticle(false);
    }
  };

  // Handle viewing a ticket
  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setActiveTab('tickets');
  };

  // Handle viewing an article
  const handleViewArticle = (article: any) => {
    setSelectedArticle(article);
    setActiveTab('articles');
  };

  // Handle editing an article
  const handleEditArticle = (article: any) => {
    setNewArticle({
      title: article.title,
      content: article.content || '',
      category: article.category,
    });
    setSelectedArticle(article);
    setIsCreatingArticle(true);
  };

  // Handle updating ticket status
  const handleUpdateTicketStatus = (ticketId: string, newStatus: string) => {
    updateTicketMutation.mutate({
      id: ticketId,
      updates: { status: newStatus }
    });
  };

  // Handle publishing an article
  const handlePublishArticle = (articleId: string) => {
    publishArticleMutation.mutate(articleId);
  };

  // Handle AI Response
  const handleAIResponse = () => {
    if (selectedTicket && user) {
      // In a real implementation, this would call an AI service
      createMessageMutation.mutate({
        ticketId: selectedTicket.id,
        senderId: user.id, // In a real implementation, this would be an AI user ID
        message: "AI: I've analyzed your issue and recommend the following solution..."
      });
    }
  };

  // Handle Admin Intervention
  const handleAdminIntervention = () => {
    if (selectedTicket) {
      // In a real implementation, this might mark all messages as read or escalate the ticket
      console.log("Admin intervention for ticket:", selectedTicket.id);
    }
  };

  // Reset to main view
  const resetView = () => {
    setSelectedTicket(null);
    setSelectedArticle(null);
    setIsCreatingArticle(false);
  };

  return (
    <div className="space-y-8">
      {selectedTicket ? (
        // Ticket Detail View
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={resetView}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Button>
            <h2 className="text-2xl font-bold font-display">Ticket Details</h2>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{selectedTicket.subject}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedTicket.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedTicket.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedTicket.priority === 'high' ? 'destructive' : selectedTicket.priority === 'medium' ? 'default' : 'secondary'}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedTicket.status === 'open' ? 'secondary' : selectedTicket.status === 'in-progress' ? 'default' : 'outline'}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  {selectedTicket.status !== 'resolved' && (
                    <>
                      <Button
                        onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'in-progress')}
                        disabled={selectedTicket.status === 'in-progress' || updateTicketMutation.isPending}
                      >
                        {updateTicketMutation.isPending &&
                          updateTicketMutation.variables?.id === selectedTicket.id &&
                          updateTicketMutation.variables?.updates.status === 'in-progress' ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Mark In Progress
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')}
                        disabled={updateTicketMutation.isPending}
                      >
                        {updateTicketMutation.isPending &&
                          updateTicketMutation.variables?.id === selectedTicket.id &&
                          updateTicketMutation.variables?.updates.status === 'resolved' ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Mark Resolved
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'open')}
                    disabled={selectedTicket.status === 'open' || updateTicketMutation.isPending}
                  >
                    {updateTicketMutation.isPending &&
                      updateTicketMutation.variables?.id === selectedTicket.id &&
                      updateTicketMutation.variables?.updates.status === 'open' ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Reopen Ticket
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : isCreatingArticle ? (
        // Article Creation/Edit View
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={resetView}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
            <h2 className="text-2xl font-bold font-display">
              {selectedArticle ? 'Edit Article' : 'Create New Article'}
            </h2>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{selectedArticle ? 'Edit Article' : 'Create New Article'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                    placeholder="Enter article title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({...newArticle, category: e.target.value})}
                    placeholder="Enter category"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                    placeholder="Enter article content"
                    rows={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={selectedArticle ? handleUpdateArticle : handleCreateArticle}
                    disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                  >
                    {(createArticleMutation.isPending || updateArticleMutation.isPending) ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {selectedArticle ? 'Update Article' : 'Create Article'}
                  </Button>
                  <Button variant="outline" onClick={resetView}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : selectedArticle ? (
        // Article Detail View
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={resetView}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
            <h2 className="text-2xl font-bold font-display">Article Details</h2>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{selectedArticle.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{selectedArticle.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedArticle.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(selectedArticle.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={selectedArticle.status === 'published' ? 'default' : selectedArticle.status === 'draft' ? 'secondary' : 'outline'}>
                      {selectedArticle.status}
                    </Badge>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p>{selectedArticle.content || 'No content available.'}</p>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button onClick={() => handleEditArticle(selectedArticle)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Article
                  </Button>
                  {selectedArticle.status !== 'published' && (
                    <Button
                      onClick={() => handlePublishArticle(selectedArticle.id)}
                      disabled={publishArticleMutation.isPending}
                    >
                      {publishArticleMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Publish Article
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Main Help Center View
        <>
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
              <Button
                onClick={() => setIsCreatingArticle(true)}
                disabled={createArticleMutation.isPending}
              >
                {createArticleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                New Article
              </Button>
            </div>
          </div>

          <Tabs defaultValue="tickets" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
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
                      <div className="text-2xl font-bold">{ticketsLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : tickets.length}</div>
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Total Tickets
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">
                        {ticketsLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : tickets.filter(t => t.status === 'open').length}
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
                        {ticketsLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : tickets.filter(t => t.status === 'in-progress').length}
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
                        {ticketsLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : tickets.filter(t => t.status === 'resolved').length}
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
                      {ticketsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                      ) : tickets.length > 0 ? (
                        tickets.map(ticket => (
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
                                    <span>{ticket.customerName}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket)}>
                                <MessageCircle className="w-4 h-4 mr-2" />
                                View Ticket
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
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
                        {tickets.map(ticket => {
                          // For each ticket, we'll show the most recent message
                          // In a real implementation, we would fetch the latest message for each ticket
                          return (
                            <div
                              key={ticket.id}
                              className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                                selectedTicket?.id === ticket.id ? 'bg-primary/10 border-primary' : ''
                              }`}
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setActiveTab('messages');
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{ticket.subject}</h3>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {ticket.customerName}: {ticket.description.substring(0, 50)}...
                                  </p>
                                </div>
                                {/* In a real implementation, we would show unread count */}
                                <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center">
                                  0
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          );
                        })}
                        {tickets.length === 0 && (
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
                  {selectedTicket ? (
                    <Card className="shadow-lg h-full flex flex-col">
                      <CardHeader>
                        <CardTitle>Conversation: {selectedTicket.subject}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto mb-4 max-h-96">
                          {messagesLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                          ) : conversationMessages.length > 0 ? (
                            <div className="space-y-4">
                              {conversationMessages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                      msg.senderId === user?.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{msg.senderId === user?.id ? 'You' : selectedTicket.customerName}</span>
                                      <span className="text-xs opacity-70">
                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p>{msg.message}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              No messages yet. Start the conversation!
                            </div>
                          )}
                        </div>

                        {/* Message Input */}
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            disabled={createMessageMutation.isPending}
                          />
                          <Button onClick={handleSendMessage} disabled={createMessageMutation.isPending}>
                            {createMessageMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        {/* AI Assistant and Admin Intervention */}
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={handleAIResponse}>
                            <Bot className="w-4 h-4 mr-2" />
                            AI Response
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleAdminIntervention}>
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
                      {articlesLoading ? (
                        <div className="col-span-2 flex justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                      ) : articles.length > 0 ? (
                        articles.map(article => (
                          <Card key={article.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium">{article.title}</h3>
                                <Badge variant={article.status === 'published' ? 'default' : article.status === 'draft' ? 'secondary' : 'outline'}>
                                  {article.status}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  <span>{article.views} views</span>
                                </div>
                                <div>{new Date(article.createdAt).toLocaleDateString()}</div>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditArticle(article)}>
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleViewArticle(article)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
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
        </>
      )}
    </div>
  );
}