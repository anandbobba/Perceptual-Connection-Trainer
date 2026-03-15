export interface MLComponentDef {
  type: string;
  label: string;
  width: number;
  height: number;
  metadata: Record<string, any>;
  color: string;
}

export const ML_COMPONENTS: Record<string, MLComponentDef> = {
  // Data Ingestion & Storage
  'data-imageNet': {
    type: 'dataset',
    label: 'ImageNet',
    width: 90,
    height: 60,
    metadata: { samples: 14000000, classes: 1000, resolution: '224x224', format: 'JPEG' },
    color: '#2563eb'
  },
  'data-coco': {
    type: 'dataset',
    label: 'COCO Dataset',
    width: 90,
    height: 60,
    metadata: { samples: 330000, objects: 1500000, categories: 80 },
    color: '#1d4ed8'
  },
  'data-csv': {
    type: 'dataset',
    label: 'CSV Import',
    width: 90,
    height: 60,
    metadata: { format: 'tabular', encoding: 'UTF-8', delimiter: ',' },
    color: '#1e40af'
  },
  'data-timeseries': {
    type: 'dataset',
    label: 'Time Series',
    width: 90,
    height: 60,
    metadata: { temporal: true, frequency: 'variable', seasonality: 'auto-detect' },
    color: '#1e3a8a'
  },
  'data-nlp-corpus': {
    type: 'dataset',
    label: 'Text Corpus',
    width: 90,
    height: 60,
    metadata: { tokens: 'variable', vocabulary: 50000, embedding: 'Word2Vec/BERT' },
    color: '#172554'
  },
  'data-audio-wav': {
    type: 'dataset',
    label: 'Audio WAV',
    width: 90,
    height: 60,
    metadata: { sampleRate: 44100, bitDepth: 16, channels: 2 },
    color: '#3b82f6'
  },

  // Deep Learning Architectures
  'model-resnet50': {
    type: 'model',
    label: 'ResNet-50',
    width: 100,
    height: 65,
    metadata: { layers: 50, params: '25.6M', input: '224x224x3', architecture: 'residual' },
    color: '#dc2626'
  },
  'model-vgg16': {
    type: 'model',
    label: 'VGG-16',
    width: 100,
    height: 65,
    metadata: { layers: 16, params: '138M', input: '224x224x3', convLayers: 13 },
    color: '#b91c1c'
  },
  'model-bert-base': {
    type: 'model',
    label: 'BERT Base',
    width: 100,
    height: 65,
    metadata: { encoders: 12, hiddenSize: 768, params: '110M', attention: 'multi-head' },
    color: '#991b1b'
  },
  'model-gpt3': {
    type: 'model',
    label: 'GPT-3',
    width: 100,
    height: 65,
    metadata: { layers: 96, params: '175B', contextWindow: 2048, tokenizer: 'BPE' },
    color: '#7f1d1d'
  },
  'model-yolov8': {
    type: 'model',
    label: 'YOLOv8',
    width: 100,
    height: 65,
    metadata: { task: 'object-detection', realtime: true, mAP: '53.9', backbone: 'CSPDarknet' },
    color: '#ef4444'
  },
  'model-efficientnet': {
    type: 'model',
    label: 'EfficientNet',
    width: 100,
    height: 65,
    metadata: { params: '5.3M', compound: true, accuracy: '84.3%', efficient: true },
    color: '#f97316'
  },
  'model-unet': {
    type: 'model',
    label: 'U-Net',
    width: 100,
    height: 65,
    metadata: { task: 'segmentation', encoder: 'contracting', decoder: 'expanding' },
    color: '#ea580c'
  },
  'model-lstm': {
    type: 'model',
    label: 'LSTM',
    width: 100,
    height: 65,
    metadata: { recurrent: true, gates: 3, forgetGate: true, cellState: true },
    color: '#c2410c'
  },
  'model-gru': {
    type: 'model',
    label: 'GRU',
    width: 100,
    height: 65,
    metadata: { recurrent: true, gates: 2, resetGate: true, updateGate: true },
    color: '#9a3412'
  },

  // Neural Network Layers
  'layer-conv2d': {
    type: 'layer',
    label: 'Conv2D',
    width: 95,
    height: 55,
    metadata: { kernelSize: '3x3', stride: 1, padding: 'same', activation: 'ReLU' },
    color: '#059669'
  },
  'layer-maxpool2d': {
    type: 'layer',
    label: 'MaxPool2D',
    width: 95,
    height: 55,
    metadata: { poolSize: '2x2', stride: 2, downsampling: true },
    color: '#047857'
  },
  'layer-dense': {
    type: 'layer',
    label: 'Dense (FC)',
    width: 95,
    height: 55,
    metadata: { units: 128, activation: 'ReLU', fullyConnected: true },
    color: '#065f46'
  },
  'layer-dropout': {
    type: 'layer',
    label: 'Dropout',
    width: 95,
    height: 55,
    metadata: { rate: 0.5, regularization: true, training: 'only' },
    color: '#064e3b'
  },
  'layer-batchnorm': {
    type: 'layer',
    label: 'BatchNorm',
    width: 95,
    height: 55,
    metadata: { momentum: 0.99, epsilon: 0.001, normalization: true },
    color: '#10b981'
  },
  'layer-attention': {
    type: 'layer',
    label: 'Attention',
    width: 95,
    height: 55,
    metadata: { heads: 8, queryKeyValue: true, scaledDotProduct: true },
    color: '#14532d'
  },
  'layer-embedding': {
    type: 'layer',
    label: 'Embedding',
    width: 95,
    height: 55,
    metadata: { vocabSize: 50000, embeddingDim: 300, word2vec: true },
    color: '#22c55e'
  },

  // Optimizers
  'optimizer-adam': {
    type: 'optimizer',
    label: 'Adam',
    width: 95,
    height: 55,
    metadata: { learningRate: 0.001, beta1: 0.9, beta2: 0.999, adaptive: true },
    color: '#f59e0b'
  },
  'optimizer-sgd': {
    type: 'optimizer',
    label: 'SGD',
    width: 95,
    height: 55,
    metadata: { learningRate: 0.01, momentum: 0.9, nesterov: false },
    color: '#d97706'
  },
  'optimizer-rmsprop': {
    type: 'optimizer',
    label: 'RMSprop',
    width: 95,
    height: 55,
    metadata: { learningRate: 0.001, rho: 0.9, decay: 0, centered: false },
    color: '#b45309'
  },

  // Loss Functions
  'loss-categorical-crossentropy': {
    type: 'loss',
    label: 'CCE Loss',
    width: 95,
    height: 55,
    metadata: { multiclass: true, softmax: true, logits: false },
    color: '#ef4444'
  },
  'loss-binary-crossentropy': {
    type: 'loss',
    label: 'BCE Loss',
    width: 95,
    height: 55,
    metadata: { binary: true, sigmoid: true, logits: false },
    color: '#dc2626'
  },
  'loss-mse': {
    type: 'loss',
    label: 'MSE Loss',
    width: 95,
    height: 55,
    metadata: { regression: true, squaredError: true, l2: true },
    color: '#b91c1c'
  },
  'loss-huber': {
    type: 'loss',
    label: 'Huber Loss',
    width: 95,
    height: 55,
    metadata: { regression: true, robust: true, delta: 1.0 },
    color: '#991b1b'
  },

  // Data Preprocessing & Augmentation
  'preprocess-normalize': {
    type: 'preprocessing',
    label: 'Normalize',
    width: 95,
    height: 55,
    metadata: { mean: 0, std: 1, minMax: '0-1', zScore: true },
    color: '#8b5cf6'
  },
  'preprocess-augment-image': {
    type: 'preprocessing',
    label: 'Image Augment',
    width: 95,
    height: 55,
    metadata: { rotation: 30, flip: true, zoom: 0.2, brightness: 0.2 },
    color: '#7c3aed'
  },
  'preprocess-tokenizer': {
    type: 'preprocessing',
    label: 'Tokenizer',
    width: 95,
    height: 55,
    metadata: { vocabSize: 50000, method: 'WordPiece/BPE', padding: true },
    color: '#6d28d9'
  },
  'preprocess-feature-scale': {
    type: 'preprocessing',
    label: 'Feature Scale',
    width: 95,
    height: 55,
    metadata: { method: 'StandardScaler', robust: false, range: '0-1' },
    color: '#5b21b6'
  },

  // Evaluation & Metrics
  'metric-accuracy': {
    type: 'metric',
    label: 'Accuracy',
    width: 95,
    height: 55,
    metadata: { classification: true, topK: 1, percentage: true },
    color: '#06b6d4'
  },
  'metric-precision-recall': {
    type: 'metric',
    label: 'Precision/Recall',
    width: 95,
    height: 55,
    metadata: { f1Score: true, confusion: true, multiclass: true },
    color: '#0891b2'
  },
  'metric-auc-roc': {
    type: 'metric',
    label: 'AUC-ROC',
    width: 95,
    height: 55,
    metadata: { binary: true, curve: 'ROC', threshold: 0.5 },
    color: '#0e7490'
  },
  'metric-iou': {
    type: 'metric',
    label: 'IoU / mAP',
    width: 95,
    height: 55,
    metadata: { objectDetection: true, segmentation: true, jaccard: true },
    color: '#155e75'
  },

  // Training Components
  'train-early-stopping': {
    type: 'training',
    label: 'Early Stop',
    width: 95,
    height: 55,
    metadata: { patience: 10, monitor: 'val_loss', restore: true },
    color: '#84cc16'
  },
  'train-checkpoint': {
    type: 'training',
    label: 'Checkpoint',
    width: 95,
    height: 55,
    metadata: { saveFrequency: 'epoch', format: 'HDF5/PyTorch', bestOnly: true },
    color: '#65a30d'
  },
  'train-learning-rate-schedule': {
    type: 'training',
    label: 'LR Schedule',
    width: 95,
    height: 55,
    metadata: { method: 'cosine/step', warmup: true, decay: 0.1 },
    color: '#4d7c0f'
  },

  // Deployment & Inference
  'deploy-tensorrt': {
    type: 'deployment',
    label: 'TensorRT',
    width: 95,
    height: 55,
    metadata: { inference: true, nvidia: true, optimization: 'FP16/INT8' },
    color: '#78350f'
  },
  'deploy-onnx': {
    type: 'deployment',
    label: 'ONNX Export',
    width: 95,
    height: 55,
    metadata: { interoperable: true, framework: 'agnostic', quantization: true },
    color: '#92400e'
  },
  'deploy-tflite': {
    type: 'deployment',
    label: 'TFLite',
    width: 95,
    height: 55,
    metadata: { mobile: true, edge: true, quantization: 'INT8', size: 'optimized' },
    color: '#a16207'
  }
};
