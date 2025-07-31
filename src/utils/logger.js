
export class Logger {
  static info(message, ...args) {
    console.log(`[INFO] ${message}`, ...args);
  }

  static error(message, ...args) {
    console.error(`[ERROR] ${message}`, ...args);
  }
}
