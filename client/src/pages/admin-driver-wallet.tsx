import { useDrivers } from "@/hooks/use-drivers";
import { useTransactions, useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  DollarSign,
  ArrowUp,
  ArrowDown,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  Minus,
  Search,
  Filter
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { api, buildUrl } from "@shared/routes";
import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Define transaction type based on schema
type Transaction = {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'adjustment' | 'commission';
  amount: string;
  status: string;
  metadata?: any;
  createdAt: string;
};

type Driver = {
  id: string;
  userId: string;
  vehicleId?: string;
  status: string;
  walletBalance: string;
  special: boolean;
  profile?: any;
  createdAt: string;
  user?: {
    fullName?: string;
    email?: string;
  };
  fullName?: string;
  email?: string;
};

const walletAdjustmentFormSchema = z.object({
  driverId: z.string().min(1, "Driver is required"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) !== 0, {
    message: "Amount must be a valid number and not zero"
  }),
  type: z.enum(['adjustment', 'commission'], { required_error: "Type is required" }),
  reason: z.string().min(1, "Reason is required")
});

type WalletAdjustmentFormValues = z.infer<typeof walletAdjustmentFormSchema>;

export default function AdminDriverWallet() {
  const { data: drivers, isLoading: loadingDrivers } = useDrivers();
  const { data: transactions, isLoading: loadingTransactions } = useTransactions();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  // Create transaction mutation for wallet adjustments
  const createTransaction = useCreateTransaction();

  // Filter transactions for driver-related transactions only
  const driverTransactions = transactions?.filter(t => 
    drivers?.some(d => d.userId === t.userId)
  ) || [];

  // Calculate wallet stats
  const totalDriverWallets = drivers?.reduce((sum, driver) => {
    return sum + Number(driver.walletBalance || 0);
  }, 0) || 0;

  const totalWithdrawalRequests = driverTransactions?.filter(t => 
    t.type === 'withdrawal' && t.status === 'pending'
  ).length || 0;

  const totalCompletedWithdrawals = driverTransactions?.filter(t => 
    t.type === 'withdrawal' && t.status === 'completed'
  ).reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  // Form for wallet adjustments
  const form = useForm<WalletAdjustmentFormValues>({
    resolver: zodResolver(walletAdjustmentFormSchema),
    defaultValues: {
      driverId: "",
      amount: "",
      type: "adjustment",
      reason: ""
    },
  });

  const handleAdjustmentSubmit = (data: WalletAdjustmentFormValues) => {
    // Find the driver to get their userId
    const driver = drivers?.find(d => d.id === data.driverId);
    if (!driver) {
      toast({
        title: "Error",
        description: "Driver not found",
        variant: "destructive"
      });
      return;
    }

    // Create adjustment transaction
    createTransaction.mutate({
      userId: driver.userId,
      type: data.type as 'adjustment' | 'commission',
      amount: data.amount,
      status: 'completed',
      metadata: {
        reason: data.reason,
        adjustedBy: "admin"
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Wallet Adjustment Successful",
          description: `Wallet adjustment of $${data.amount} has been applied to the driver's account.`
        });
        // Close dialog and reset form
        setIsAdjustmentDialogOpen(false);
        form.reset();

        // Invalidate both transactions and drivers to refresh the UI
        // This ensures the updated wallet balance is shown
        queryClient.invalidateQueries({ queryKey: [api.drivers.list.path] });
        queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to adjust wallet",
          variant: "destructive"
        });
      }
    });
  };

  // Filter transactions for a specific driver
  const getDriverTransactions = (driverId: string) => {
    const driver = drivers?.find(d => d.id === driverId);
    if (!driver) return [];
    return driverTransactions.filter(t => t.userId === driver.userId);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Wallet Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {/* Total Driver Wallets */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-green-300 transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-green-900">Total Driver Wallets</CardTitle>
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
              >
                <Wallet className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              >
                ${totalDriverWallets.toFixed(2)}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Combined driver balances
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Drivers */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-blue-900">Active Drivers</CardTitle>
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
              >
                <DollarSign className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                {drivers?.filter(d => d.status === 'online' || d.status === 'approved').length || 0}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Currently active
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Withdrawals */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-purple-900">Pending Withdrawals</CardTitle>
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg"
              >
                <ArrowDown className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"
              >
                {totalWithdrawalRequests}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Completed Withdrawals */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-indigo-300 transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-indigo-900">Withdrawn Amount</CardTitle>
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg"
              >
                <ArrowUp className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
              >
                ${totalCompletedWithdrawals.toFixed(2)}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Total withdrawn
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Wallet Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-4"
      >
        <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adjust Driver Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adjust Driver Wallet</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAdjustmentSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="driverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a driver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivers?.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.user?.fullName || driver.id.slice(0, 8)}
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Enter amount"
                            className="pl-8"
                            {...field}
                          />
                        </div>
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
                      <FormLabel>Adjustment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="adjustment">Adjustment</SelectItem>
                          <SelectItem value="commission">Commission</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Reason for adjustment" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAdjustmentDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTransaction.isPending}
                  >
                    {createTransaction.isPending ? "Submitting..." : "Apply Adjustment"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Wallet Data
        </Button>
      </motion.div>

      {/* Driver Wallets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl font-black font-display bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Driver Wallets
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search drivers..."
                    className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDrivers ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : drivers && drivers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Wallet Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Special</TableHead>
                      <TableHead>Last Transaction</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => {
                      const driverTransactions = getDriverTransactions(driver.id);
                      const lastTransaction = driverTransactions.length > 0 
                        ? driverTransactions[0] 
                        : null;
                      
                      return (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{driver.user?.fullName || `Driver ${driver.id.slice(0, 8)}`}</div>
                                <div className="text-xs text-muted-foreground">{driver.user?.email || 'N/A'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {driver.walletBalance || "0.00"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={driver.status} />
                          </TableCell>
                          <TableCell>
                            {driver.special ? (
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {lastTransaction ? (
                              <div className="text-xs">
                                <div>{new Date(lastTransaction.createdAt).toLocaleDateString()}</div>
                                <div className="text-muted-foreground capitalize">{lastTransaction.type}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No transactions</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedDriver(driver.id);
                                }}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  form.setValue('driverId', driver.id);
                                  setIsAdjustmentDialogOpen(true);
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Wallet className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No drivers found</h3>
                <p className="text-muted-foreground">
                  There are no drivers in the system yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Withdrawal Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-display bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Pending Withdrawal Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : driverTransactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Account Info</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {driverTransactions
                      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
                      .map((transaction) => {
                        const driver = drivers?.find(d => d.userId === transaction.userId);
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {transaction.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              {driver?.fullName || `Driver ${transaction.userId.slice(0, 8)}`}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-1 text-red-600">
                                <ArrowDown className="w-4 h-4" />
                                <span>${transaction.amount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                                {transaction.metadata?.method || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {transaction.metadata?.accountInfo || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" className="text-green-600 border-green-600">
                                  Approve
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ArrowDown className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No pending withdrawals</h3>
                <p className="text-muted-foreground">
                  There are no pending withdrawal requests at the moment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}