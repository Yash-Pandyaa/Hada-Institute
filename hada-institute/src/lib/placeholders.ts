import { marketplaceCopy } from "@/config/site";

export type StorefrontProduct = {
  id: string;
  title: string;
  slug: string;
  subject: string;
  category: string;
  classLevel: string;
  examType: string;
  description: string;
  thumbnailUrl: string;
  previewImages: string[];
  samplePdfUrl: string;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number;
  tags: string[];
  language: string;
  featured: boolean;
  stockStatus: "AVAILABLE" | "OUT_OF_STOCK";
  isPlaceholder?: boolean;
};

export const placeholderProducts: StorefrontProduct[] = [
  {
    id: "placeholder-foundation",
    title: "Placeholder Foundation Notes",
    slug: "placeholder-foundation-notes",
    subject: "Placeholder Subject",
    category: "Foundation",
    classLevel: "Class placeholder",
    examType: "Exam placeholder",
    description: marketplaceCopy.placeholderNotice,
    thumbnailUrl: "/images/note-cover-teal.svg",
    previewImages: ["/images/note-cover-teal.svg"],
    samplePdfUrl: "",
    price: 49900,
    compareAtPrice: 69900,
    discountPercent: 29,
    tags: ["Placeholder", "Digital PDF"],
    language: "English",
    featured: true,
    stockStatus: "AVAILABLE",
    isPlaceholder: true,
  },
  {
    id: "placeholder-revision",
    title: "Placeholder Revision Workbook",
    slug: "placeholder-revision-workbook",
    subject: "Placeholder Subject",
    category: "Revision",
    classLevel: "Class placeholder",
    examType: "Exam placeholder",
    description: marketplaceCopy.placeholderNotice,
    thumbnailUrl: "/images/note-cover-blue.svg",
    previewImages: ["/images/note-cover-blue.svg"],
    samplePdfUrl: "",
    price: 34900,
    compareAtPrice: 44900,
    discountPercent: 22,
    tags: ["Placeholder", "Practice"],
    language: "English",
    featured: true,
    stockStatus: "AVAILABLE",
    isPlaceholder: true,
  },
  {
    id: "placeholder-test-series",
    title: "Placeholder Test Prep Notes",
    slug: "placeholder-test-prep-notes",
    subject: "Placeholder Subject",
    category: "Test Prep",
    classLevel: "Class placeholder",
    examType: "Exam placeholder",
    description: marketplaceCopy.placeholderNotice,
    thumbnailUrl: "/images/note-cover-amber.svg",
    previewImages: ["/images/note-cover-amber.svg"],
    samplePdfUrl: "",
    price: 59900,
    compareAtPrice: null,
    discountPercent: 0,
    tags: ["Placeholder", "Exam Ready"],
    language: "English",
    featured: false,
    stockStatus: "AVAILABLE",
    isPlaceholder: true,
  },
];

export const placeholderCategories = [
  "Foundation",
  "Revision",
  "Test Prep",
  "Crash Course",
];

export const placeholderSubjects = [
  "Placeholder Subject",
  "Mathematics",
  "Science",
  "Reasoning",
];
