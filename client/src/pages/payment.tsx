import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Wallet, Smartphone, Banknote } from "lucide-react";
import { useLocation } from "wouter";

export default function PaymentPage() {
  const [location, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePayment = () => {
    // In a real app, this would process the payment
    console.log({ paymentMethod, cardNumber, expiryDate, cvv });
    // Redirect to order confirmation after payment
    setLocation("/customer/orders");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Payment Method</CardTitle>
          <p className="text-muted-foreground">Select how you'd like to pay for your service</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4">
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Banknote className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay the driver directly</p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="electronic" id="electronic" />
              <Label htmlFor="electronic" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium">Electronic Payment</p>
                    <p className="text-sm text-muted-foreground">Credit/Debit card or digital wallet</p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="wallet" id="wallet" />
              <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Wallet className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="font-medium">Wallet Balance</p>
                    <p className="text-sm text-muted-foreground">Use your account balance</p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === 'electronic' && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="font-medium">Enter Card Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input 
                    id="cardNumber" 
                    placeholder="1234 5678 9012 3456" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input 
                      id="expiryDate" 
                      placeholder="MM/YY" 
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input 
                      id="cvv" 
                      placeholder="123" 
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <div className="flex justify-between items-center mb-6 p-4 bg-muted rounded-lg">
              <span className="font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-primary">$120.00</span>
            </div>

            <Button 
              className="w-full py-6 text-lg" 
              size="lg"
              onClick={handlePayment}
            >
              Complete Payment
            </Button>

            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={() => window.history.back()}
            >
              Back to Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}