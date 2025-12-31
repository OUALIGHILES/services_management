// Minimal API route to satisfy Vercel deployment requirements
export default async function handler(req: any, res: any) {
  // For now, return a simple response to indicate the API is working
  res.status(200).json({ 
    message: "API is running", 
    status: "ready for deployment",
    timestamp: new Date().toISOString()
  });
}

export const config = {
  api: {
    bodyParser: true,
  },
};