export interface SearchResult {
    reference: string;
    text: string;
    book: string;
    chapter: number;
    verse: number;
    translation: string;
    relevance: number;
}
export interface SearchResponse {
    results: SearchResult[];
    total: number;
    page: number;
    pageSize: number;
}
