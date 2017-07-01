declare module 'chokidar' {
  declare class FSWatcher {
    constructor(options: { ignored: RegExp, persistent: boolean }): this;
    on(string, (any) => void): void;
    add(string): void;
    unwatch(string): void;
  }
  declare module.exports: {
    FSWatcher: typeof FSWatcher
  };
}
