import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Phone, Video, MoreVertical, Paperclip, Camera } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'customer' | 'driver';
  timestamp: string;
  type: 'text' | 'image';
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I'm your driver. I'll be picking up your delivery in 10 minutes.",
      sender: 'driver',
      timestamp: "10:30 AM",
      type: 'text'
    },
    {
      id: 2,
      text: "Great! I'll be ready. Please note there's a dog at home.",
      sender: 'customer',
      timestamp: "10:32 AM",
      type: 'text'
    },
    {
      id: 3,
      text: "Noted! I have your delivery information. I'll be right there.",
      sender: 'driver',
      timestamp: "10:33 AM",
      type: 'text'
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const newMsg: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'customer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
      {/* Chat Header */}
      <Card className="rounded-none border-b">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/driver-avatar.jpg" alt="Driver" />
              <AvatarFallback>DS</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold">Driver Ahmed</h3>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'customer'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted rounded-bl-none'
              }`}
            >
              {message.type === 'image' ? (
                <div className="relative">
                  <img 
                    src="/placeholder-image.jpg" 
                    alt="Shared image" 
                    className="rounded-lg max-h-40 object-cover"
                  />
                </div>
              ) : (
                <p>{message.text}</p>
              )}
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'customer' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <Card className="rounded-none border-t">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Camera className="w-4 h-4" />
            </Button>
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}