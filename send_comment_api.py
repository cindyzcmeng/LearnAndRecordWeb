# send_comment_api.py
from flask import Flask, request, jsonify
import os
import requests
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

WEBHOOK_URL = os.getenv("FEISHU_WEBHOOK")

@app.route('/send-comment', methods=['POST'])
def send_comment():
    data = request.get_json()
    name = data.get("name", "匿名")
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "留言不能为空"}), 400

    content = f"留言：\n👤 姓名: {name}\n💬 内容: {message}"
    payload = {
        "msg_type": "text",
        "content": {"text": content}
    }

    try:
        r = requests.post(WEBHOOK_URL, json=payload)
        r.raise_for_status()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": f"发送失败: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5000)
