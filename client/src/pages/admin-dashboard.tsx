import { Redirect } from "wouter";

export default function AdminDashboard() {
  // Redirect to main admin dashboard since detailed stats are now integrated there
  return <Redirect to="/admin" />;
}
