let idCounter = 0;

export function generateId(): string {
  return `${Date.now()}${String(++idCounter).padStart(4, '0')}`;
}

export function applyPlaceholders(json: string, botId: string): string {
  return json
    .replace(/\{\{id\}\}/g, generateId)
    .replace(/\{\{ts\}\}/g, () => String(Math.floor(Date.now() / 1000)))
    .replace(/\{\{bot\}\}/g, botId);
}
