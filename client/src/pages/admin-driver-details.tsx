import { useParams } from "wouter";
import { useDriver } from "@/hooks/use-drivers";
import { useUser } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Car, 
  DollarSign, 
  MapPin, 
  Calendar,
  Phone,
  Mail,
  Copy,
  ArrowLeft,
  CheckCircle,
  XCircle
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";

export default function AdminDriverDetails() {
  const { id } = useParams();
  const { data: driver, isLoading, error } = useDriver(id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading driver details: {error?.message || "Driver not found"}</div>
      </div>
    );
  }

  // Get user details for the driver
  const { data: user, isLoading: userLoading } = useUser(driver.userId || "");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-display">Driver Details</h2>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Drivers
        </Button>
      </div>

      {/* Driver Summary Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {user?.fullName || `Driver ${driver.id.slice(0, 8)}`}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(driver.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={driver.status || "pending"} />
                <span className="text-sm text-muted-foreground">
                  ID: {driver.id}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              ${driver.walletBalance || "0.00"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Driver ID</h3>
              <p className="font-mono text-sm">{driver.id}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={driver.status || "pending"} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Wallet Balance</h3>
              <p className="font-medium">${driver.walletBalance || "0.00"}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Special Driver</h3>
              <p className="font-medium">
                {driver.special ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Yes
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> No
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal & Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                <p>{user?.fullName || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p>{user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p>{user?.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                <p>{user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy h:mm a') : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Vehicle & Service Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Vehicle</h3>
                <p>{driver.vehicleId ? 'Assigned' : 'No vehicle assigned'}</p>
              </div>
              {driver.vehicleId && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Vehicle ID</h3>
                  <p className="font-mono text-sm">{driver.vehicleId}</p>
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Profile Data</h3>
                <pre className="text-sm bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(driver.profile || {}, null, 2)}
                </pre>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Driver Since</h3>
                <p>{driver.createdAt ? format(new Date(driver.createdAt), 'MMM dd, yyyy h:mm a') : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                <p className="font-mono text-sm">{driver.userId}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Special Driver</h3>
                <p>
                  {driver.special ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> No
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Wallet Balance</h3>
                <p className="text-lg font-semibold">${driver.walletBalance || "0.00"}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <StatusBadge status={driver.status || "pending"} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}