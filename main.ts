import { Plugin, Notice } from "obsidian";
import { TfidfEngine } from "./search";
import { OllamaClient } from "./ollama";
import { DebatePartnerView, DEBATE_PARTNER_VIEW_TYPE, DebateArgument } from "./view";

interface DebatePartnerSettings {
	ollamaUrl: string;
	ollamaModel: string;
}

const DEFAULT_SETTINGS: DebatePartnerSettings = {
	ollamaUrl: "http://localhost:11434",
	ollamaModel: "llama3",
};

export default class DebatePartnerPlugin extends Plugin {
	settings: DebatePartnerSettings = DEFAULT_SETTINGS;

	async onload() {
		console.log("loading debate partner... M4 is warming up");
		
		await this.loadSettings();

		this.registerView(
			DEBATE_PARTNER_VIEW_TYPE,
			(leaf) => new DebatePartnerView(leaf)
		);

		// Create ribbon icon
		const ribbonIconEl = this.addRibbonIcon('swords', 'Debate Partner', async (evt: MouseEvent) => {
			await this.activateView();
		});
		ribbonIconEl.addClass('debate-partner-ribbon-class');

		// Status bar shows status
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Debate Partner: Ready');

		this.addCommand({
			id: "challenge-my-thinking",
			name: "Challenge My Thinking",
			editorCallback: async (editor, view) => {
				const selection = editor.getSelection();
				await this.handleChallenge(selection);
			}
		});
		
		// obsidian's cache api is literally a maze, need to remember to hook it up
	}

	onunload() {
		console.log("unloaded debate partner. peace.");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async handleChallenge(thesis_junk: string) {
		if (!thesis_junk || thesis_junk.trim() === "") {
			new Notice("No thesis selected! Highlight some text first.");
			return;
		}
		new Notice(`Challenging: "${thesis_junk.substring(0, 30)}..."`);
		console.log("editor api is grabbing the highlighted text: ", thesis_junk);

		const engine = new TfidfEngine(this.app);
		const matches = await engine.search(thesis_junk, 5);
		console.log("matching notes found:", matches.length);
		
		if (matches.length === 0) {
			new Notice("No matching notes found in the vault to argue with.");
			return;
		}

		new Notice(`Found ${matches.length} relevant notes!`);
		
		const contextNotes = [];
		for (const match of matches) {
			const content = await this.app.vault.cachedRead(match.file);
			contextNotes.push({
				path: match.file.path,
				content: content
			});
		}

		// Activate view and display loading
		await this.activateView();
		const loadingLeaf = this.app.workspace.getLeavesOfType(DEBATE_PARTNER_VIEW_TYPE)[0];
		if (loadingLeaf) {
			const view = loadingLeaf.view as DebatePartnerView;
			view.showLoading(thesis_junk);
		}

		new Notice("Challenging your thesis via Ollama...");
		const client = new OllamaClient(this.settings.ollamaUrl, this.settings.ollamaModel);
		
		try {
			const response = await client.generateCounterarguments(thesis_junk, contextNotes);
			new Notice("Debate Partner: Counterarguments generated successfully!");
			
			const args = this.parseOllamaResponse(response);
			await this.activateView();

			const leaf = this.app.workspace.getLeavesOfType(DEBATE_PARTNER_VIEW_TYPE)[0];
			if (leaf) {
				const view = leaf.view as DebatePartnerView;
				view.updateArguments(thesis_junk, args);
			}
		} catch (err) {
			new Notice("Failed to communicate with Ollama. Is it running locally?");
			console.error(err);
		}
	}

	async activateView() {
		const { workspace } = this.app;

		let the_sidebar = workspace.getLeavesOfType(DEBATE_PARTNER_VIEW_TYPE)[0];
		if (!the_sidebar) {
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				await rightLeaf.setViewState({
					type: DEBATE_PARTNER_VIEW_TYPE,
					active: true,
				});
				the_sidebar = rightLeaf;
			}
		}

		if (the_sidebar) {
			workspace.revealLeaf(the_sidebar);
		}
	}

	private parseOllamaResponse(raw_text: string): DebateArgument[] {
		console.log("OLLAMA RAW RES:", raw_text);
		try {
			let cleanText = raw_text.trim();
			const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
			if (jsonMatch) {
				cleanText = jsonMatch[1].trim();
			}

			const startIdx = cleanText.indexOf("[");
			const endIdx = cleanText.lastIndexOf("]");
			if (startIdx !== -1 && endIdx !== -1) {
				cleanText = cleanText.substring(startIdx, endIdx + 1);
			}

			const parsed = JSON.parse(cleanText);
			if (Array.isArray(parsed)) {
				return parsed.map((item: any) => ({
					argument: item.argument || "No argument provided.",
					severity: item.severity || "Medium"
				}));
			}
		} catch (e) {
			console.error("Failed to parse Ollama response as JSON:", e);
		}

		// fallback to a dummy argument if everything fails
		return [{
			argument: "Failed to parse Ollama response: " + raw_text.substring(0, 100) + "...",
			severity: "Medium"
		}];
	}
}
