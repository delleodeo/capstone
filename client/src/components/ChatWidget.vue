<!-- FILE: client/src/components/ChatWidget.vue -->
<template>
  <div class="chat-widget">
    <!-- Messages Container -->
    <div class="messages-container" ref="messagesContainer">
      <div class="messages-list">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="message message-assistant welcome">
          <div class="message-content">
            <p>🍊 <strong>Kumusta!</strong> I'm DalandanCare Assistant, your safety-focused guide for dalandan/citrus leaf health.</p>
            <p>I can help you with:</p>
            <ul>
              <li>Identifying possible leaf diseases (Black Spot, Canker, Greening)</li>
              <li>Safe treatment options and prevention tips</li>
              <li>Integrated Pest Management (IPM) approaches</li>
              <li>When to consult a professional</li>
            </ul>
            <p><strong>Note:</strong> I use "likely" or "possible" — never absolute diagnosis. For exact chemical dosages, please consult your local DA office.</p>
            <p>How can I help you today? (English or Tagalog okay!)</p>
          </div>
        </div>

        <!-- Chat Messages -->
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message"
          :class="[`message-${message.role}`, { 'message-error': message.error }]"
        >
          <div class="message-content">
            <div v-if="message.role === 'user'" class="message-text">
              {{ message.content }}
            </div>
            <div v-else class="message-text" v-html="formatMessage(message.content)"></div>
          </div>
          <div class="message-timestamp">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="message message-assistant typing">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Container -->
    <div class="input-container">
      <form @submit.prevent="sendMessage" class="message-form">
        <div class="input-wrapper">
          <textarea
            v-model="currentMessage"
            @keydown="handleKeyDown"
            placeholder="Ask about citrus diseases, treatments, or farming practices..."
            class="message-input"
            :disabled="isSending"
            rows="1"
            ref="messageInput"
          ></textarea>
          
          <button 
            type="submit" 
            class="send-button"
            :disabled="!currentMessage.trim() || isSending"
            :title="isSending ? 'Sending...' : 'Send message'"
          >
            <span v-if="!isSending">📤</span>
            <div v-else class="spinner small"></div>
          </button>
        </div>
        
        <div class="input-footer">
          <div class="character-count" :class="{ warning: currentMessage.length > 900 }">
            {{ currentMessage.length }}/1000
          </div>
          
          <button 
            v-if="messages.length > 0"
            @click="clearChat" 
            type="button" 
            class="btn btn-outline btn-sm"
          >
            Clear Chat
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { sendChatMessage, streamChatMessage, generateSessionId } from '../utils/api.js';

export default {
  name: 'ChatWidget',

  data() {
    return {
      messages: [],
      currentMessage: '',
      isSending: false,
      isTyping: false,
      sessionId: null,
      messageIdCounter: 0
    };
  },

  mounted() {
    // Generate session ID
    this.sessionId = generateSessionId();
    
    // Auto-resize textarea
    this.setupTextareaResize();
  },

  methods: {
    async sendMessage(messageText = null) {
      const text = messageText || this.currentMessage.trim();
      if (!text || this.isSending) return;

      // Add user message
      const userMessage = this.addMessage('user', text);
      
      // Clear input
      this.currentMessage = '';
      this.resetTextareaHeight();

      this.isSending = true;
      this.isTyping = true;

      try {
        // Send to API
        const response = await sendChatMessage(text, this.sessionId);
        
        // Add assistant response
        this.addMessage('assistant', response.data.message);

      } catch (error) {
        console.error('Chat error:', error);
        
        // Add error message
        this.addMessage('assistant', 
          'Sorry, I encountered an error. Please try again in a moment.', 
          true
        );

        if (window.showToast) {
          window.showToast('Failed to send message: ' + error.message, 'error');
        }
      } finally {
        this.isSending = false;
        this.isTyping = false;
        this.scrollToBottom();
      }
    },

    addMessage(role, content, isError = false) {
      const message = {
        id: ++this.messageIdCounter,
        role,
        content,
        timestamp: new Date(),
        error: isError
      };

      this.messages.push(message);
      
      // Auto-scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      return message;
    },

    formatMessage(content) {
      // Basic markdown-like formatting
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    },

    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    handleKeyDown(event) {
      // Send on Enter, but allow Shift+Enter for new lines
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
      }
    },

    clearChat() {
      this.messages = [];
      this.sessionId = generateSessionId();
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },

    setupTextareaResize() {
      const textarea = this.$refs.messageInput;
      if (!textarea) return;

      const adjustHeight = () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      };

      // Watch for input changes
      this.$watch('currentMessage', () => {
        this.$nextTick(adjustHeight);
      });

      // Initial adjustment
      this.$nextTick(adjustHeight);
    },

    resetTextareaHeight() {
      const textarea = this.$refs.messageInput;
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }
  }
};
</script>

<style scoped>
.chat-widget {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  height: 600px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  align-self: flex-end;
  align-items: flex-end;
}

.message-assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.message-content {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  word-wrap: break-word;
}

.message-user .message-content {
  background: var(--primary);
  color: var(--text-light);
  border-color: var(--primary);
}

.message-assistant.welcome .message-content {
  background: linear-gradient(135deg, var(--green-50), var(--orange-50));
  border-color: var(--primary);
  border-width: 2px;
}

.message-error .message-content {
  background: var(--error-bg);
  border-color: var(--error);
  color: #991b1b;
}

.message-text {
  line-height: 1.6;
  font-size: var(--font-size-sm);
}

.message-text ul {
  margin: var(--spacing-sm) 0;
  padding-left: var(--spacing-lg);
}

.message-text li {
  margin-bottom: var(--spacing-xs);
}

.message-timestamp {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
  text-align: inherit;
}

/* Typing Indicator */
.typing .message-content {
  background: var(--bg-tertiary);
  border-color: var(--border-light);
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: var(--spacing-sm) 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: typingDots 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typingDots {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Input Container */
.input-container {
  border-top: 1px solid var(--border);
  background: var(--card);
  padding: var(--spacing-lg);
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.input-wrapper {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: var(--font-size-sm);
  line-height: 1.4;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  transition: var(--transition);
  background: var(--bg);
}

.message-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-button {
  background: var(--primary);
  color: var(--text-light);
  border: none;
  border-radius: var(--radius);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  font-size: var(--font-size-lg);
  min-width: 48px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.send-button:hover:not(:disabled) {
  background: var(--primary-hover);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
}

.character-count {
  color: var(--text-muted);
}

.character-count.warning {
  color: var(--warning);
  font-weight: 600;
}

.spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .chat-widget {
    height: 500px;
  }

  .message {
    max-width: 90%;
  }

  .messages-container {
    padding: var(--spacing-md);
  }

  .input-container {
    padding: var(--spacing-md);
  }

  .input-footer {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }
}

/* Accessibility */
.message-input:focus,
.send-button:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Scrollbar Styling */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>