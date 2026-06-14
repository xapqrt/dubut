import { ItemView, WorkspaceLeaf } from "obsidian";

export const DEBATE_PARTNER_VIEW_TYPE = "debate-partner-view";

export interface DebateArgument {
	argument: string;
	severity: "High" | "Medium" | "Low";
}

export class DebatePartnerView extends ItemView {
	private thesis: string = "";
	private arguments: DebateArgument[] = [];
	private isLoading: boolean = false;
	private matchedNotes: string[] = [];

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return DEBATE_PARTNER_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Debate Partner";
	}

	// Show loading indicator
	public showLoading(thesis: string) {
		this.thesis = thesis;
		this.arguments = [];
		this.isLoading = true;
		this.onOpen();
	}

	// Update the content of the view
	public updateArguments(thesis: string, args: DebateArgument[], matchedNotes: string[] = []) {
		this.thesis = thesis;
		this.arguments = args;
		this.matchedNotes = matchedNotes;
		this.isLoading = false;
		this.onOpen(); // trigger redraw
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		
		const baseDiv = container.createEl("div", { cls: "debate-partner-container" });
		baseDiv.createEl("h4", { text: "Thesis Under Debate" });
		
		if (!this.thesis) {
			baseDiv.createEl("p", { text: "No thesis selected. Highlight text and trigger 'Challenge My Thinking'." });
			return;
		}

		baseDiv.createEl("blockquote", { text: this.thesis });
		baseDiv.createEl("h4", { text: "Counterarguments" });

		if (this.isLoading) {
			const loadingDiv = baseDiv.createEl("div", { cls: "debate-loading-container" });
			loadingDiv.createEl("div", { cls: "debate-spinner" });
			loadingDiv.createEl("p", { text: "M4 local AI is cooking steel-man counterarguments..." });
			return;
		}

		const listDiv = baseDiv.createEl("div", { cls: "debate-arguments-list" });
		for (const arg of this.arguments) {
			const itemDiv = listDiv.createEl("div", { cls: "debate-argument-item" });
			
			const headerDiv = itemDiv.createEl("div", { cls: "debate-argument-header" });
			headerDiv.createEl("span", { cls: `debate-indicator debate-indicator-${arg.severity.toLowerCase()}` });
			headerDiv.createEl("span", { 
				text: arg.severity.toUpperCase(), 
				cls: `debate-severity debate-severity-${arg.severity.toLowerCase()}` 
			});

			const textP = itemDiv.createEl("p", { 
				cls: "debate-argument-text" 
			});
			this.renderArgumentWithLinks(textP, arg.argument);
		}

		if (this.matchedNotes.length > 0) {
			baseDiv.createEl("h4", { text: "Matched Vault Context" });
			const pillsDiv = baseDiv.createEl("div", { cls: "debate-pills-container" });
			for (const note of this.matchedNotes) {
				const pillEl = pillsDiv.createEl("a", { 
					text: `📄 ${note}`, 
					cls: "debate-pill-tag internal-link" 
				});
				pillEl.addEventListener("click", async (e) => {
					e.preventDefault();
					await this.app.workspace.openLinkText(note, "", true);
				});
			}
		}
	}

	private renderArgumentWithLinks(parentEl: HTMLElement, text: string) {
		const regex = /\[\[(.*?)\]\]/g;
		let lastIndex = 0;
		let match;

		while ((match = regex.exec(text)) !== null) {
			const plainText = text.substring(lastIndex, match.index);
			if (plainText) {
				parentEl.appendChild(document.createTextNode(plainText));
			}

			const linkTarget = match[1];
			const linkEl = parentEl.createEl("a", { 
				text: linkTarget, 
				cls: "internal-link debate-citation-link" 
			});
			linkEl.href = "#";
			linkEl.addEventListener("click", async (e) => {
				e.preventDefault();
				await this.app.workspace.openLinkText(linkTarget, "", true);
			});

			lastIndex = regex.lastIndex;
		}

		const remainingText = text.substring(lastIndex);
		if (remainingText) {
			parentEl.appendChild(document.createTextNode(remainingText));
		}
	}

	async onClose() {
		// Nothing to clean up
	}
}
