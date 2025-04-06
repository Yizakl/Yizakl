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
        // 尝试检测并移除JSON数据
        content = content.replace(/\[\s*\{\s*".*?"\s*:\s*.*?\}\s*\]/g, '');
        content = content.replace(/\[\s*\{\s*"index".*?\}\s*\]/g, '');
        
        // 针对URL列表的特殊处理
        content = content.replace(/\[\s*\{"index".*?"url".*?"title".*?\}\s*\]\s*\[\s*\{"index".*?"url".*?"title".*?\}\s*\]/g, '');
        
        // 去除可能的URL列表
        content = content.replace(/https?:\/\/\S+/g, '');
        
        // 检测并移除重复的段落和句子
        let paragraphs = content.split('\n\n');
        let cleanedParagraphs = [];
        let seenParagraphs = new Set();
        
        for (const paragraph of paragraphs) {
          const trimmed = paragraph.trim();
          if (!trimmed) continue;
          
          // 检查是否是重复段落
          if (!seenParagraphs.has(trimmed)) {
            seenParagraphs.add(trimmed);
            cleanedParagraphs.push(trimmed);
          }
        }
        
        // 合并清理后的段落
        content = cleanedParagraphs.join('\n\n');
        
        // 再次检查句子级别的重复
        let sentences = content.split(/(?<=\.)\s+/);
        let uniqueSentences = [];
        let seenSentences = new Set();
        
        for (const sentence of sentences) {
          const trimmed = sentence.trim();
          if (!trimmed) continue;
          
          // 如果句子中包含数字编号（如 "1."），检查是否已有类似内容
          const match = trimmed.match(/^\d+\.\s*(.*)/);
          if (match) {
            const sentenceContent = match[1];
            let isDuplicate = false;
            
            // 检查是否与其他编号内容重复
            for (const seen of seenSentences) {
              if (seen.includes(sentenceContent) || sentenceContent.includes(seen)) {
                isDuplicate = true;
                break;
              }
            }
            
            if (!isDuplicate) {
              seenSentences.add(sentenceContent);
              uniqueSentences.push(trimmed);
            }
          } else if (!seenSentences.has(trimmed)) {
            // 普通句子检查
            seenSentences.add(trimmed);
            uniqueSentences.push(trimmed);
          }
        }
        
        // 重新组合内容
        content = uniqueSentences.join(' ');
        
        // 修复可能的格式问题
        content = content.replace(/\.\s+\./g, '.');
        content = content.replace(/\s+/g, ' ');
        content = content.trim();
        
        // 如果清理过度导致内容为空，返回原始内容
        if (!content) {
          return originalContent;
        }
        
        return content;
      } catch (error) {
        console.error('清理内容时出错:', error);
        return originalContent;
      }
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