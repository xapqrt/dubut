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
		
		const ollama_payload = {
			model: this.model,
			prompt: "",
			stream: false
		};
		
		// placeholder for post request
		return "";
	}
}
