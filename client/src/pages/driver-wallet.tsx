import { useAuth } from "@/hooks/use-auth";
import { useTransactions, useCreateTransaction } from "@/hooks/use-transactions";
import { useQuery } from "@tanstack/react-query";
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
  Minus
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

const withdrawalFormSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number"
  }),
  method: z.string().min(1, "Method is required"),
  accountInfo: z.string().min(1, "Account information is required")
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

export default function DriverWallet() {
  const { user } = useAuth();
  const driverId = user?.driverProfile?.id;
  const { toast } = useToast();
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);

  // Fetch driver's transactions
  const { data: transactions, isLoading: loadingTransactions } = useTransactions({
    userId: user?.id
  });

  // Create transaction mutation for withdrawal requests
  const createTransaction = useCreateTransaction();

  // Calculate wallet stats
  const walletBalance = parseFloat(user?.driverProfile?.walletBalance || "0");

  const totalDeposits = transactions?.reduce((sum, transaction) => {
    if (transaction.type === 'deposit' && transaction.status === 'completed') {
      return sum + Number(transaction.amount);
    }
    return sum;
  }, 0) || 0;

  const totalWithdrawals = transactions?.reduce((sum, transaction) => {
    if (transaction.type === 'withdrawal' && transaction.status === 'completed') {
      return sum + Number(transaction.amount);
    }
    return sum;
  }, 0) || 0;

  const totalAdjustments = transactions?.reduce((sum, transaction) => {
    if (transaction.type === 'adjustment') {
      return sum + Number(transaction.amount);
    }
    return sum;
  }, 0) || 0;

  const totalCommissions = transactions?.reduce((sum, transaction) => {
    if (transaction.type === 'commission' && transaction.status === 'completed') {
      return sum + Number(transaction.amount);
    }
    return sum;
  }, 0) || 0;

  // Form for withdrawal requests
  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: "",
      method: "bank_transfer",
      accountInfo: ""
    },
  });

  const handleWithdrawalSubmit = (data: WithdrawalFormValues) => {
    const withdrawalAmount = parseFloat(data.amount);

    if (withdrawalAmount > walletBalance) {
      toast({
        title: "Insufficient Funds",
        description: "You cannot withdraw more than your current wallet balance.",
        variant: "destructive"
      });
      return;
    }

    // Create withdrawal transaction
    createTransaction.mutate({
      userId: user!.id,
      type: 'withdrawal',
      amount: data.amount,
      status: 'pending',
      metadata: {
        method: data.method,
        accountInfo: data.accountInfo,
        requestedBy: user?.id
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Withdrawal Request Submitted",
          description: "Your withdrawal request has been submitted and is pending approval."
        });
        setIsWithdrawalDialogOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to submit withdrawal request",
          variant: "destructive"
        });
      }
    });
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
        {/* Current Wallet Balance */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-green-300 transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-green-900">Wallet Balance</CardTitle>
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
                ${walletBalance.toFixed(2)}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Available funds
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-blue-900">Total Earnings</CardTitle>
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
                ${(totalCommissions + totalAdjustments).toFixed(2)}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Commissions & adjustments
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Withdrawals */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-purple-900">Withdrawn</CardTitle>
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
                ${totalWithdrawals.toFixed(2)}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Total withdrawn
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Deposits */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-indigo-300 transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-indigo-900">Deposits</CardTitle>
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
                ${totalDeposits.toFixed(2)}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Total deposits
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
        <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={walletBalance <= 0}>
              <Minus className="w-4 h-4 mr-2" />
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleWithdrawalSubmit)} className="space-y-4">
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
                            min="0.01"
                            max={walletBalance}
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
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Withdrawal Method</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md bg-background"
                          {...field}
                        >
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cash">Cash</option>
                          <option value="mobile_money">Mobile Money</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Information</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Account number, mobile number, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-muted-foreground">
                  Current balance: ${walletBalance.toFixed(2)}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsWithdrawalDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTransaction.isPending}
                  >
                    {createTransaction.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Download Statement
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-display bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {transaction.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.type === 'deposit' && (
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <ArrowUp className="w-4 h-4 text-green-600" />
                              </div>
                            )}
                            {transaction.type === 'withdrawal' && (
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                <ArrowDown className="w-4 h-4 text-red-600" />
                              </div>
                            )}
                            {transaction.type === 'adjustment' && (
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                            {transaction.type === 'commission' && (
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                              </div>
                            )}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className={`flex items-center gap-1 ${transaction.type === 'withdrawal' || transaction.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                            {transaction.type === 'withdrawal' || transaction.amount.startsWith('-') ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                            <span>${transaction.amount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={transaction.status} />
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Wallet className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                <p className="text-muted-foreground">
                  Your wallet transactions will appear here once you start earning or making withdrawals.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}