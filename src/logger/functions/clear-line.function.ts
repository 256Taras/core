export function clearLine(count = 1) {
  for (let i = 0; i < count; i++) {
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(1);
  }
}
