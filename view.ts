import { ItemView, WorkspaceLeaf } from "obsidian";

export const DEBATE_PARTNER_VIEW_TYPE = "debate-partner-view";

export interface DebateArgument {
	argument: string;
	severity: "High" | "Medium" | "Low";
}

export class DebatePartnerView extends ItemView {
	private thesis: string = "";
	private arguments: DebateArgument[] = [];

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return DEBATE_PARTNER_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Debate Partner";
	}

	// Update the content of the view
	public updateArguments(thesis: string, args: DebateArgument[]) {
		this.thesis = thesis;
		this.arguments = args;
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
	}

	async onClose() {
		// Nothing to clean up
	}
}
