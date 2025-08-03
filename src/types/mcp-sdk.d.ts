declare module "@modelcontextprotocol/sdk/server/index.js" {
    export class Server {
        constructor(
            serverInfo: { name: string; version: string },
            options: {
                capabilities: {
                    tools: Record<string, any>;
                    prompts: Record<string, any>;
                    notifications: Record<string, any>;
                    logging: Record<string, any>;
                };
            }
        );
        
        setRequestHandler(schema: any, handler: (request: any) => Promise<any>): void;
        notification(notification: { method: string; params: any }): Promise<void>;
        connect(transport: any): Promise<void>;
    }
}

declare module "@modelcontextprotocol/sdk/server/stdio.js" {
    export class StdioServerTransport {
        constructor();
    }
}

declare module "@modelcontextprotocol/sdk/types.js" {
    export const CallToolRequestSchema: any;
    export const ListToolsRequestSchema: any;
    export const ListPromptsRequestSchema: any;
    export const GetPromptRequestSchema: any;
} 