<!-- FILE: client/src/views/About.vue -->
<template>
  <div class="about-page">
    <div class="container">
      <!-- Hero Section -->
      <div class="about-hero">
        <h1>About AgriDrone</h1>
        <p class="hero-subtitle">
          Empowering Filipino farmers with AI-powered citrus disease detection technology
        </p>
      </div>

      <!-- Mission Section -->
      <section class="mission-section">
        <div class="section-content">
          <h2>🌱 Our Mission</h2>
          <p>
            AgriDrone is dedicated to protecting Filipino dalandan crops through accessible, 
            accurate, and instant disease detection. We combine cutting-edge artificial 
            intelligence with practical agricultural knowledge to help farmers identify and 
            treat crop diseases before they cause significant damage.
          </p>
        </div>
      </section>

      <!-- Technology Section -->
      <section class="technology-section">
        <h2>🔬 The Technology</h2>
        <div class="tech-grid">
          <div class="tech-card">
            <div class="tech-icon">🧠</div>
            <h3>Machine Learning Model</h3>
            <p>
              Our AI model is trained using Google's Teachable Machine platform with 
              hundreds of dalandan leaf images, achieving high accuracy in detecting 
              4 key conditions: Healthy, Black Spot, Canker, and Greening disease.
            </p>
          </div>
          
          <div class="tech-card">
            <div class="tech-icon">📱</div>
            <h3>Mobile-First Design</h3>
            <p>
              Built specifically for field use on smartphones and tablets. Take photos 
              directly in your dalandan grove and get instant results without needing 
              internet connectivity for the AI analysis.
            </p>
          </div>
          
          <div class="tech-card">
            <div class="tech-icon">💬</div>
            <h3>AI Assistant</h3>
            <p>
              Our LLM-powered chatbot provides personalized agricultural advice, 
              answers farming questions, and generates contextual recommendations 
              based on your specific situation and local conditions.
            </p>
          </div>
          
          <div class="tech-card">
            <div class="tech-icon">🔒</div>
            <h3>Privacy & Security</h3>
            <p>
              All image analysis happens directly on your device. Your photos and 
              data are never uploaded without your permission, ensuring complete 
              privacy and working even offline.
            </p>
          </div>
        </div>
      </section>

      <!-- Disease Information -->
      <section class="diseases-section">
        <h2>🦠 Diseases We Detect</h2>
        <div class="diseases-info">
          <div class="disease-info">
            <h3>✅ Healthy Citrus</h3>
            <p>
              Normal, healthy dalandan leaves with no signs of disease or pest damage. 
              The system helps confirm when your crops are in good condition.
            </p>
          </div>
          
          <div class="disease-info">
            <h3>🔵 Black Spot</h3>
            <p>
              Fungal disease causing dark lesions on leaves and fruit. While manageable 
              with proper treatment, early detection prevents quality loss and yield reduction.
            </p>
          </div>
          
          <div class="disease-info">
            <h3>🟠 Citrus Canker</h3>
            <p>
              Serious bacterial disease creating raised, corky lesions. Requires immediate 
              attention and may need quarantine measures to prevent spread to other trees.
            </p>
          </div>
          
          <div class="disease-info">
            <h3>🟡 Citrus Greening (HLB)</h3>
            <p>
              The most devastating citrus disease, causing yellow mottling and bitter fruit. 
              Early detection is crucial as this disease can kill trees and has no cure.
            </p>
          </div>
        </div>
      </section>

      <!-- Accuracy & Limitations -->
      <section class="accuracy-section">
        <h2>📊 Accuracy & Limitations</h2>
        <div class="accuracy-content">
          <div class="accuracy-stats">
            <div class="stat">
              <div class="stat-number">87%</div>
              <div class="stat-label">Overall Accuracy</div>
            </div>
            <div class="stat">
              <div class="stat-number">224x224</div>
              <div class="stat-label">Input Resolution</div>
            </div>
            <div class="stat">
              <div class="stat-number">4</div>
              <div class="stat-label">Disease Classes</div>
            </div>
            <div class="stat">
              <div class="stat-number">&lt; 1s</div>
              <div class="stat-label">Analysis Time</div>
            </div>
          </div>
          
          <div class="limitations">
            <h3>⚠️ Important Limitations</h3>
            <ul>
              <li>This tool provides guidance only - not a replacement for professional diagnosis</li>
              <li>Accuracy depends on image quality, lighting, and leaf condition</li>
              <li>Some diseases may appear similar in early stages</li>
              <li>Always consult agricultural experts for treatment confirmation</li>
              <li>Environmental factors can affect disease appearance</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Best Practices -->
      <section class="practices-section">
        <h2>📸 Best Practices for Photos</h2>
        <div class="practices-grid">
          <div class="practice-tip">
            <div class="tip-icon">☀️</div>
            <h3>Good Lighting</h3>
            <p>Take photos in natural daylight, avoiding harsh shadows or direct flash.</p>
          </div>
          
          <div class="practice-tip">
            <div class="tip-icon">🎯</div>
            <h3>Focus on Leaves</h3>
            <p>Ensure leaves fill most of the frame with clear details visible.</p>
          </div>
          
          <div class="practice-tip">
            <div class="tip-icon">📐</div>
            <h3>Close Distance</h3>
            <p>Capture leaves from close range to show symptoms clearly.</p>
          </div>
          
          <div class="practice-tip">
            <div class="tip-icon">🎨</div>
            <h3>Clean Background</h3>
            <p>Use solid backgrounds when possible to help the AI focus on the leaf.</p>
          </div>
        </div>
      </section>

      <!-- Disclaimer -->
      <section class="disclaimer-section">
        <div class="disclaimer-box">
          <h2>⚠️ Important Disclaimer</h2>
          <p>
            AgriDrone is an educational and diagnostic support tool designed to assist farmers 
            in crop management. It is not a substitute for professional agricultural advice, 
            diagnosis, or treatment. Always consult with qualified agricultural extension 
            services, plant pathologists, or agricultural experts for:
          </p>
          <ul>
            <li>Professional disease confirmation and diagnosis</li>
            <li>Treatment recommendations and application methods</li>
            <li>Pesticide selection and safety procedures</li>
            <li>Integrated pest management strategies</li>
            <li>Regulatory compliance and quarantine requirements</li>
          </ul>
          <p>
            The developers of AgriDrone assume no responsibility for crop losses, treatment 
            failures, or adverse outcomes resulting from the use of this application. 
            Use this tool as one part of a comprehensive crop management strategy.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
};
</script>

<style scoped>
.about-page {
  padding: var(--spacing-2xl) 0;
}

.about-hero {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.about-hero h1 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  background: linear-gradient(135deg, var(--green-600), var(--orange-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

section {
  margin-bottom: var(--spacing-2xl);
}

section h2 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-bottom: var(--spacing-xl);
  color: var(--text);
  text-align: center;
}

.section-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.section-content p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: 1.7;
}

/* Technology Grid */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}

.tech-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  transition: var(--transition);
}

.tech-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.tech-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
}

.tech-card h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text);
}

.tech-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Diseases Section */
.diseases-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.disease-info {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.disease-info h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text);
}

.disease-info p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  margin: 0;
}

/* Accuracy Section */
.accuracy-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: start;
}

.accuracy-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.stat {
  text-align: center;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.limitations {
  background: var(--warning-bg);
  border: 1px solid #fbbf24;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.limitations h3 {
  color: #92400e;
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-lg);
}

.limitations ul {
  color: #92400e;
  line-height: 1.6;
  margin: 0;
  padding-left: var(--spacing-lg);
}

.limitations li {
  margin-bottom: var(--spacing-sm);
}

/* Practices Grid */
.practices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.practice-tip {
  text-align: center;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.tip-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
}

.practice-tip h3 {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--text);
}

.practice-tip p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  margin: 0;
}

/* Disclaimer */
.disclaimer-section {
  border-top: 2px solid var(--border);
  padding-top: var(--spacing-2xl);
}

.disclaimer-box {
  background: var(--error-bg);
  border: 2px solid var(--error);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  max-width: 800px;
  margin: 0 auto;
}

.disclaimer-box h2 {
  color: #991b1b;
  margin-bottom: var(--spacing-lg);
  text-align: left;
}

.disclaimer-box p,
.disclaimer-box ul {
  color: #991b1b;
  line-height: 1.6;
}

.disclaimer-box ul {
  margin: var(--spacing-lg) 0;
  padding-left: var(--spacing-lg);
}

.disclaimer-box li {
  margin-bottom: var(--spacing-sm);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .tech-grid {
    grid-template-columns: 1fr;
  }

  .accuracy-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .accuracy-stats {
    grid-template-columns: 1fr 1fr;
  }

  .practices-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .diseases-info {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .about-hero h1 {
    font-size: var(--font-size-2xl);
  }

  .hero-subtitle {
    font-size: var(--font-size-lg);
  }

  section h2 {
    font-size: var(--font-size-xl);
  }

  .accuracy-stats {
    grid-template-columns: 1fr;
  }

  .practices-grid {
    grid-template-columns: 1fr;
  }

  .disclaimer-box {
    padding: var(--spacing-lg);
  }
}
</style>