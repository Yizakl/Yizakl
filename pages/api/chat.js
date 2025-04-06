export default async function handler(req, res) {
  // 允许POST和GET请求
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: '只允许POST和GET请求' });
  }

  try {
    // 从POST请求体或GET查询参数中获取消息和系统提示词
    const message = req.method === 'POST' 
      ? req.body.message 
      : req.query.message;
    
    const systemPrompt = req.method === 'POST'
      ? req.body.systemPrompt
      : req.query.systemPrompt || '';
    
    // 获取历史消息数组
    let historyMessages = [];
    if (req.method === 'POST') {
      historyMessages = req.body.history || [];
    } else if (req.query.history) {
      try {
        historyMessages = JSON.parse(decodeURIComponent(req.query.history)) || [];
      } catch (e) {
        console.error('解析历史消息参数错误:', e);
      }
    }
    
    if (!message) {
      return res.status(400).json({ error: '请提供消息内容' });
    }

    // 配置响应头，支持流式传输
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    });

    // 讯飞星火API配置
    const API_KEY = '0240d87e1db7dc2c91de7b874eec2dc1';
    const API_SECRET = 'YjYzMWIwZGZjYzRkMGZiZGVlOGMzODkz';
    const APP_ID = '417e2c7b';
    const GPT_URL = 'wss://spark-api.xf-yun.com/v4.0/chat';
    
    // 创建WebSocket URL
    const urlObj = new URL(GPT_URL);
    const host = urlObj.host;
    const path = urlObj.pathname;
    
    // 生成RFC1123格式的时间戳
    const now = new Date();
    const date = now.toUTCString();
    
    // 构建鉴权字符串
    const signature_origin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    
    // 使用crypto模块进行HMAC-SHA256签名
    const crypto = require('crypto');
    const signature_sha = crypto.createHmac('sha256', API_SECRET)
                              .update(signature_origin)
                              .digest('base64');
    
    const authorization_origin = `api_key="${API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature_sha}"`;
    
    // 对authorization_origin进行base64编码
    const authorization = Buffer.from(authorization_origin).toString('base64');
    
    // 构建WebSocket URL参数
    const params = new URLSearchParams({
      authorization: authorization,
      date: date,
      host: host
    });
    
    // 完整的WebSocket URL
    const wsUrl = `${GPT_URL}?${params.toString()}`;
    
    // 构建对话历史记录
    const textMessages = [{ role: "system", content: systemPrompt || "" }];
    
    // 添加历史消息
    if (historyMessages && historyMessages.length > 0) {
      historyMessages.forEach(msg => {
        textMessages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }
    
    // 添加当前用户消息
    textMessages.push({ role: "user", content: message });
    
    // 构建请求数据
    const requestData = {
      header: {
        app_id: APP_ID
      },
      parameter: {
        chat: {
          domain: "4.0Ultra",
          temperature: 0.5,
          max_tokens: 4096,
          top_k: 4,
          show_ref_label: true
        }
      },
      payload: {
        message: {
          text: textMessages
        }
      }
    };

    // 使用WebSocket API（需要在服务器端使用ws库）
    const WebSocket = require('ws');
    
    // 创建WebSocket客户端
    const ws = new WebSocket(wsUrl, {
      rejectUnauthorized: false // 等同于Python中的ssl.CERT_NONE
    });
    
    // 流式发送数据到客户端的函数
    const sendStreamData = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    
    // 设置超时（避免无限等待）
    const timeout = setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
        sendStreamData({ error: '请求超时' });
        res.end();
      }
    }, 30000);
    
    // 连接打开时发送请求
    ws.on('open', () => {
      ws.send(JSON.stringify(requestData));
    });
    
    // 接收消息
    ws.on('message', (data) => {
      try {
        const parsedData = JSON.parse(data);
        const code = parsedData.header.code;
        
        if (code !== 0) {
          console.error('星火API调用失败:', parsedData);
          ws.close();
          clearTimeout(timeout);
          sendStreamData({ 
            error: `处理请求时出错，错误码: ${code}` 
          });
          res.end();
          return;
        }
        
        // 检查各种可能的响应格式
        let content = '';
        let status = 0;
        
        // 处理第一种格式 - choices
        if (parsedData.payload && parsedData.payload.choices) {
          const choices = parsedData.payload.choices;
          status = choices.status || 0;
          
          if (choices.text && choices.text.length > 0) {
            content = choices.text[0].content || '';
          }
        } 
        // 处理第二种格式 - plugins.text
        else if (parsedData.payload && parsedData.payload.plugins && parsedData.payload.plugins.text) {
          const textArray = parsedData.payload.plugins.text;
          if (textArray && textArray.length > 0) {
            content = textArray[0].content || '';
          }
          
          // 从header中获取状态
          status = parsedData.header.status || 0;
        }
        // 未知格式
        else {
          console.error('API返回数据格式无法解析:', parsedData);
          sendStreamData({ 
            error: '服务器返回的数据格式异常' 
          });
          return;
        }
        
        // 清理内容 - 过滤JSON和重复内容
        if (content) {
          content = cleanResponseContent(content);
        }
        
        // 发送内容
        if (content) {
          sendStreamData({ 
            text: content,
            isEnd: status === 2
          });
        }
        
        // 如果响应完成，关闭连接
        if (status === 2) {
          ws.close();
          clearTimeout(timeout);
          res.end();
        }
      } catch (error) {
        console.error('解析消息错误:', error);
        sendStreamData({ error: '解析消息出错' });
      }
    });
    
    // 清理响应内容 - 去除JSON和重复内容
    function cleanResponseContent(content) {
      // 原始内容记录，用于极端情况下返回
      const originalContent = content;
      
      try {
        // 检查是否在代码块内
        const lines = content.split('\n');
        let inCodeBlock = false;
        const cleanedLines = [];
        
        for (const line of lines) {
          // 检测代码块边界
          if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            cleanedLines.push(line);
            continue;
          }
          
          // 在代码块内，保留原始内容
          if (inCodeBlock) {
            cleanedLines.push(line);
            continue;
          }
          
          // 处理非代码块内容
          let cleanedLine = line;
          
          // 移除JSON数据
          cleanedLine = cleanedLine.replace(/\[\s*\{\s*".*?"\s*:\s*.*?\}\s*\]/g, '');
          cleanedLine = cleanedLine.replace(/\[\s*\{\s*"index".*?\}\s*\]/g, '');
          
          // 移除KoaSayi相关内容
          if (cleanedLine.includes('KoaSayi')) {
            cleanedLine = cleanedLine.replace(/KoaSayi.*?哔哩哔哩视频/g, '');
            cleanedLine = cleanedLine.replace(/KoaSayi.*?二次元社区/g, '');
            cleanedLine = cleanedLine.replace(/KoaSayi.*?个人主页/g, '');
            cleanedLine = cleanedLine.replace(/KoaSayi.*?个人中心/g, '');
          }
          
          // 只有当行为空白或有内容时才添加，保留空行以维持段落结构
          if (cleanedLine.trim() || cleanedLine === '') {
            cleanedLines.push(cleanedLine);
          }
        }
        
        // 重新组合内容，保留原始换行
        content = cleanedLines.join('\n');
        
        // 检测并格式化可能的代码块
        content = formatCodeBlocks(content);
        
        // 如果清理过度导致内容为空，返回原始内容
        if (!content.trim()) {
          return originalContent;
        }
        
        return content;
      } catch (error) {
        console.error('清理内容时出错:', error);
        return originalContent;
      }
    }
    
    // 格式化代码块
    function formatCodeBlocks(content) {
      // 检测可能的代码块并适当格式化
      const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/g;
      
      // 替换所有匹配到的代码块，确保正确的格式
      content = content.replace(codeBlockRegex, (match, language, code) => {
        return `\n\`\`\`${language || ''}\n${code.trim()}\n\`\`\`\n`;
      });
      
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
      
      return result.join('\n');
    }
    
    // 错误处理
    ws.on('error', (error) => {
      console.error('WebSocket错误:', error);
      clearTimeout(timeout);
      sendStreamData({ 
        error: '与AI服务连接时出现问题，请稍后再试。' 
      });
      res.end();
    });
    
    // 连接关闭
    ws.on('close', () => {
      clearTimeout(timeout);
      sendStreamData({ 
        isEnd: true,
        text: '' 
      });
      res.end();
    });
    
  } catch (error) {
    console.error('API错误:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '服务器内部错误' }));
  }
} 