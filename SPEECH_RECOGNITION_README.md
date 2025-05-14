# 语音识别功能使用指南

本项目集成了 Google Cloud Speech-to-Text API 实现语音识别功能，支持中英文混合识别。

## 功能说明

1. 在"语音日记"页面和"对话练习"页面中，用户可以通过点击麦克风按钮进行录音
2. 录音完成后，系统会自动将音频发送到后端进行语音识别
3. 识别结果将显示在输入框中，用户可以进行编辑和调整

## 本地开发设置

### 1. 获取 Google Cloud Speech-to-Text API 密钥

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Speech-to-Text API
4. 创建服务账号并下载密钥文件 (JSON 格式)
5. 将密钥文件重命名为 `google-speech-key.json` 并放在项目根目录

### 2. 安装依赖

```bash
npm install
```

### 3. 本地运行

```bash
npm run dev
```

## Vercel 部署设置

1. 将 Google Cloud 密钥添加到 Vercel 环境变量：

```bash
# 将JSON文件内容转换为字符串并添加到Vercel环境变量
cat google-speech-key.json | vercel env add GOOGLE_CREDENTIALS
```

2. 也可以在 Vercel 仪表板中手动添加环境变量：
   - 进入项目设置 > 环境变量
   - 添加名为 `GOOGLE_CREDENTIALS` 的环境变量
   - 值应为 JSON 密钥文件的完整内容

3. 部署项目：

```bash
vercel deploy --prod
```

## 使用注意事项

1. 录音默认使用 WEBM 格式，确保浏览器支持此格式
2. 识别结果的准确性受多种因素影响，如背景噪音、发音清晰度等
3. 本地开发时确保密钥文件存在，部署时确保环境变量已正确设置
4. 中英混合识别时，应使用自然的语音过渡
5. 识别结果可能需要手动调整，特别是专业术语或不常见的词汇

## 故障排除

1. 录音失败: 检查浏览器麦克风权限和支持情况
2. 识别失败: 查看浏览器控制台错误信息，确认API密钥是否正确设置
3. 上传超时: 检查网络连接和音频文件大小
4. 识别结果不准确: 尝试在安静环境下清晰发音，或尝试较短的语句 