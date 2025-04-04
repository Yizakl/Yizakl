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
          text: [
            {
              role: "system",
              content: systemPrompt || ""
            },
            {
              role: "user",
              content: message
            }
          ]
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
        
        const choices = parsedData.payload.choices;
        const status = choices.status;
        
        // 如果有内容，流式传输出来
        if (choices.text && choices.text.length > 0) {
          const content = choices.text[0].content;
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