import { requestUrl } from "obsidian";

export interface OllamaResponse {
	response: string;
	done: boolean;
}

export class OllamaClient {
	private url: string;
	private model: string;

	constructor(url: string, model: string) {
		this.url = url.endsWith("/") ? url.slice(0, -1) : url;
		this.model = model;
	}

	// helper to clean local paths in prompt templates
	private cleanPath(path: string): string {
		return path.replace(".md", "");
	}

	// query ollama
	public async generateCounterarguments(thesis: string, contextNotes: { path: string; content: string }[]): Promise<string> {
		console.log("preparing ollama payload...");
		
		const prompt = this.buildPrompt(thesis, contextNotes);
		
		const ollama_payload = {
			model: this.model,
			prompt: prompt,
			stream: false
		};
		
		const endpoint = `${this.url}/api/generate`;
		
		try {
			const res = await requestUrl({
				url: endpoint,
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(ollama_payload)
			});
			
			if (res.status !== 200) {
				throw new Error(`Ollama HTTP Error: ${res.status}`);
			}
			
			const json = res.json as OllamaResponse;
			console.log("OLLAMA RAW RES:", json.response);
			return json.response;
		} catch (error) {
			console.error("ollama request failed:", error);
			throw error;
		}
	}

	private buildPrompt(thesis: string, contextNotes: { path: string; content: string }[]): string {
		return "placeholder prompt";
	}
}
