// This is a simple task queue for NodeJS.

export default class Queue {
    private tasks: (() => Promise<void>)[] = [];
    private running: boolean = false;
    private onFinish: (() => void)[] = [];

    // Add a task to the queue.
    async addTask(task: () => Promise<void>) {
        this.tasks.push(task);
        if (!this.running) {
            await this.processQueue();
        }
    }

    // Process the next task in the queue.
    private async processQueue() {
        if (this.tasks.length === 0) {
            // There are no more tasks to execute.
            this.running = false;
            // Resolve all promises that are waiting for the queue to finish.
            this.onFinish.forEach(resolve => resolve());
            this.onFinish = [];
        } else {
            // Execute the next task.
            this.running = true;
            const task = this.tasks.shift();
            try {
                await task!();
            } catch (error) {
                console.error("Error executing task:", error);
            }
            // Continue processing the queue
            await this.processQueue();
        }
    }

    // Wait until all tasks have finished.
    async waitUntilFinished() {
        if (!this.running) return;
        // Save a promise to resolve when the queue is finished.
        return new Promise<void>((resolve) => {
            this.onFinish.push(resolve);
        });
    }
}