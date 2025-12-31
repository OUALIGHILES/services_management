/**
 * Utility functions for product management
 */

import { Product } from "@shared/schema";

/**
 * Filters products by subcategory ID
 * @param products - Array of products to filter
 * @param subcategoryId - ID of the subcategory to filter by
 * @returns Filtered array of products
 */
export function filterProductsBySubcategory(products: Product[], subcategoryId: string | undefined): Product[] {
  if (!subcategoryId) {
    return products;
  }
  
  return products.filter(product => 
    product.subcategoryId && product.subcategoryId === subcategoryId
  );
}

/**
 * Filters products by category ID
 * @param products - Array of products to filter
 * @param categoryId - ID of the category to filter by
 * @returns Filtered array of products
 */
export function filterProductsByCategory(products: Product[], categoryId: string): Product[] {
  return products.filter(product => 
    product.categoryId === categoryId
  );
}

/**
 * Checks if a product belongs to a specific subcategory
 * @param product - Product to check
 * @param subcategoryId - Subcategory ID to check against
 * @returns Boolean indicating if product belongs to subcategory
 */
export function isProductInSubcategory(product: Product, subcategoryId: string | undefined): boolean {
  if (!subcategoryId) {
    return false;
  }
  
  return product.subcategoryId === subcategoryId;
}

/**
 * Checks if a product belongs to a specific category
 * @param product - Product to check
 * @param categoryId - Category ID to check against
 * @returns Boolean indicating if product belongs to category
 */
export function isProductInCategory(product: Product, categoryId: string): boolean {
  return product.categoryId === categoryId;
}

/**
 * Gets products that don't belong to any subcategory (only category)
 * @param products - Array of products to filter
 * @param categoryId - Category ID to filter by
 * @returns Filtered array of products that belong to the category but not to any subcategory
 */
export function getProductsInCategoryOnly(products: Product[], categoryId: string): Product[] {
  return products.filter(product =>
    product.categoryId === categoryId && (!product.subcategoryId || product.subcategoryId === "")
  );
}