#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { homedir } from 'os';

const commandsDir = path.join(homedir(), '.claude', 'commands');

async function removeCommands() {
  try {
    const commands = ['task-new.md', 'task-plan.md', 'task-start.md', 'task-resume.md'];
    
    for (const command of commands) {
      const filePath = path.join(commandsDir, command);
      try {
        await fs.unlink(filePath);
        console.log(`✅ ${command} 삭제 완료`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`⚠️  ${command} 파일이 이미 존재하지 않습니다.`);
        } else {
          console.error(`❌ ${command} 삭제 실패:`, error.message);
        }
      }
    }

    // commands 폴더가 비어있으면 폴더도 삭제
    try {
      const files = await fs.readdir(commandsDir);
      if (files.length === 0) {
        await fs.rmdir(commandsDir);
        console.log('✅ ~/.claude/commands 폴더 삭제 완료');
      }
    } catch (error) {
      console.log('⚠️  commands 폴더 삭제 실패 (다른 파일이 있을 수 있습니다)');
    }

    console.log('✅ MCP 명령어 파일들이 성공적으로 제거되었습니다.');

  } catch (error) {
    console.error('❌ 명령어 파일 제거 실패:', error);
    process.exit(1);
  }
}

removeCommands(); 