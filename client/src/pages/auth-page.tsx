import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Redirect } from "wouter";
import { Loader2, Package, Truck, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().min(2),
  email: z.string().email(),
  role: z.literal("customer"),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", fullName: "", email: "", role: "customer" },
  });

  if (user) {
    if (user.role === "admin" || user.role === "subadmin") return <Redirect to="/admin" />;
    if (user.role === "driver") return <Redirect to="/driver" />;
    return <Redirect to="/customer" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Enhanced Hero Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Trusted by thousands
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black font-display leading-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent"
          >
            Delivery made <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">simple</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-lg"
          >
            Connect with top-rated drivers and get anything delivered, anywhere, anytime.
            Join our marketplace today.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-6 mt-10"
          >
            <div className="p-6 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-lg border-2 border-purple-100">
              <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">15k+</div>
              <div className="text-base font-semibold text-muted-foreground">Active Drivers</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl shadow-lg border-2 border-purple-100">
              <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">2M+</div>
              <div className="text-base font-semibold text-muted-foreground">Orders Delivered</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Auth Forms */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-2xl hover:shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-black font-display bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-lg">Login to your account or create a new one</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-purple-50/50 border border-purple-200 p-1">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-purple-100 rounded-xl py-3"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-purple-100 rounded-xl py-3"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-6">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="johndoe" 
                                className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••" 
                                className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John Doe" 
                                  className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Username</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="johndoe" 
                                  className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="john@example.com" 
                                className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••" 
                                className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">I am a</FormLabel>
                            <div className="grid grid-cols-1 gap-2">
                              <Button
                                type="button"
                                variant={field.value === "customer" ? "default" : "outline"}
                                onClick={() => field.onChange("customer")}
                                className={`h-12 border-2 ${
                                  field.value === "customer"
                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-600 text-white shadow-lg hover:shadow-xl"
                                    : "border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                                } rounded-xl transition-all`}
                              >
                                Customer
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Create Account"}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-6 text-center text-base text-muted-foreground">
                    <a href="/driver/register" className="text-purple-600 hover:text-purple-700 hover:underline font-semibold">
                      Are you a driver? Register here
                    </a>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}