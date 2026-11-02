// FILE: client/src/utils/modelLoader.js
import * as tf from '@tensorflow/tfjs';

class ModelLoader {
  constructor() {
    this.model = null;
    this.isLoading = false;
    this.isLoaded = false;
    this.classNames = [
      'Healthy',
      'Black Spot', 
      'Canker',
      'Greening'
    ];
    // Using the Teachable Machine shareable link
    this.modelUrl = 'https://teachablemachine.withgoogle.com/models/_sIGGWs5K/';
  }

  async loadModel() {
    if (this.isLoaded) return this.model;
    if (this.isLoading) {
      // Wait for current loading to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.model;
    }

    this.isLoading = true;
    
    try {
      console.log('Loading Teachable Machine model from URL...');
      
      // Load the model from Teachable Machine URL
      this.model = await tf.loadLayersModel(this.modelUrl + 'model.json');
      
      console.log('Model loaded successfully');
      console.log('Model input shape:', this.model.inputs[0].shape);
      
      this.isLoaded = true;
      return this.model;
      
    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error(`Failed to load model: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  preprocessImage(imageElement) {
    return tf.tidy(() => {
      // Teachable Machine expects specific preprocessing:
      // 1. Resize to 224x224
      // 2. Normalize to [-1, 1] range (not [0, 1])
      const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224]) // Teachable Machine standard size
        .toFloat()
        .div(127.5) // Normalize to [0, 2]
        .sub(1) // Shift to [-1, 1] range (Teachable Machine standard)
        .expandDims(); // Add batch dimension
      
      return tensor;
    });
  }

  async predict(imageElement) {
    try {
      if (!this.model) {
        await this.loadModel();
      }

      console.log('Making prediction...');
      
      // Preprocess the image
      const preprocessedImage = this.preprocessImage(imageElement);
      
      // Make prediction
      const predictions = this.model.predict(preprocessedImage);
      
      // Get the prediction data
      const predictionData = await predictions.data();
      
      // Clean up tensors
      preprocessedImage.dispose();
      predictions.dispose();
      
      // Create results array
      const results = this.classNames.map((className, index) => ({
        className,
        probability: predictionData[index]
      }));
      
      // Sort by probability (highest first)
      results.sort((a, b) => b.probability - a.probability);
      
      console.log('Prediction results:', results);
      
      return {
        predictions: results,
        topPrediction: results[0]
      };
      
    } catch (error) {
      console.error('Error making prediction:', error);
      throw new Error(`Prediction failed: ${error.message}`);
    }
  }

  getClassNames() {
    return this.classNames;
  }

  isModelLoaded() {
    return this.isLoaded;
  }
}

// Create singleton instance
export const modelLoader = new ModelLoader();