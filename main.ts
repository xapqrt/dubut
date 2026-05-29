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

		// Create ribbon icon
		const ribbonIconEl = this.addRibbonIcon('swords', 'Debate Partner', (evt: MouseEvent) => {
			console.log("ribbon clicked, but need editor selection for thesis_junk");
		});
		ribbonIconEl.addClass('debate-partner-ribbon-class');

		// Status bar shows status
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Debate Partner: Ready');
		
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
