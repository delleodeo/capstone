<!-- FILE: client/src/components/ImageUploader.vue -->
<template>
  <div class="image-uploader">
    <!-- File Input (hidden) -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      @change="handleFileSelect"
      class="file-input"
      :disabled="isProcessing"
    />

    <!-- Camera Input (hidden) -->
    <input
      ref="cameraInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      capture="environment"
      @change="handleFileSelect"
      class="file-input"
      :disabled="isProcessing"
    />

    <!-- Upload Area -->
    <div 
      class="upload-area"
      :class="{ 
        'drag-over': isDragOver,
        'has-image': imagePreview,
        'disabled': isProcessing
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="openFileSelector"
    >
      <!-- Image Preview -->
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="Selected leaf image" />
        <div class="image-overlay">
          <div class="image-info">
            <p class="image-name">{{ selectedFile?.name }}</p>
            <p class="image-size">{{ formatFileSize(selectedFile?.size) }}</p>
          </div>
          <button
            @click.stop="clearImage"
            class="remove-button"
            :disabled="isProcessing"
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Upload Prompt -->
      <div v-else class="upload-prompt">
        <div class="upload-icon">
          <span v-if="!isProcessing">📷</span>
          <div v-else class="spinner"></div>
        </div>
        
        <h3>{{ isProcessing ? 'Processing...' : 'Select Leaf Image' }}</h3>
        
        <p class="upload-instructions">
          {{ isProcessing ? 
            'Please wait while we process your image...' : 
            'Drop an image here, or click to browse' 
          }}
        </p>

        <div class="upload-tips">
          <h4>📋 Tips for best results:</h4>
          <ul>
            <li>Use good lighting conditions</li>
            <li>Ensure the leaf fills most of the frame</li>
            <li>Avoid shadows or reflections</li>
            <li>Take photos from a close distance</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="upload-actions">
      <button 
        @click="openCameraCapture"
        class="btn btn-primary"
        :disabled="isProcessing"
      >
        <span>📱</span>
        Take Photo
      </button>
      
      <button 
        @click="openFileSelector"
        class="btn btn-outline"
        :disabled="isProcessing"
      >
        <span>📁</span>
        Upload from Device
      </button>
    </div>

    <!-- Image Validation Messages -->
    <div v-if="validationError" class="validation-error">
      <div class="alert alert-error">
        {{ validationError }}
      </div>
    </div>

    <!-- Processing Status -->
    <div v-if="isProcessing" class="processing-status">
      <div class="spinner"></div>
      <p>Preparing image for analysis...</p>
    </div>

    <div v-if="isCameraOpen" class="camera-dialog" role="dialog" aria-modal="true" aria-labelledby="camera-dialog-title">
      <div class="camera-dialog-content">
        <div class="camera-dialog-header">
          <h3 id="camera-dialog-title">Take a photo</h3>
          <button type="button" class="camera-close" @click="closeCamera" aria-label="Close camera">×</button>
        </div>
        <video ref="cameraVideo" class="camera-video" autoplay playsinline muted></video>
        <p v-if="cameraError" class="camera-error" role="alert">{{ cameraError }}</p>
        <div class="camera-actions">
          <button type="button" class="btn btn-primary" @click="capturePhoto" :disabled="!!cameraError">
            Capture photo
          </button>
          <button type="button" class="btn btn-outline" @click="closeCamera">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageUploader',

  emits: ['image-selected', 'error'],

  data() {
    return {
      selectedFile: null,
      imagePreview: null,
      isDragOver: false,
      isProcessing: false,
      validationError: null,
      isCameraOpen: false,
      cameraError: null,
      cameraStream: null,
      
      // Validation constraints
      // Base64 expands the request, so keep the source below Roboflow's 5 MB limit.
      maxFileSize: Math.floor(3.5 * 1024 * 1024),
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    };
  },

  methods: {
    openFileSelector() {
      if (!this.isProcessing) {
        this.$refs.fileInput.click();
      }
    },

    async openCameraCapture() {
      if (this.isProcessing || this.isCameraOpen) return;

      this.cameraError = null;
      if (!navigator.mediaDevices?.getUserMedia) {
        this.cameraError = 'Camera access is not available in this browser. Use Upload from Device instead.';
        return;
      }

      try {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
        this.isCameraOpen = true;
        await this.$nextTick();
        this.$refs.cameraVideo.srcObject = this.cameraStream;
      } catch (error) {
        this.cameraStream = null;
        this.cameraError = error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access in your browser, then try again.'
          : 'Unable to open the camera. Use Upload from Device instead.';
      }
    },

    closeCamera() {
      this.cameraStream?.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
      this.isCameraOpen = false;
      this.cameraError = null;
    },

    async capturePhoto() {
      const video = this.$refs.cameraVideo;
      if (!video || !video.videoWidth || !video.videoHeight) {
        this.cameraError = 'The camera is not ready yet. Please try again.';
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) {
        this.cameraError = 'Unable to capture the photo. Please try again.';
        return;
      }

      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      this.closeCamera();
      await this.processFile(file);
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.processFile(file);
      }
    },

    handleDrop(event) {
      event.preventDefault();
      this.isDragOver = false;

      if (this.isProcessing) return;

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.processFile(files[0]);
      }
    },

    handleDragOver(event) {
      event.preventDefault();
      if (!this.isProcessing) {
        this.isDragOver = true;
      }
    },

    handleDragLeave(event) {
      event.preventDefault();
      this.isDragOver = false;
    },

    async processFile(file) {
      this.clearValidation();
      
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        this.validationError = validation.error;
        this.$emit('error', validation.error);
        return;
      }

      this.isProcessing = true;

      try {
        // Create a persistent data URL preview so it survives component unmount
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(file);
        });

        // Validate image dimensions using temporary object URL
        const imageValid = await this.validateImageDimensions(file);
        if (!imageValid.valid) {
          this.validationError = imageValid.error;
          this.$emit('error', imageValid.error);
          return;
        }

        // Set the image using data URL
        this.selectedFile = file;
        this.imagePreview = dataUrl;

        console.log('Image processed successfully:', {
          fileName: file.name,
          fileSize: file.size,
          hasPreview: !!this.imagePreview
        });

        // Emit the selected image data (include data URL preview)
        this.$emit('image-selected', {
          file: file,
          preview: this.imagePreview,
          name: file.name,
          size: file.size,
          type: file.type
        });

        // Reset file inputs
        this.$refs.fileInput.value = '';
        this.$refs.cameraInput.value = '';

      } catch (error) {
        this.validationError = 'Error processing image: ' + error.message;
        this.$emit('error', this.validationError);
      } finally {
        this.isProcessing = false;
      }
    },

    validateFile(file) {
      // Check file type
      if (!this.allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `Invalid file type. Please select a JPEG, PNG, or WebP image.`
        };
      }

      // Check file size
      if (file.size > this.maxFileSize) {
        return {
          valid: false,
          error: `File too large. Maximum size is ${this.formatFileSize(this.maxFileSize)}.`
        };
      }

      // Check if file is empty
      if (file.size === 0) {
        return {
          valid: false,
          error: 'File appears to be empty. Please select a valid image.'
        };
      }

      return { valid: true };
    },

    validateImageDimensions(file) {
      return new Promise((resolve) => {
        const img = new Image();
        const tempUrl = URL.createObjectURL(file);

        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          
          // Check aspect ratio (warn if very extreme)
          const aspectRatio = width / height;
          if (aspectRatio > 4 || aspectRatio < 0.25) {
            console.warn('Unusual aspect ratio detected:', aspectRatio);
          }

          resolve({ 
            valid: true,
            dimensions: { width, height }
          });
        };

        img.onerror = () => {
          resolve({
            valid: false,
            error: 'Unable to process image. Please ensure it\'s a valid image file.'
          });
        };

        img.src = tempUrl;
        // Clean up temporary URL after load/error via timeout (best-effort)
        const cleanup = () => { try { URL.revokeObjectURL(tempUrl); } catch (e) {} };
        img.addEventListener('load', cleanup);
        img.addEventListener('error', cleanup);
      });
    },

    clearImage() {
      // imagePreview is a data URL now; nothing to revoke
      this.selectedFile = null;
      this.imagePreview = null;
      this.clearValidation();
      
      // Reset file inputs
      this.$refs.fileInput.value = '';
      this.$refs.cameraInput.value = '';
    },

    clearValidation() {
      this.validationError = null;
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  },

  beforeUnmount() {
    this.closeCamera();
  }
};
</script>

<style scoped>
.image-uploader {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Upload Area */
.upload-area {
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  background: var(--bg-secondary);
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover:not(.disabled) {
  border-color: var(--primary);
  background: var(--primary-light);
}

.upload-area.drag-over {
  border-color: var(--primary);
  background: var(--primary-light);
  transform: scale(1.02);
}

.upload-area.has-image {
  padding: 0;
  background: transparent;
  border-color: var(--success);
}

.upload-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Upload Prompt */
.upload-prompt {
  width: 100%;
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 4rem;
}

.upload-prompt h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text);
}

.upload-instructions {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
}

.upload-tips {
  background: var(--card);
  border-radius: var(--radius);
  padding: var(--spacing-lg);
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.upload-tips h4 {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-md);
  color: var(--text);
}

.upload-tips ul {
  margin: 0;
  padding-left: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.upload-tips li {
  margin-bottom: var(--spacing-xs);
}

/* Image Preview */
.image-preview {
  width: 100%;
  height: 400px;
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-md);
  opacity: 0;
  transition: var(--transition);
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.image-info {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.image-name {
  font-weight: 600;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.image-size {
  font-size: var(--font-size-xs);
  opacity: 0.9;
  margin: 0;
}

.remove-button {
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  font-size: var(--font-size-lg);
  font-weight: bold;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button:hover:not(:disabled) {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

/* Action Buttons */
.upload-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.upload-actions .btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Validation Error */
.validation-error {
  margin-top: var(--spacing-lg);
}

/* Processing Status */
.processing-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--info-bg);
  border-radius: var(--radius);
  color: #1e40af;
}

.processing-status p {
  margin: 0;
  font-weight: 500;
}

.camera-dialog {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: rgba(15, 23, 42, 0.78);
}

.camera-dialog-content {
  width: min(100%, 34rem);
  padding: var(--spacing-lg);
  background: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.camera-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.camera-dialog-header h3 {
  margin: 0;
}

.camera-close {
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.camera-video {
  width: 100%;
  max-height: 65vh;
  display: block;
  background: #111827;
  border-radius: var(--radius);
  object-fit: cover;
}

.camera-error {
  margin: var(--spacing-md) 0 0;
  color: var(--error);
}

.camera-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .upload-area {
    padding: var(--spacing-xl);
    min-height: 300px;
  }

  .upload-icon {
    font-size: 3rem;
    height: 3rem;
  }

  .upload-prompt h3 {
    font-size: var(--font-size-lg);
  }

  .upload-instructions {
    font-size: var(--font-size-base);
  }

  .upload-actions {
    flex-direction: column;
    align-items: center;
  }

  .upload-actions .btn {
    width: 100%;
    max-width: 250px;
  }

  .image-preview {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .upload-area {
    padding: var(--spacing-lg);
    min-height: 250px;
  }

  .upload-tips {
    padding: var(--spacing-md);
  }

  .image-overlay {
    padding: var(--spacing-sm);
  }
}
</style>
