import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SeoSettings {
  siteTitle: string;
  metaDescription: string;
  defaultKeywords: string;
  author: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  pageSpecific?: {
    [page: string]: {
      title?: string;
      description?: string;
      keywords?: string;
    };
  };
}

export function useSeoSettings() {
  const queryClient = useQueryClient();

  const { data: seoSettings, isLoading, error } = useQuery<SeoSettings>({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const response = await fetch("/api/admin-settings/seo", {
        credentials: "include"
      });
      if (!response.ok) {
        if (response.status === 404) {
          // Return default settings if not found
          return {
            siteTitle: "GoDelivery - Fast & Reliable Delivery Service",
            metaDescription: "GoDelivery connects customers with reliable drivers for all their delivery needs. Fast, secure, and convenient delivery service.",
            defaultKeywords: "delivery, service, logistics, transport",
            author: "GoDelivery Team",
            ogTitle: "GoDelivery - Fast & Reliable Delivery Service",
            ogDescription: "GoDelivery connects customers with reliable drivers for all their delivery needs. Fast, secure, and convenient delivery service.",
            ogImage: "/images/og-image.jpg",
            twitterCard: "summary_large_image",
          };
        }
        throw new Error("Failed to fetch SEO settings");
      }
      return response.json();
    },
  });

  const updateSeoSettings = useMutation({
    mutationFn: async (settings: SeoSettings) => {
      const response = await fetch("/api/admin-settings/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update SEO settings");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
    },
  });

  return {
    seoSettings,
    isLoading,
    error,
    updateSeoSettings: updateSeoSettings.mutate,
    isUpdating: updateSeoSettings.isPending,
  };
}