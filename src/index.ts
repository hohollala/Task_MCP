#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { Logger } from "./utils/logger.js";
import { PROTOCOL } from "./constants.js";
import { getToolDefinitions, getPromptDefinitions, executeTool, toolExists, getPromptMessage } from "./tools/index.js";

// MCP SDK 타입 정의
interface MCPRequest {
    params?: any;
    _meta?: {
        progressToken?: string;
    };
}

const server = new Server({
    name: "task-manager",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        prompts: {},
        notifications: {},
        logging: {},
    },
});

let isProcessing = false;
let currentOperationName = "";
let latestOutput = "";

async function sendNotification(method: string, params: any) {
    try {
        await server.notification({ method, params });
    } catch (error) {
        Logger.error("알림 전송 실패: ", error);
    }
}

/**
 * @param progressToken The progress token provided by the client
 * @param progress The current progress value
 * @param total Optional total value
 * @param message Optional status message
 */
async function sendProgressNotification(progressToken: string, progress: number, total?: number, message?: string) {
    if (!progressToken) return; // Only send if client requested progress
    
    try {
        const params: any = {
            progressToken,
            progress
        };
        
        if (total !== undefined) params.total = total;
        if (message) params.message = message;
        
        await server.notification({
            method: PROTOCOL.NOTIFICATIONS.PROGRESS,
            params
        });
    } catch (error) {
        Logger.error("Failed to send progress notification:", error);
    }
}

function startProgressUpdates(operationName: string, progressToken?: string) {
    isProcessing = true;
    currentOperationName = operationName;
    latestOutput = ""; // Reset latest output
    
    const progressMessages = [
        `🧠 ${operationName} - Task Manager is processing your request...`,
        `📊 ${operationName} - Processing files and generating insights...`,
        `✨ ${operationName} - Creating structured response for your review...`,
        `⏱️ ${operationName} - Large analysis in progress (this is normal for big requests)...`,
        `🔍 ${operationName} - Still working... Task Manager takes time for quality results...`,
    ];
    
    let messageIndex = 0;
    let progress = 0;
    
    // Send immediate acknowledgment if progress requested
    if (progressToken) {
        sendProgressNotification(progressToken, 0, undefined, `🔍 Starting ${operationName}`);
    }
    
    // Keep client alive with periodic updates
    const progressInterval = setInterval(async () => {
        if (isProcessing && progressToken) {
            // Simply increment progress value
            progress += 1;
            
            // Include latest output if available
            const baseMessage = progressMessages[messageIndex % progressMessages.length];
            const outputPreview = latestOutput.slice(-150).trim(); // Last 150 chars
            const message = outputPreview 
                ? `${baseMessage}\n📝 Output: ...${outputPreview}`
                : baseMessage;
                
            await sendProgressNotification(progressToken, progress, undefined, message);
            messageIndex++;
        } else if (!isProcessing) {
            clearInterval(progressInterval);
        }
    }, PROTOCOL.KEEPALIVE_INTERVAL); // Every 25 seconds
    
    return { interval: progressInterval, progressToken };
}

function stopProgressUpdates(progressData: { interval: NodeJS.Timeout, progressToken?: string }, success = true) {
    const operationName = currentOperationName; // Store before clearing
    isProcessing = false;
    currentOperationName = "";
    latestOutput = "";
    
    clearInterval(progressData.interval);
    
    // Send final progress notification if client requested progress
    if (progressData.progressToken) {
        sendProgressNotification(progressData.progressToken, 100, 100, 
            success ? `✅ ${operationName} completed successfully` : `❌ ${operationName} failed`);
    }
}

// tools/list
server.setRequestHandler(ListToolsRequestSchema, async (request: MCPRequest) => {
    return { tools: getToolDefinitions() };
});

// prompts/list
server.setRequestHandler(ListPromptsRequestSchema, async (request: MCPRequest) => {
    return { prompts: getPromptDefinitions() };
});

// prompts/get
server.setRequestHandler(GetPromptRequestSchema, async (request: MCPRequest) => {
    const name = request.params?.name;
    const promptMessage = getPromptMessage(name);
    
    if (!promptMessage) {
        throw new Error(`프롬프트를 찾을 수 없습니다: ${name}`);
    }
    
    return {
        messages: [
            {
                role: "user",
                content: [{ type: "text", text: promptMessage }],
            },
        ],
        description: promptMessage,
    };
});

// tools/call
server.setRequestHandler(CallToolRequestSchema, async (request: MCPRequest) => {
    const toolName = request.params.name;
    
    if (toolExists(toolName)) {
        // Check if client requested progress updates
        const progressToken = request.params._meta?.progressToken;
        
        // Start progress updates if client requested them
        const progressData = startProgressUpdates(toolName, progressToken?.toString());
        
        try {
            // Get prompt and other parameters from arguments with proper typing
            const args = request.params.arguments || {};
            Logger.info(`도구 호출: ${toolName}`, request.params.arguments);
            
            // Execute the tool using the unified registry with progress callback
            const result = await executeTool(toolName, args, (newOutput) => {
                latestOutput = newOutput;
            });
            
            // Stop progress updates
            stopProgressUpdates(progressData, true);
            
            return {
                content: [
                    {
                        type: "text",
                        text: result,
                    },
                ],
            };
        } catch (error) {
            // Stop progress updates
            stopProgressUpdates(progressData, false);
            Logger.error(`도구 실행 실패: ${toolName}`, error);
            
            return {
                content: [
                    {
                        type: "text",
                        text: `오류: ${error instanceof Error ? error.message : String(error)}`,
                    },
                ],
                isError: true,
            };
        }
    } else {
        throw new Error(`도구를 찾을 수 없습니다: ${toolName}`);
    }
});

// 서버 시작
async function main() {
    try {
        Logger.info("Task Manager MCP 서버 시작 중...");
        const transport = new StdioServerTransport();
        await server.connect(transport);
        Logger.info("Task Manager MCP 서버가 성공적으로 시작되었습니다.");
    } catch (error) {
        Logger.error("서버 시작 실패", error);
        process.exit(1);
    }
}

// 프로세스 종료 처리
process.on('SIGINT', () => {
    Logger.info("서버 종료 신호 받음");
    process.exit(0);
});

process.on('SIGTERM', () => {
    Logger.info("서버 종료 신호 받음");
    process.exit(0);
});

// 메인 함수 실행
main().catch((error) => {
    Logger.error("예상치 못한 오류", error);
    process.exit(1);
});