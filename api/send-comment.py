from http.server import BaseHTTPRequestHandler
import json
import requests

# 飞书webhook配置
FEISHU_WEBHOOK_URL = "https://open.feishu.cn/open-apis/bot/v2/hook/d4bf447c-ca2a-4ecf-912b-a1beaff430ad"

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        name = data.get('name', '匿名')
        message = data.get('message', '')
        
        if not message:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": "留言内容不能为空"}).encode())
            return
        
        # 格式化消息内容
        text = f"📝 新留言\n👤 姓名: {name or '匿名'}\n💬 内容: {message}"
        
        # 构建发送到飞书的请求体
        payload = {
            "msg_type": "text",
            "content": {"text": text}
        }
        
        # 发送请求到飞书webhook
        response = requests.post(FEISHU_WEBHOOK_URL, json=payload)
        
        # 返回响应
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if response.status_code == 200:
            self.wfile.write(json.dumps({"success": True}).encode())
        else:
            self.wfile.write(json.dumps({
                "success": False, 
                "error": f"飞书API返回错误: {response.status_code}"
            }).encode())