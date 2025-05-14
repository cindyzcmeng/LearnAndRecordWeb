// Vercel API路由 - 语音识别
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { google } from '@google-cloud/speech';

// 禁用默认的body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// 处理文件上传的函数
const parseForm = async (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    // 解析multipart/form-data请求
    const { files } = await parseForm(req);
    
    if (!files.audio) {
      return res.status(400).json({ error: '未找到音频文件' });
    }

    const audioFile = files.audio;
    
    // 读取音频文件内容
    const audioBuffer = await fs.readFile(audioFile.filepath);
    
    // 初始化Google Speech客户端
    let speechClient;
    
    // 判断是否在Vercel环境（使用环境变量）或本地开发环境（使用密钥文件）
    if (process.env.GOOGLE_CREDENTIALS) {
      // 使用环境变量中的凭据
      const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
      speechClient = new google.speech.SpeechClient({ credentials });
    } else {
      // 本地开发环境，使用密钥文件
      try {
        speechClient = new google.speech.SpeechClient({
          keyFilename: './google-speech-key.json',
        });
      } catch (error) {
        console.error('无法初始化Google Speech客户端', error);
        return res.status(500).json({ error: '语音识别服务配置错误' });
      }
    }

    // 配置语音识别请求
    const request = {
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'zh',
        alternativeLanguageCodes: ['en-US'],
        enableAutomaticPunctuation: true,
      },
    };

    // 执行语音识别
    const [response] = await speechClient.recognize(request);
    
    // 从响应中提取文本
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    // 返回识别结果
    return res.status(200).json({
      status: 'success',
      text: transcription || '未能识别语音内容',
    });
  } catch (error) {
    console.error('语音识别错误:', error);
    return res.status(500).json({
      status: 'error',
      error: `语音识别失败: ${error.message}`,
    });
  }
} 