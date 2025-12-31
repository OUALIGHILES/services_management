import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import {
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  Filter,
  Download,
  Plus,
  User,
  CheckCircle,
  ShoppingBag,
  DollarSign
} from "lucide-react";

// Define the customer type based on project requirements
interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  registrationDate: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
  totalOrders: number;
  totalSpent: number;
  location: string;
}

// Mock data for customers - in a real app this would come from an API
const mockCustomers: Customer[] = [
  {
    id: '1',
    fullName: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    phone: '+966 50 123 4567',
    registrationDate: '2024-01-15',
    lastActive: '2024-12-28',
    status: 'active',
    totalOrders: 12,
    totalSpent: 2450.75,
    location: 'Riyadh, Saudi Arabia'
  },
  {
    id: '2',
    fullName: 'Fatima Al-Saud',
    email: 'fatima@example.com',
    phone: '+966 55 987 6543',
    registrationDate: '2024-02-20',
    lastActive: '2024-12-30',
    status: 'active',
    totalOrders: 8,
    totalSpent: 1850.50,
    location: 'Jeddah, Saudi Arabia'
  },
  {
    id: '3',
    fullName: 'Mohammed Ali',
    email: 'mohammed@example.com',
    phone: '+966 53 456 7890',
    registrationDate: '2024-03-10',
    lastActive: '2024-12-25',
    status: 'inactive',
    totalOrders: 3,
    totalSpent: 650.00,
    location: 'Dammam, Saudi Arabia'
  },
  {
    id: '4',
    fullName: 'Aisha Al-Zahrani',
    email: 'aisha@example.com',
    phone: '+966 54 234 5678',
    registrationDate: '2024-04-05',
    lastActive: '2024-12-29',
    status: 'active',
    totalOrders: 15,
    totalSpent: 3200.25,
    location: 'Makkah, Saudi Arabia'
  },
  {
    id: '5',
    fullName: 'Omar Al-Shammari',
    email: 'omar@example.com',
    phone: '+966 56 789 0123',
    registrationDate: '2024-05-12',
    lastActive: '2024-12-20',
    status: 'suspended',
    totalOrders: 5,
    totalSpent: 980.75,
    location: 'Medina, Saudi Arabia'
  },
  {
    id: '6',
    fullName: 'Noura Al-Ghamdi',
    email: 'noura@example.com',
    phone: '+966 58 345 6789',
    registrationDate: '2024-06-18',
    lastActive: '2024-12-31',
    status: 'active',
    totalOrders: 7,
    totalSpent: 1420.00,
    location: 'Tabuk, Saudi Arabia'
  }
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer; direction: 'asc' | 'desc' } | null>(null);

  // Apply search and filter
  useEffect(() => {
    let result = [...customers];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(customer => 
        customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(customer => customer.status === statusFilter);
    }
    
    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredCustomers(result);
  }, [searchTerm, statusFilter, customers, sortConfig]);

  const handleSort = (key: keyof Customer) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof Customer) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all registered customers in the system
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">{customers.filter(c => c.status === 'active').length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{customers.reduce((sum, customer) => sum + customer.totalOrders, 0)}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">SAR {customers.reduce((sum, customer) => sum + customer.totalSpent, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Customers List</CardTitle>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  className="border rounded-md px-3 py-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center gap-1">
                      Customer {getSortIndicator('fullName')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-1">
                      Email {getSortIndicator('email')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center gap-1">
                      Phone {getSortIndicator('phone')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-1">
                      Location {getSortIndicator('location')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status {getSortIndicator('status')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('totalOrders')}
                  >
                    <div className="flex items-center gap-1">
                      Orders {getSortIndicator('totalOrders')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('totalSpent')}
                  >
                    <div className="flex items-center gap-1">
                      Spent {getSortIndicator('totalSpent')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('lastActive')}
                  >
                    <div className="flex items-center gap-1">
                      Last Active {getSortIndicator('lastActive')}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.fullName}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={customer.status} />
                      </TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>SAR {customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{new Date(customer.lastActive).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No customers found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}