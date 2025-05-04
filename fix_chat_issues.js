// 这个文件包含了修复chat.js中超时处理和代码块断开问题的解决方案
// 请将以下代码片段应用到对应的位置

// 1. 超时处理修复 - 替换原有的超时处理代码
// 在WebSocket初始化后，替换原有的timeout设置代码

// 设置超时变量和标志
let timeout;
let hasReceivedResponse = false;

// 设置超时（避免无限等待）
timeout = setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN && !hasReceivedResponse) {
    ws.close();
    sendStreamData({ error: '请求超时' });
    res.end();
  }
}, 30000);


// 2. 在ws.on('message')处理函数开始处添加以下代码
// 收到消息，标记已收到响应
hasReceivedResponse = true;


// 3. 修复代码块断开问题 - 替换formatCodeBlocks函数
function formatCodeBlocks(content) {
  // 检测可能的代码块并适当格式化
  const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/g;
  
  // 替换所有匹配到的代码块，确保正确的格式
  content = content.replace(codeBlockRegex, (match, language, code) => {
    return `\n\`\`\`${language || ''}\n${code.trim()}\n\`\`\`\n`;
  });
  
  // 检查是否有未闭合的代码块
  const openCodeBlocks = (content.match(/```(\w+)?/g) || []).length;
  const closeCodeBlocks = (content.match(/```\s*$/gm) || []).length;
  
  // 如果有未闭合的代码块，添加闭合标记
  if (openCodeBlocks > closeCodeBlocks) {
    content += '\n```';
  }
  
  // 检测未格式化的可能代码块（缩进的多行内容）
  const lines = content.split('\n');
  let inIndentedBlock = false;
  let indentLevel = 0;
  let indentedBlock = [];
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    
    // 如果是空行，保留它
    if (line.trim() === '') {
      if (!inIndentedBlock) {
        result.push(line);
      } else {
        indentedBlock.push(line);
      }
      continue;
    }
    
    // 检测缩进级别
    const currentIndent = line.search(/\S|$/);
    const nextIndent = nextLine.trim() ? nextLine.search(/\S|$/) : 0;
    
    // 检测可能的代码块开始
    if (!inIndentedBlock && 
        currentIndent >= 4 && 
        !line.trim().startsWith('- ') && 
        !line.trim().startsWith('* ') && 
        !line.trim().startsWith('> ') &&
        !line.includes('```')) {
      inIndentedBlock = true;
      indentLevel = currentIndent;
      indentedBlock = [line.substring(indentLevel)];
      continue;
    }
    
    // 检测代码块结束
    if (inIndentedBlock) {
      if (currentIndent < indentLevel || line.trim().startsWith('```') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        inIndentedBlock = false;
        
        // 如果代码块足够长，格式化为代码块
        if (indentedBlock.length >= 2 && indentedBlock.some(l => l.trim().length > 0)) {
          result.push('```');
          result.push(...indentedBlock);
          result.push('```');
        } else {
          // 太短的缩进，可能不是代码块
          result.push(...indentedBlock.map(l => ' '.repeat(indentLevel) + l));
        }
        
        result.push(line);
      } else {
        // 继续添加到代码块
        indentedBlock.push(line.substring(indentLevel));
      }
    } else {
      result.push(line);
    }
  }
  
  // 如果文件结束时还有未处理的代码块
  if (inIndentedBlock) {
    if (indentedBlock.length >= 2 && indentedBlock.some(l => l.trim().length > 0)) {
      result.push('```');
      result.push(...indentedBlock);
      result.push('```');
    } else {
      result.push(...indentedBlock.map(l => ' '.repeat(indentLevel) + l));
    }
  }
  
  // 最终检查，确保所有代码块都已闭合
  let finalContent = result.join('\n');
  const finalOpenBlocks = (finalContent.match(/```(\w+)?/g) || []).length;
  const finalCloseBlocks = (finalContent.match(/```\s*$/gm) || []).length;
  
  if (finalOpenBlocks > finalCloseBlocks) {
    finalContent += '\n```';
  }
  
  return finalContent;
}