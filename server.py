#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os
import json
import uuid
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO)

app = Flask(__name__, static_folder='./')
CORS(app)  # 允许跨域请求

# 配置API密钥
DEEPSEEK_API_KEY = "sk-f489465024a24ec0b1d9378488ff16fd"
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# 添加飞书webhook配置
FEISHU_WEBHOOK_URL = "https://open.feishu.cn/open-apis/bot/v2/hook/d4bf447c-ca2a-4ecf-912b-a1beaff430ad"

# 上传文件保存目录
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 代理DeepSeek API请求，避免前端暴露API密钥
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        
        # 构建请求头
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # 转发请求到DeepSeek API
        response = requests.post(DEEPSEEK_API_URL, json=data, headers=headers)
        
        # 检查响应状态
        if response.status_code != 200:
            return jsonify({"error": f"API请求失败: {response.status_code}"}), response.status_code
        
        # 返回API响应
        return jsonify(response.json())
    
    except Exception as e:
        logging.error(f"处理API请求时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

# 处理音频上传和语音识别
@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    try:
        # 检查是否有音频文件
        if 'audio' not in request.files:
            return jsonify({"error": "未找到音频文件"}), 400
        
        audio_file = request.files['audio']
        
        # 保存音频文件
        filename = f"{uuid.uuid4()}.wav"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        audio_file.save(file_path)
        
        # 这里可以集成实际的语音识别服务
        # 例如Google Speech-to-Text、百度语音识别等
        # 为简化演示，这里模拟识别结果
        
        # 模拟识别结果
        result = {
            "status": "success",
            "text": "这是模拟的语音识别结果。在实际项目中，这里会是真实的语音识别API返回的文本内容。",
            "audio_url": f"/uploads/{filename}"
        }
        
        return jsonify(result)
    
    except Exception as e:
        logging.error(f"处理语音识别请求时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500

# 提供上传文件的访问
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# 提供静态文件访问
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('./', path)

# 代理飞书webhook请求
@app.route('/api/send-comment', methods=['POST'])
def send_comment():
    try:
        data = request.json
        name = data.get('name', '匿名')
        message = data.get('message', '')
        
        if not message:
            return jsonify({"success": False, "error": "留言内容不能为空"}), 400
        
        # 格式化消息内容
        text = f"📝 新留言\n👤 姓名: {name or '匿名'}\n💬 内容: {message}"
        
        # 构建发送到飞书的请求体
        payload = {
            "msg_type": "text",
            "content": {"text": text}
        }
        
        # 发送请求到飞书webhook
        response = requests.post(FEISHU_WEBHOOK_URL, json=payload)
        
        # 检查响应状态
        if response.status_code == 200:
            return jsonify({"success": True})
        else:
            return jsonify({
                "success": False, 
                "error": f"飞书API返回错误: {response.status_code}"
            }), response.status_code
    
    except Exception as e:
        logging.error(f"处理评论请求时出错: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # 启动服务器
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
    print(f"服务器运行在 http://localhost:{port}") 