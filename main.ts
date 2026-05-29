import { Plugin } from "obsidian";

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
}
