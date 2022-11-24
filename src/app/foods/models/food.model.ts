import { FoodNutrition } from './food-nutrition.model';

export interface Food {
  id: string;
  type: string;
  subType?: string;
  name: string;
  description?: string;
  mainCategory?: string;
  subCategory?: string;
  slug: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  ingredients?: string[];
  dietTypes?: string[];
  mappedDietTypes?: string[];
  sku: string;
  price: number;
  quantity?: number;
  maxQuantity: number;
  isOutOfStock?: boolean;
  show?: boolean;
  isNew?: boolean;
  instructions: { step?: number; title?: string; details?: string }[];
  nutritionDisclaimer: string;
  allergens?: string[];
  nutritions?: FoodNutrition[];
  limitedTimeAvailability: {
    isSet: boolean;
    isModalShown: boolean;
    availableUntil: string;
  };
}
