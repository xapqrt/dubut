import { Plugin, Notice } from "obsidian";
import { TfidfEngine } from "./search";

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

		// Create ribbon icon
		const ribbonIconEl = this.addRibbonIcon('swords', 'Debate Partner', (evt: MouseEvent) => {
			console.log("ribbon clicked, but need editor selection for thesis_junk");
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
		for (const match of matches) {
			console.log(`Match: ${match.file.path} (score: ${match.score.toFixed(4)})`);
		}
	}
}
