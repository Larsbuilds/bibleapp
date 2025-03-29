export interface Verse {
  id: string;
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
  translation: string;
}

export interface Chapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

export interface BibleReference {
  book: string;
  chapter: number;
  verse?: number;
}

export interface SearchResult {
  verses: Verse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // in days
  readings: {
    day: number;
    references: BibleReference[];
  }[];
}

export interface Bookmark {
  id: string;
  verseId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export interface Highlight {
  id: string;
  verseId: string;
  userId: string;
  color: string;
  createdAt: string;
  updatedAt: string;
} 