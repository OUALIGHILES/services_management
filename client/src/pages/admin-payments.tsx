import { useTransactions } from "@/hooks/use-transactions";
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
import { Eye, DollarSign, Filter, Download, Plus, User, Truck, Wallet, CreditCard, FileText, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { Transaction } from "@shared/schema";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function AdminPayments() {
  const { data: transactions, isLoading } = useTransactions();
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    dateRange: "",
  });

  // Calculate stats based on transactions
  const totalRevenue = transactions?.reduce((sum, t) => {
    if (t.type === 'deposit' || t.type === 'commission') {
      return sum + Number(t.amount || 0);
    }
    return sum;
  }, 0) || 0;

  const pendingWithdrawals = transactions?.filter(t =>
    t.type === 'withdrawal' && t.status === 'pending'
  ).length || 0;

  const commissionEarned = transactions?.reduce((sum, t) => {
    if (t.type === 'commission') {
      return sum + Number(t.amount || 0);
    }
    return sum;
  }, 0) || 0;

  // Mock data for customer and driver balances
  const customerBalances = [
    { id: "1", name: "Ahmed Hassan", email: "ahmed@example.com", balance: 125.50 },
    { id: "2", name: "Mohammed Ali", email: "mohammed@example.com", balance: 89.75 },
    { id: "3", name: "Sara Khan", email: "sara@example.com", balance: 210.00 },
  ];

  const driverBalances = [
    { id: "1", name: "Khalid Ahmed", email: "khalid@example.com", balance: 1250.00 },
    { id: "2", name: "Omar Farooq", email: "omar@example.com", balance: 890.50 },
    { id: "3", name: "Youssef Mohamed", email: "youssef@example.com", balance: 1560.75 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold font-display">Payment Management</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Adjustment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">${totalRevenue.toFixed(2)}</h3>
              <p className="text-xs text-green-600 font-medium">+12.5% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Pending Withdrawals</p>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{pendingWithdrawals}</h3>
              <p className="text-xs text-muted-foreground">requests pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Commission Earned</p>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">${commissionEarned.toFixed(2)}</h3>
              <p className="text-xs text-green-600 font-medium">+5.2% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Balances</p>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">$4,216.50</h3>
              <p className="text-xs text-muted-foreground">Customer: $415.25, Driver: $3,801.25</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="money-adjustment">Money & Adjustment</TabsTrigger>
          <TabsTrigger value="deposits-withdrawals">Deposit & Withdrawal</TabsTrigger>
          <TabsTrigger value="customer-balances">Customer Balances</TabsTrigger>
          <TabsTrigger value="driver-balances">Driver Balances</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                      <TableCell>User {transaction.userId.slice(0, 8)}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded capitalize">
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {transaction.amount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!transactions || transactions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No transactions found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="money-adjustment">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Money & Adjustment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Adjustment
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adjustment ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">ADJ-001</TableCell>
                    <TableCell>Ahmed Hassan</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ArrowUp className="w-4 h-4 text-green-500" />
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Bonus</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        50.00
                      </div>
                    </TableCell>
                    <TableCell>Performance bonus</TableCell>
                    <TableCell>2023-05-15</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">ADJ-002</TableCell>
                    <TableCell>Khalid Ahmed</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ArrowDown className="w-4 h-4 text-red-500" />
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Correction</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        -25.00
                      </div>
                    </TableCell>
                    <TableCell>Incorrect payment</TableCell>
                    <TableCell>2023-05-10</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No adjustments found.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="deposits-withdrawals">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Deposit & Withdrawal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Process Request
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">REQ-001</TableCell>
                    <TableCell>Khalid Ahmed</TableCell>
                    <TableCell>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Withdrawal</span>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        150.00
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        Bank Transfer
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="pending" />
                    </TableCell>
                    <TableCell>2023-05-20</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          Reject
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">REQ-002</TableCell>
                    <TableCell>Ahmed Hassan</TableCell>
                    <TableCell>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Deposit</span>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        100.00
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        Credit Card
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status="completed" />
                    </TableCell>
                    <TableCell>2023-05-18</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No deposit/withdrawal requests found.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="customer-balances">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Customer Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Last Transaction</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerBalances.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span>{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {customer.balance.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>2023-05-20</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {customerBalances.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No customer balances found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="driver-balances">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Driver Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Last Transaction</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverBalances.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-primary" />
                          </div>
                          <span>{driver.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{driver.email}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {driver.balance.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>2023-05-20</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {driverBalances.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No driver balances found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}