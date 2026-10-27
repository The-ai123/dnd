import { utilityProcess, type UtilityProcess } from 'electron';

export class WorkerClient {
  private readonly child: UtilityProcess;
  private nextId = 0;
  private stopped = false;
  private readonly pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  constructor(path: string, serviceName: string) {
    this.child = utilityProcess.fork(path, [], { serviceName, stdio: 'pipe' });
    this.child.stderr?.on('data', (data: Buffer) => console.error(`[${serviceName}] ${data.toString()}`));
    this.child.on('message', (message: { id: number; result?: unknown; error?: string }) => {
      const request = this.pending.get(message.id);
      if (!request) return;
      clearTimeout(request.timer);
      this.pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error));
      else request.resolve(message.result);
    });
    this.child.on('exit', code => this.fail(new Error(`${serviceName} stopped (exit ${code})`)));
  }
  call(method: string, input?: unknown): Promise<unknown> {
    if (this.stopped) return Promise.reject(new Error('Worker is unavailable'));
    return new Promise((resolve, reject) => {
      const id = ++this.nextId;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Worker timed out: ${method}`));
      }, 30_000);
      this.pending.set(id, { resolve, reject, timer });
      this.child.postMessage({ id, method, input });
    });
  }
  private fail(error: Error): void {
    this.stopped = true;
    for (const request of this.pending.values()) { clearTimeout(request.timer); request.reject(error); }
    this.pending.clear();
  }
  close(): void { this.fail(new Error('Worker closed')); this.child.kill(); }
}
