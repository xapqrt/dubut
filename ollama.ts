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
		let notesText = "";
		for (const note of contextNotes) {
			const link = `[[${this.cleanPath(note.path)}]]`;
			notesText += `--- START OF NOTE: ${link} ---\n${note.content}\n--- END OF NOTE ---\n\n`;
		}

		// ollama sometimes hallucinates the markdown links, need a regex fix
		return `You are "Debate Partner", an adversarial reasoning engine. Your goal is to construct steel-man counterarguments against the user's thesis, using the provided context notes from their personal knowledge base as the source of contradiction or alternative perspectives.

User Thesis:
"${thesis}"

Context Notes (these are the user's existing beliefs/notes):
${notesText}

Please generate exactly 3 ranked counterarguments that challenge the thesis based on the context notes.
Format your output as a raw JSON array containing exactly 3 objects. Do NOT wrap it in markdown code blocks like \`\`\`json. Return ONLY the raw JSON string.

JSON Schema:
[
  {
    "argument": "The counterargument text. You must reference the specific note that contradicts the thesis by using its exact markdown link syntax: [[Note Name]], e.g., 'Your note [[Philosophy]] argues X, which directly contradicts...'",
    "severity": "High" | "Medium" | "Low"
  }
]`;
	}
}
