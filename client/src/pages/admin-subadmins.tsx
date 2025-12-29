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
import { Edit, Eye, Plus, User, Shield, Lock, Trash2, Check, X, Settings } from "lucide-react";
import {
  useSubAdmins,
  useCreateSubAdmin,
  useUpdateSubAdmin,
  useDeleteSubAdmin,
  usePermissions,
  useSubAdminPermissions,
  useAssignPermission,
  useRemovePermission
} from "@/hooks/use-subadmins";
import { User as UserType, Permission as PermissionType } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Define sub-admin schema with permissions
const SubAdminSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SubAdminFormValues = z.infer<typeof SubAdminSchema>;

export default function AdminSubAdmins() {
  const { data: subAdmins, isLoading, refetch } = useSubAdmins();
  const { data: allPermissions, isLoading: permissionsLoading } = usePermissions();
  const createSubAdminMutation = useCreateSubAdmin();
  const updateSubAdminMutation = useUpdateSubAdmin();
  const deleteSubAdminMutation = useDeleteSubAdmin();
  const assignPermissionMutation = useAssignPermission();
  const removePermissionMutation = useRemovePermission();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<UserType | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [subAdminPermissions, setSubAdminPermissions] = useState<PermissionType[]>([]);

  // Form for adding/editing sub-admins
  const form = useForm<SubAdminFormValues>({
    resolver: zodResolver(SubAdminSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      isActive: true,
    },
  });

  // Load sub-admin permissions when a sub-admin is selected
  useEffect(() => {
    if (selectedSubAdmin) {
      const fetchSubAdminPermissions = async () => {
        try {
          const res = await fetch(`/api/subadmin-permissions/${selectedSubAdmin.id}`, {
            credentials: "include"
          });
          if (!res.ok) throw new Error("Failed to fetch sub-admin permissions");
          const permissions = await res.json();
          setSubAdminPermissions(permissions);
          setSelectedPermissions(permissions.map((p: PermissionType) => p.id));
        } catch (error) {
          console.error("Error fetching sub-admin permissions:", error);
          toast({
            title: "Error",
            description: "Failed to load sub-admin permissions",
            variant: "destructive",
          });
        }
      };

      fetchSubAdminPermissions();
    }
  }, [selectedSubAdmin, toast]);

  // Handle form submission for creating a new sub-admin
  const onSubmit = async (data: SubAdminFormValues) => {
    try {
      await createSubAdminMutation.mutateAsync({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        password: "defaultPassword123", // In a real app, this would be handled securely
      });

      toast({
        title: "Success",
        description: "Sub-admin created successfully",
      });

      form.reset();
      setIsAddDialogOpen(false);
      refetch(); // Refresh the data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sub-admin",
        variant: "destructive",
      });
    }
  };

  // Handle toggling sub-admin status
  const toggleSubAdminStatus = async (subAdmin: UserType) => {
    try {
      await updateSubAdminMutation.mutateAsync({
        id: subAdmin.id,
        isActive: !subAdmin.isActive,
      });

      toast({
        title: "Success",
        description: `Sub-admin status updated to ${!subAdmin.isActive ? 'active' : 'inactive'}`,
      });

      refetch(); // Refresh the data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sub-admin status",
        variant: "destructive",
      });
    }
  };

  // Handle deleting a sub-admin
  const handleDeleteSubAdmin = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sub-admin?")) {
      return;
    }

    try {
      await deleteSubAdminMutation.mutateAsync(id);

      toast({
        title: "Success",
        description: "Sub-admin deleted successfully",
      });

      refetch(); // Refresh the data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sub-admin",
        variant: "destructive",
      });
    }
  };

  // Handle opening edit dialog
  const openEditDialog = (subAdmin: UserType) => {
    setSelectedSubAdmin(subAdmin);
    form.reset({
      fullName: subAdmin.fullName,
      email: subAdmin.email,
      phone: subAdmin.phone || "",
      isActive: subAdmin.isActive,
    });
    setIsEditDialogOpen(true);
  };

  // Handle updating sub-admin
  const handleUpdateSubAdmin = async (data: SubAdminFormValues) => {
    if (!selectedSubAdmin) return;

    try {
      await updateSubAdminMutation.mutateAsync({
        id: selectedSubAdmin.id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
      });

      toast({
        title: "Success",
        description: "Sub-admin updated successfully",
      });

      form.reset();
      setIsEditDialogOpen(false);
      refetch(); // Refresh the data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sub-admin",
        variant: "destructive",
      });
    }
  };

  // Handle opening permission dialog
  const openPermissionDialog = (subAdmin: UserType) => {
    setSelectedSubAdmin(subAdmin);
    setIsPermissionDialogOpen(true);
  };

  // Handle permission toggle
  const togglePermission = async (permissionId: string) => {
    if (!selectedSubAdmin) return;

    try {
      if (selectedPermissions.includes(permissionId)) {
        // Remove permission
        await removePermissionMutation.mutateAsync({
          userId: selectedSubAdmin.id,
          permissionId
        });
        setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
      } else {
        // Add permission
        await assignPermissionMutation.mutateAsync({
          userId: selectedSubAdmin.id,
          permissionId
        });
        setSelectedPermissions(prev => [...prev, permissionId]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-display">Sub-Admin Management</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Sub-Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Sub-Admin</DialogTitle>
              <DialogDescription>
                Create a new sub-admin account with specific permissions
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createSubAdminMutation.isPending}>
                    {createSubAdminMutation.isPending ? "Creating..." : "Create Sub-Admin"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sub-Admin Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sub-Admin</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : subAdmins && subAdmins.length > 0 ? (
                subAdmins.map((subAdmin) => (
                  <TableRow key={subAdmin.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div>{subAdmin.fullName}</div>
                          <div className="text-xs text-muted-foreground">ID: {subAdmin.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{subAdmin.email}</TableCell>
                    <TableCell>{subAdmin.phone || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={subAdmin.isActive ? "active" : "inactive"} />
                        <Switch
                          checked={subAdmin.isActive}
                          onCheckedChange={() => toggleSubAdminStatus(subAdmin)}
                          aria-label="Toggle status"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {subAdminPermissions.length > 0 ?
                          `${subAdminPermissions.length} perms` :
                          "Custom"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {subAdmin.createdAt ? new Date(subAdmin.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPermissionDialog(subAdmin)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(subAdmin)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteSubAdmin(subAdmin.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No sub-admins found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Sub-Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sub-Admin</DialogTitle>
            <DialogDescription>
              Update the sub-admin account details
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateSubAdmin)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateSubAdminMutation.isPending}
                >
                  {updateSubAdminMutation.isPending ? "Updating..." : "Update Sub-Admin"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions for {selectedSubAdmin?.fullName}</DialogTitle>
            <DialogDescription>
              Configure what this sub-admin can access and manage
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {permissionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading permissions...</div>
            ) : allPermissions && allPermissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                      <p className="text-sm text-muted-foreground">{permission.description}</p>
                    </div>
                    <Switch
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                      aria-label={`Toggle ${permission.name} permission`}
                      disabled={assignPermissionMutation.isPending || removePermissionMutation.isPending}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No permissions available</div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPermissionDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}