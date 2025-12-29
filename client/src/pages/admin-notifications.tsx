import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Bell, Plus, Mail, MessageCircle, Filter, Search, Download, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { Notification, InsertNotification } from "@shared/schema";
import { useNotifications, useUpdateNotification, useCreateNotification, useDeleteNotification } from "@/hooks/use-notifications";
import { useUsers } from "@/hooks/use-users";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sendNotificationSchema = z.object({
  userId: z.string().min(1, "User is required"),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.string().min(1, "Type is required"),
});

type SendNotificationFormValues = z.infer<typeof sendNotificationSchema>;

export default function AdminNotifications() {
  const { data: notifications, isLoading, refetch } = useNotifications();
  const { data: users } = useUsers();
  const updateNotification = useUpdateNotification();
  const createNotification = useCreateNotification();
  const deleteNotification = useDeleteNotification();
  const { toast } = useToast();

  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'read' | 'unread'>('all');
  const [viewNotification, setViewNotification] = useState<Notification | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const form = useForm<SendNotificationFormValues>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      userId: "",
      title: "",
      message: "",
      type: "general",
    },
  });

  const handleSendNotification = (data: SendNotificationFormValues) => {
    createNotification.mutate({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
    });
    setIsSendDialogOpen(false);
    form.reset();
  };

  const handleMarkAsRead = (id: string) => {
    updateNotification.mutate({ id, read: true });
  };

  const handleMarkAsUnread = (id: string) => {
    updateNotification.mutate({ id, read: false });
  };

  const handleViewNotification = (notification: Notification) => {
    setViewNotification(notification);
    setIsViewDialogOpen(true);
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification.mutate(id);
  };

  // Calculate stats
  const totalNotifications = notifications?.length || 0;
  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;
  const readNotifications = notifications?.filter(n => n.read).length || 0;

  // Filter notifications based on active tab
  const filteredNotifications = notifications?.filter(notification => {
    if (activeTab === 'read') return notification.read;
    if (activeTab === 'unread') return !notification.read;
    return true; // 'all' tab
  }) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-display">Admin Notifications</h2>
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
            <Bell className="w-4 h-4" />
            <span>{unreadNotifications} unread</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search notifications..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send New Notification</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSendNotification)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.fullName} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Notification title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Input placeholder="Notification message" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select notification type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="order">Order</SelectItem>
                            <SelectItem value="payment">Payment</SelectItem>
                            <SelectItem value="driver">Driver</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createNotification.isPending}>
                      {createNotification.isPending ? "Sending..." : "Send Notification"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Notifications</p>
              <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{totalNotifications}</h3>
              <p className="text-xs text-muted-foreground">all notifications</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Unread</p>
              <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{unreadNotifications}</h3>
              <p className="text-xs text-muted-foreground">need attention</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Read</p>
              <Mail className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{readNotifications}</h3>
              <p className="text-xs text-muted-foreground">processed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Notification Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Notification Type</TableHead>
                <TableHead>Notification Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => {
                const user = users?.find(u => u.id === notification.userId);
                return (
                  <TableRow key={notification.id} className={!notification.read ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">
                      {user?.fullName || `User ${notification.userId?.slice(0, 8) || notification.id.slice(0, 8)}`}
                    </TableCell>
                    <TableCell className="font-medium">
                      {notification.title}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{notification.message}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded capitalize">
                        {notification.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(notification.createdAt!).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={notification.read ? "read" : "unread"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewNotification(notification)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={notification.read}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleMarkAsUnread(notification.id)} disabled={notification.read}>
                              <Mail className="mr-2 h-4 w-4" />
                              Mark as Unread
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteNotification(notification.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredNotifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No notifications found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {viewNotification && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
                <p className="text-lg font-semibold">{viewNotification.title}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Message</h4>
                <p className="text-base">{viewNotification.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                  <p className="capitalize">{viewNotification.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <StatusBadge status={viewNotification.read ? "read" : "unread"} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                <p>{new Date(viewNotification.createdAt!).toLocaleString()}</p>
              </div>
              {viewNotification.userId && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Recipient</h4>
                  {users?.find(u => u.id === viewNotification.userId) ? (
                    <p>{users.find(u => u.id === viewNotification.userId)?.fullName} ({users.find(u => u.id === viewNotification.userId)?.email})</p>
                  ) : (
                    <p>User ID: {viewNotification.userId}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}