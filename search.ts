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
		// placeholder for tokenizer logic
		return [];
	}









	// helper to get all markdown files
	public async crawlVault(): Promise<TFile[]> {
		// placeholder for crawler logic
		return [];
	}









	// scoring function
	public async search(thesis: string, count = 5): Promise<SearchResult[]> {
		console.log("searching vault for:", thesis);
		// placeholder for mathematical TF-IDF scoring logic
		return [];
	}
}
