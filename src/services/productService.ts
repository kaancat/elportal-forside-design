
import { ElectricityProduct, ProductsResponse } from '@/types/product';
import productsData from '@/data/products.json';

export class ProductService {
  private static sortProducts(products: ElectricityProduct[]): ElectricityProduct[] {
    return products.sort((a, b) => {
      // Vindstød products always come first
      if (a.isVindstoedProduct && !b.isVindstoedProduct) return -1;
      if (!a.isVindstoedProduct && b.isVindstoedProduct) return 1;
      
      // If both are Vindstød products
      if (a.isVindstoedProduct && b.isVindstoedProduct) {
        // Sort by sortOrderVindstoed if available
        if (a.sortOrderVindstoed !== undefined && b.sortOrderVindstoed !== undefined) {
          return a.sortOrderVindstoed - b.sortOrderVindstoed;
        }
        // Fallback to product name
        return a.productName.localeCompare(b.productName);
      }
      
      // If both are competitor products
      if (!a.isVindstoedProduct && !b.isVindstoedProduct) {
        // Sort by sortOrderCompetitor if available
        if (a.sortOrderCompetitor !== undefined && b.sortOrderCompetitor !== undefined) {
          return a.sortOrderCompetitor - b.sortOrderCompetitor;
        }
        // Fallback to supplier name
        return a.supplierName.localeCompare(b.supplierName);
      }
      
      return 0;
    });
  }

  public static async getAllProducts(): Promise<ProductsResponse> {
    // Simulate API call delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const sortedProducts = ProductService.sortProducts([...productsData.products]);
    
    return {
      products: sortedProducts,
      lastUpdated: productsData.lastUpdated
    };
  }

  public static async getProductById(id: string): Promise<ElectricityProduct | null> {
    const response = await this.getAllProducts();
    return response.products.find(product => product.id === id) || null;
  }

  public static async getVindstoedProducts(): Promise<ElectricityProduct[]> {
    const response = await this.getAllProducts();
    return response.products.filter(product => product.isVindstoedProduct);
  }

  public static async getCompetitorProducts(): Promise<ElectricityProduct[]> {
    const response = await this.getAllProducts();
    return response.products.filter(product => !product.isVindstoedProduct);
  }
}
