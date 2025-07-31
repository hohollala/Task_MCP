
export function getToolDefinitions() {
  return [];
}

export function getPromptDefinitions() {
  return [];
}

export function executeTool(toolName, args, onOutput) {
  throw new Error(`Tool not found: ${toolName}`);
}

export function toolExists(toolName) {
  return false;
}

export function getPromptMessage(name) {
  return null;
}
