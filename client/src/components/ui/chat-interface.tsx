import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Phone, Video, MoreVertical } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'driver';
  timestamp: Date;
}

interface ChatInterfaceProps {
  orderId: string;
  driverName: string;
  driverAvatar?: string;
  initialMessages?: Message[];
  onSendMessage: (message: string) => void;
}

export default function ChatInterface({ 
  orderId, 
  driverName, 
  driverAvatar, 
  initialMessages = [],
  onSendMessage 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Mock initial messages
  useEffect(() => {
    if (initialMessages.length === 0) {
      setMessages([
        {
          id: "1",
          text: "Hi there! I'm your driver for today's delivery. I'll be picking up your items in about 30 minutes.",
          sender: "driver",
          timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
          id: "2",
          text: "Great! The items are fragile, please handle with care.",
          sender: "customer",
          timestamp: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
        },
        {
          id: "3",
          text: "Understood. I'll be extra careful with your items. I'll update you when I arrive at the pickup location.",
          sender: "driver",
          timestamp: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
        }
      ]);
    }
  }, [initialMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "customer",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    onSendMessage(newMessage);
    setNewMessage("");
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <Card className="rounded-none border-0 border-b rounded-b-lg">
        <CardHeader className="p-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={driverAvatar} alt={driverName} />
              <AvatarFallback>{driverName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{driverName}</CardTitle>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Container */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'customer'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-card text-foreground rounded-bl-none'
              }`}
            >
              <p>{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'customer' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <Card className="rounded-none border-0 border-t rounded-t-lg">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}