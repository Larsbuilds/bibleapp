import { Verse, Chapter } from '@/types/bible';

class BibleDataService {
  private data: {
    verses: { [key: string]: Verse };
    chapters: { [key: string]: Chapter };
  } = {
    verses: {},
    chapters: {}
  };

  private static instance: BibleDataService;
  private initialized = false;
  private initializing = false;
  private readonly PROXY_URL = 'http://localhost:3001';
  private readonly RATE_LIMIT_DELAY = 5000; // 5 seconds delay between requests
  private readonly MAX_RETRIES = 3;
  private lastRequestTime = 0;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  private constructor() {
    // Add cleanup on window unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.cleanup());
    }
  }

  static getInstance(): BibleDataService {
    if (!BibleDataService.instance) {
      BibleDataService.instance = new BibleDataService();
    }
    return BibleDataService.instance;
  }

  cleanup(): void {
    // Clear localStorage
    try {
      localStorage.removeItem('bibleData');
      console.log('Cleared Bible data from localStorage');
    } catch (error) {
      console.error('Failed to clear Bible data from localStorage:', error);
    }

    // Reset service state
    this.data = {
      verses: {},
      chapters: {}
    };
    this.initialized = false;
    this.initializing = false;
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.lastRequestTime = 0;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Error processing queue request:', error);
        }
      }
      // Add delay between queue items
      await this.delay(this.RATE_LIMIT_DELAY);
    }
    this.isProcessingQueue = false;
  }

  private async queueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('BibleDataService already initialized');
      return;
    }

    if (this.initializing) {
      console.log('BibleDataService is already initializing');
      return;
    }

    this.initializing = true;

    try {
      // Try to load from localStorage first
      const savedData = localStorage.getItem('bibleData');
      if (savedData) {
        console.log('Found cached data in localStorage');
        const parsedData = JSON.parse(savedData);
        if (this.validateData(parsedData) && this.hasValidContent(parsedData)) {
          this.data = parsedData;
          this.initialized = true;
          console.log('Loaded data from localStorage:', {
            verseCount: Object.keys(this.data.verses).length,
            chapterCount: Object.keys(this.data.chapters).length
          });
          return;
        } else {
          console.log('Cached data validation failed, will fetch fresh data');
          localStorage.removeItem('bibleData'); // Clear invalid data
        }
      }

      console.log('No valid cached data found, fetching from API');
      // If no valid data in localStorage, fetch from API
      await this.fetchAllData();
    } catch (error) {
      console.error('Failed to initialize Bible data:', error);
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  private validateData(data: any): boolean {
    const isValid = data &&
      typeof data === 'object' &&
      typeof data.verses === 'object' &&
      typeof data.chapters === 'object';
    
    console.log('Data validation result:', isValid);
    return isValid;
  }

  private hasValidContent(data: any): boolean {
    const verseCount = Object.keys(data.verses).length;
    const chapterCount = Object.keys(data.chapters).length;
    
    const hasContent = verseCount > 0 && chapterCount > 0;
    console.log('Content validation:', { verseCount, chapterCount, hasContent });
    return hasContent;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, retries = 0): Promise<Response> {
    return this.queueRequest(async () => {
      try {
        // Ensure minimum delay between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
          await this.delay(this.RATE_LIMIT_DELAY - timeSinceLastRequest);
        }

        console.log('Fetching URL:', url);
        const response = await fetch(url);
        this.lastRequestTime = Date.now();

        if (response.status === 429) {
          throw new Error('RATE_LIMIT_EXCEEDED');
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
      } catch (error) {
        if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
          throw error; // Don't retry rate limit errors
        }
        
        if (retries < this.MAX_RETRIES) {
          console.log(`Retrying request (${retries + 1}/${this.MAX_RETRIES})...`);
          await this.delay(this.RATE_LIMIT_DELAY * (retries + 1));
          return this.fetchWithRetry(url, retries + 1);
        }
        throw error;
      }
    });
  }

  private async fetchAllData(): Promise<void> {
    try {
      // Fetch data in chunks to avoid rate limiting
      const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];
      for (const book of books) {
        try {
          console.log(`Fetching data for ${book}`);
          // Add delay between requests to avoid rate limiting
          await this.delay(this.RATE_LIMIT_DELAY);

          const response = await this.fetchWithRetry(
            `${this.PROXY_URL}/api/bible/passage?q=${encodeURIComponent(book)}`
          );
          
          const data = await response.json();
          console.log(`Received data for ${book}:`, data);
          this.processPassageData(data);
        } catch (error) {
          console.error(`Error fetching ${book}:`, error);
          // Continue with next book even if one fails
          continue;
        }
      }

      // Save to localStorage
      this.saveToLocalStorage();
      this.initialized = true;
      console.log('Data initialization complete:', {
        verseCount: Object.keys(this.data.verses).length,
        chapterCount: Object.keys(this.data.chapters).length
      });
    } catch (error) {
      console.error('Error fetching Bible data:', error);
      throw error;
    }
  }

  private processPassageData(data: any): void {
    if (!data || !data.passages || !Array.isArray(data.passages)) {
      console.error('Invalid passage data:', data);
      return;
    }

    console.log('Processing passage data:', data);

    for (const passage of data.passages) {
      // Extract book name and chapter from the reference
      const reference = passage.reference;
      const match = reference.match(/^(\w+)\s+(\d+)/);
      if (!match) {
        console.error('Could not parse reference:', reference);
        continue;
      }

      const [, book_name, chapter] = match;
      
      // Create chapter object
      const chapterData: Chapter = {
        book: book_name,
        chapter: parseInt(chapter),
        verses: []
      };

      // Process the passage text
      if (!passage.text) {
        console.error('No text in passage:', passage);
        continue;
      }

      // Split the text into verses
      const verseLines = passage.text.split('\n');
      for (const line of verseLines) {
        // Extract verse number and text
        const verseMatch = line.match(/\[(\d+)\]\s+(.+)/);
        if (!verseMatch) {
          continue;
        }

        const [, verse_number, text] = verseMatch;
        const verseId = `${book_name}:${chapter}:${verse_number}`;
        
        const verseData: Verse = {
          id: verseId,
          reference: `${book_name} ${chapter}:${verse_number}`,
          text: text.trim(),
          book: book_name,
          chapter: parseInt(chapter),
          verse: parseInt(verse_number),
          translation: 'ESV'
        };

        // Add verse to data
        this.data.verses[verseId] = verseData;
        chapterData.verses.push(verseData);
      }

      // Add chapter to data
      this.data.chapters[`${book_name}:${chapter}`] = chapterData;
    }

    console.log('Processed data:', {
      verseCount: Object.keys(this.data.verses).length,
      chapterCount: Object.keys(this.data.chapters).length
    });
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('bibleData', JSON.stringify(this.data));
      console.log('Saved data to localStorage');
    } catch (error) {
      console.error('Failed to save Bible data to localStorage:', error);
    }
  }

  getVerse(verseId: string): Verse | undefined {
    return this.data.verses[verseId];
  }

  getChapter(chapterId: string): Chapter | undefined {
    return this.data.chapters[chapterId];
  }

  getAllVerses(): Verse[] {
    return Object.values(this.data.verses);
  }

  searchVerses(query: string): Verse[] {
    const searchQuery = query.toLowerCase();
    return Object.values(this.data.verses).filter(verse =>
      verse.text.toLowerCase().includes(searchQuery)
    );
  }

  searchByReference(reference: string): Verse[] {
    // Parse reference (e.g., "Genesis 1:1" or "John 3:16")
    const match = reference.match(/^(\w+)\s+(\d+)(?::(\d+))?$/);
    if (!match) {
      return [];
    }

    const [, book, chapter, verse] = match;
    const chapterId = `${book}:${chapter}`;
    const chapterData = this.getChapter(chapterId);

    if (!chapterData) {
      return [];
    }

    if (verse) {
      const verseId = `${book}:${chapter}:${verse}`;
      const verseData = this.getVerse(verseId);
      return verseData ? [verseData] : [];
    }

    return chapterData.verses;
  }
}

export const bibleDataService = BibleDataService.getInstance(); 