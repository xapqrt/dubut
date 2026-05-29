import { App, TFile } from "obsidian";

export interface SearchResult {
	file: TFile;
	score: number;
}

export class TfidfEngine {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	// tokenizer helper
	public tokenize(text: string): string[] {
		if (!text) return [];
		
		// clean, lower and regex out the garbage
		const clean = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\n\r]/g, " ");
		const words = clean.split(/\s+/);
		
		// lazy list of stop words to filter out the noise
		const stopwords = new Set(["the", "a", "and", "is", "in", "to", "of", "that", "it", "for", "on", "with", "as", "this", "but", "by", "are"]);
		
		return words.filter(w => w.length > 1 && !stopwords.has(w));
	}









	// helper to get all markdown files
	public async crawlVault(): Promise<TFile[]> {
		const files = this.app.vault.getMarkdownFiles();
		console.log("vault files scanned:", files.length);
		return files;
	}









	// scoring function
	public async search(thesis: string, count = 5): Promise<SearchResult[]> {
		console.log("searching vault for:", thesis);
		// placeholder for mathematical TF-IDF scoring logic
		return [];
	}
}
