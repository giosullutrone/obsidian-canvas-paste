import { Plugin, WorkspaceLeaf, setIcon } from 'obsidian';

export default class CanvasPasteButtonPlugin extends Plugin {
    async onload() {
        console.log('Loading Canvas Paste Button Plugin');

        // Process existing canvas views
        this.app.workspace.getLeavesOfType('canvas').forEach((leaf) => {
            this.addPasteButtonToCanvas(leaf);
        });

        // Listen for layout changes to catch new canvas views
        this.registerEvent(
            this.app.workspace.on('layout-change', () => {
                this.app.workspace.getLeavesOfType('canvas').forEach((leaf) => {
                    this.addPasteButtonToCanvas(leaf);
                });
            })
        );
    }

    onunload() {
        console.log('Unloading Canvas Paste Button Plugin');
    }

    addPasteButtonToCanvas(leaf: WorkspaceLeaf) {
        const canvasView = leaf.view;
        if (canvasView.getViewType() !== 'canvas') {
            return;
        }

        const container = canvasView.containerEl;

        // Find the toolbar in the canvas view
        const toolbar = container.querySelector('.canvas-controls');

        if (toolbar) {
            // Check if the paste button group already exists
            const existingGroup = toolbar.querySelector('.canvas-paste-control-group');
            if (!existingGroup) {
                // Create a new control group for the paste button
                const controlGroup = document.createElement('div');
                controlGroup.classList.add('canvas-control-group', 'canvas-paste-control-group');

                // Create the control item
                const controlItem = document.createElement('div');
                controlItem.classList.add('canvas-control-item');

                // Create the paste button
                const button = document.createElement('button');
                button.type = 'button'; // Ensures proper button behavior
                button.classList.add('canvas-paste-button', 'clickable-icon', 'view-action');

                // Set the icon using Obsidian's setIcon function
                setIcon(button, 'clipboard'); // Ensure 'clipboard' is a valid icon

                // Add aria-label and title for tooltip
                button.setAttribute('aria-label', 'Paste');
                button.setAttribute('title', 'Paste');

                // Add click event listener to handle paste action
                button.addEventListener('click', async () => {
                    await this.pasteContentIntoCanvas(canvasView);
                });

                // Append the button to the control item
                controlItem.appendChild(button);

                // Append the control item to the control group
                controlGroup.appendChild(controlItem);

                // Append the control group to the toolbar
                toolbar.appendChild(controlGroup);
            }
        }
    }

    async pasteContentIntoCanvas(canvasView: any) {
        try {
            // Read text from the clipboard
            const clipboardText = await navigator.clipboard.readText();

            if (clipboardText) {
                // Access the canvas object
                const canvas = canvasView.canvas;

                console.log('Pasting content into canvas:', canvas);

                // Determine the position to add the new text node
                const nodePosition = {
                    x: canvas.x,
                    y: canvas.y,
                };

                // Set default size for the new node
                const nodeSize = { width: 300, height: 100 };

                // Create a new text node with the pasted content
                const newNode = canvas.createTextNode({
                    pos: nodePosition,
                    text: clipboardText,
                    save: true,
                    focus: false,
                    size: nodeSize,
                });

                // Optionally, select the new node
                canvas.deselectAll();
                canvas.selectOnly(newNode);
            }
        } catch (error) {
            console.error('Failed to paste content into canvas:', error);
        }
    }
}
