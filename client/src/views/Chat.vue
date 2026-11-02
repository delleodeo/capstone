<!-- FILE: client/src/views/Chat.vue -->
<template>
  <div class="chat-page">
    <div class="container container-sm">
      <!-- Header -->
      <div class="chat-header">
        <h1>🍊 DalandanCare Assistant</h1>
        <p>Your safety-focused guide for dalandan/citrus leaf health</p>
      </div>

      <!-- Chat Interface -->
      <div class="chat-container">
        <ChatWidget ref="chatWidget" />
      </div>

      <!-- Quick Questions -->
      <div class="quick-questions">
        <h2>💡 Common Questions</h2>
        <div class="questions-grid">
          <button 
            v-for="question in quickQuestions" 
            :key="question"
            @click="askQuestion(question)"
            class="question-btn"
          >
            {{ question }}
          </button>
        </div>
      </div>

      <!-- Tips -->
      <div class="chat-tips">
        <h3>📋 Tips for better responses:</h3>
        <ul>
          <li>Describe symptoms in detail (color, size, location on leaf)</li>
          <li>Mention how long you've observed the problem</li>
          <li>Tell us your location/climate if relevant</li>
          <li>Share what treatments you've already tried</li>
          <li>Ask in Tagalog if you prefer — I understand!</li>
        </ul>
        <p class="safety-note">
          <strong>⚠️ Note:</strong> I provide general guidance only. For exact chemical dosages or serious infestations, always consult your local DA office or agriculture technician.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import ChatWidget from '../components/ChatWidget.vue';

export default {
  name: 'Chat',
  
  components: {
    ChatWidget
  },

  data() {
    return {
      quickQuestions: [
        "Ano ang mga early signs ng citrus canker?",
        "What causes black spots on dalandan leaves?",
        "How can I prevent citrus greening disease?",
        "Paano ko aalagaan ang healthy na dalandan tree?",
        "What organic treatments work for leaf diseases?",
        "When should I consult a DA technician?",
        "How do I improve my dalandan fruit quality?",
        "What are signs of nutrient deficiency in citrus?"
      ]
    };
  },

  methods: {
    askQuestion(question) {
      this.$refs.chatWidget?.sendMessage(question);
    }
  }
};
</script>

<style scoped>
.chat-page {
  padding: var(--spacing-xl) 0;
  min-height: 80vh;
}

.chat-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.chat-header h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
  color: var(--text);
}

.chat-header p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
}

.chat-container {
  margin-bottom: var(--spacing-2xl);
}

.quick-questions {
  margin-bottom: var(--spacing-2xl);
}

.quick-questions h2 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  text-align: center;
  color: var(--text);
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.question-btn {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--spacing-md);
  text-align: left;
  cursor: pointer;
  transition: var(--transition);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.question-btn:hover {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
}

.chat-tips {
  background: var(--info-bg);
  border: 1px solid #93c5fd;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  max-width: 600px;
  margin: 0 auto;
}

.chat-tips h3 {
  color: #1e40af;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-base);
}

.chat-tips ul {
  color: #1e40af;
  line-height: 1.6;
  margin: 0;
  padding-left: var(--spacing-lg);
}

.chat-tips li {
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.safety-note {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid #93c5fd;
  font-size: var(--font-size-sm);
  color: #b45309;
  background: #fef3c7;
  padding: var(--spacing-md);
  border-radius: var(--radius);
  margin-bottom: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .questions-grid {
    grid-template-columns: 1fr;
  }

  .chat-tips {
    padding: var(--spacing-lg);
  }
}
</style>