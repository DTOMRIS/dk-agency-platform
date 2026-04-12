import type { ListingCategory } from '@/lib/data/listingCategories';
import type { ListingWorkflowStatus } from '@/lib/utils/listingStatus';

export interface ListingImage {
  id: string;
  url: string;
  alt: string;
}

export interface ListingReviewNote {
  reviewer: string;
  note: string;
  score: number;
  createdAt: string;
}

export interface ListingLead {
  name: string;
  phone: string;
  email: string;
  message: string;
  status: 'new' | 'contacted';
  createdAt: string;
}

/**
 * Unified listing type used across API responses, admin UI and public showcase.
 * This is the shape returned by listingRepository map functions — NOT mock data.
 */
export interface Listing {
  id: number;
  slug: string;
  trackingCode: string;
  type: ListingCategory;
  status: ListingWorkflowStatus;
  title: string;
  description: string;
  price: number;
  priceLabel?: string;
  currency: 'AZN';
  city: string;
  district?: string;
  ownerName: string;
  phone: string;
  email: string;
  images: ListingImage[];
  isShowcase: boolean;
  isFeatured: boolean;
  typeSpecificData: Record<string, string | number | boolean>;
  reviewNotes: ListingReviewNote[];
  leads: ListingLead[];
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated Use Listing from @/lib/types/listing instead.
 * Kept for backward compatibility during migration.
 */
export type MockListing = Listing;
