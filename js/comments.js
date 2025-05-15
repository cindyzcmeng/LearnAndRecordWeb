// 评论相关的功能
document.addEventListener('DOMContentLoaded', function() {
  // 初始化评论功能
  initCommentSystem();
});

function initCommentSystem() {
  // 添加点击事件到评论按钮
  const commentBtn = document.getElementById('comment-btn');
  if (commentBtn) {
    commentBtn.addEventListener('click', showCommentModal);
  }

  // 添加表单提交事件到评论表单
  const commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', submitComment);
  }

  // 添加表单提交事件到底部评论表单
  const footerCommentForm = document.getElementById('footerCommentForm');
  if (footerCommentForm) {
    footerCommentForm.addEventListener('submit', submitComment);
  }
}

// 显示评论模态框
function showCommentModal() {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  
  // 设置模态框内容
  modalBody.innerHTML = `
    <h3>留下你的评论</h3>
    <form id="modalCommentForm" class="comment-form">
      <div class="form-group">
        <input type="text" name="name" placeholder="你的名字">
      </div>
      <div class="form-group">
        <textarea name="message" placeholder="留言内容"></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="primary-btn">提交</button>
      </div>
    </form>
    <p id="modalResultMsg"></p>
  `;
  
  // 显示模态框
  modal.classList.remove('hidden');
  
  // 为模态框内的表单添加提交事件
  const modalCommentForm = document.getElementById('modalCommentForm');
  if (modalCommentForm) {
    modalCommentForm.addEventListener('submit', function(e) {
      submitComment(e, 'modalResultMsg');
    });
  }
}

// 提交评论
function submitComment(e, resultMsgId = 'resultMsg') {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const message = form.message.value.trim();
  const resultMsg = document.getElementById(resultMsgId);

  if (!message) {
    resultMsg.textContent = "留言内容不能为空";
    return;
  }

  // 格式化消息内容
  const text = `📝 新留言\n👤 姓名: ${name || '匿名'}\n💬 内容: ${message}`;

  // 替换为你自己的飞书 Webhook 地址
  const webhook = "https://open.feishu.cn/open-apis/bot/v2/hook/d4bf447c-ca2a-4ecf-912b-a1beaff430ad";

  fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      msg_type: "text",
      content: { text }
    })
  }).then(response => {
    if (response.ok) {
      resultMsg.textContent = "留言已发送！谢谢你的反馈。";
      form.reset();
    } else {
      resultMsg.textContent = "发送失败，请稍后再试。";
    }
  });
} 