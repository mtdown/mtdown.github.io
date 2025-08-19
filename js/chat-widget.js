document.addEventListener('DOMContentLoaded', () => {

    const toggleButton = document.getElementById('chat-toggle-button');
    const widgetContainer = document.getElementById('chat-widget-container');
    const closeButton = document.getElementById('chat-close-button');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');

    // 为每个会话生成一个唯一的ID
    const memoryId = new Date().getTime();

    // 切换聊天窗口的显示和隐藏
    toggleButton.addEventListener('click', () => {
        widgetContainer.classList.toggle('hidden');
    });

    closeButton.addEventListener('click', () => {
        widgetContainer.classList.add('hidden');
    });

    // 处理表单提交
    chatForm.addEventListener('submit', (event) => {
        event.preventDefault(); // 阻止表单默认的页面刷新行为

        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // 1. 在界面上显示用户发送的消息
        appendMessage(userMessage, 'user-message');
        chatInput.value = '';

        // 2. 创建一个AI消息的容器，准备接收流式响应
        const aiMessageElement = createMessageElement('ai-message');

        // 3. 构建API的URL
        // !!! 重要：请确保这里的域名和端口与您后端服务一致
        // 如果您的博客和后端不在同一个域名下，需要写完整URL，并处理CORS跨域问题
        const apiUrl = `/chat?memoryId=${memoryId}&message=${encodeURIComponent(userMessage)}`;

        // 4. 使用 EventSource 来接收流式响应 (Server-Sent Events)
        const eventSource = new EventSource(apiUrl);

        // 5. 监听 message 事件，实时更新AI消息内容
        eventSource.onmessage = (event) => {
            // Ollama的流式输出有时会返回特殊标记，我们需要过滤掉
            if (event.data === '[DONE]') {
                eventSource.close();
                return;
            }
            // 将收到的文本追加到AI消息元素中
            aiMessageElement.textContent += event.data;
            messagesContainer.scrollTop = messagesContainer.scrollHeight; // 自动滚动到底部
        };

        // 6. 监听 error 事件，处理连接中断或结束
        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
        };
    });

    // 创建并添加消息元素的辅助函数
    function appendMessage(text, className) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${className}`;
        messageElement.textContent = text;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 创建AI消息容器的辅助函数
    function createMessageElement(className) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${className}`;
        messageElement.textContent = ''; // 初始为空
        messagesContainer.appendChild(messageElement);
        return messageElement;
    }
});