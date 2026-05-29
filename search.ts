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

	// term frequency calculation
	private computeTf(tokens: string[]): Map<string, number> {
		const tfMap = new Map<string, number>();
		if (tokens.length === 0) return tfMap;

		for (const token of tokens) {
			tfMap.set(token, (tfMap.get(token) || 0) + 1);
		}

		for (const [token, count] of tfMap.entries()) {
			tfMap.set(token, count / tokens.length);
		}

		return tfMap;
	}

	// inverse document frequency calculation
	private computeIdf(allDocsTokens: string[][], terms: Set<string>): Map<string, number> {
		const idfMap = new Map<string, number>();
		const numDocs = allDocsTokens.length;

		for (const term of terms) {
			let docsWithTerm = 0;
			for (const tokens of allDocsTokens) {
				if (tokens.includes(term)) {
					docsWithTerm++;
				}
			}
			// standard idf formula with smoothing
			idfMap.set(term, Math.log((numDocs + 1) / (docsWithTerm + 1)) + 1);
		}

		return idfMap;
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
		const thesisTokens = this.tokenize(thesis);
		if (thesisTokens.length === 0) return [];

		const files = await this.crawlVault();
		const allDocsTokens: string[][] = [];
		const docFiles: TFile[] = [];

		// Read and tokenize all files
		for (const file of files) {
			try {
				const content = await this.app.vault.cachedRead(file);
				allDocsTokens.push(this.tokenize(content));
				docFiles.push(file);
			} catch (e) {
				// obsidian's cache api is literally a maze, skipping file
			}
		}

		// Gather query terms
		const queryTerms = new Set(thesisTokens);
		const idfs = this.computeIdf(allDocsTokens, queryTerms);

		const results: SearchResult[] = [];

		for (let i = 0; i < docFiles.length; i++) {
			const tokens = allDocsTokens[i];
			const tfs = this.computeTf(tokens);
			let math_score = 0;

			for (const term of thesisTokens) {
				const tf = tfs.get(term) || 0;
				const idf = idfs.get(term) || 0;
				math_score += tf * idf;
			}

			if (math_score > 0) {
				results.push({
					file: docFiles[i],
					score: math_score
				});
			}
		}

		// Sort desc and slice
		return results.sort((a, b) => b.score - a.score).slice(0, count);
	}
}
