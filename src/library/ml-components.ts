export interface MLComponentDef {
  type: string;
  label: string;
  width: number;
  height: number;
  metadata: Record<string, any>;
  color: string;
}

export const ML_COMPONENTS: Record<string, MLComponentDef> = {
  // Datasets
  'dataset-image': {
    type: 'dataset',
    label: 'Image Data',
    width: 70,
    height: 50,
    metadata: { dataType: 'image', dimensions: 3 },
    color: '#4a90e2'
  },
  'dataset-tabular': {
    type: 'dataset',
    label: 'Tabular',
    width: 70,
    height: 50,
    metadata: { dataType: 'tabular', dimensions: 2 },
    color: '#5da5d5'
  },
  'dataset-sequential': {
    type: 'dataset',
    label: 'Sequential',
    width: 70,
    height: 50,
    metadata: { dataType: 'sequential', timeSteps: true },
    color: '#6bb5e8'
  },
  'dataset-text': {
    type: 'dataset',
    label: 'Text Data',
    width: 70,
    height: 50,
    metadata: { dataType: 'text', vocabulary: true },
    color: '#78c5fb'
  },
  'dataset-audio': {
    type: 'dataset',
    label: 'Audio',
    width: 70,
    height: 50,
    metadata: { dataType: 'audio', sampleRate: 44100 },
    color: '#85d5ff'
  },
  'dataset-video': {
    type: 'dataset',
    label: 'Video',
    width: 70,
    height: 50,
    metadata: { dataType: 'video', fps: 30 },
    color: '#3a7bc8'
  },

  // Neural Network Architectures
  'model-cnn': {
    type: 'model',
    label: 'CNN',
    width: 70,
    height: 55,
    metadata: { architecture: 'cnn', task: 'classification', spatialInvariance: true },
    color: '#e94b3c'
  },
  'model-rnn': {
    type: 'model',
    label: 'RNN',
    width: 70,
    height: 55,
    metadata: { architecture: 'rnn', task: 'classification', sequential: true },
    color: '#d63c2d'
  },
  'model-lstm': {
    type: 'model',
    label: 'LSTM',
    width: 70,
    height: 55,
    metadata: { architecture: 'lstm', task: 'classification', sequential: true, memory: true },
    color: '#c32d1e'
  },
  'model-gru': {
    type: 'model',
    label: 'GRU',
    width: 70,
    height: 55,
    metadata: { architecture: 'gru', task: 'classification', sequential: true },
    color: '#b01e0f'
  },
  'model-transformer': {
    type: 'model',
    label: 'Transformer',
    width: 80,
    height: 55,
    metadata: { architecture: 'transformer', task: 'classification', attention: true },
    color: '#ff5c4c'
  },
  'model-mlp-regression': {
    type: 'model',
    label: 'MLP Reg',
    width: 70,
    height: 55,
    metadata: { architecture: 'mlp', task: 'regression', fullyConnected: true },
    color: '#ff6b5c'
  },
  'model-mlp-classification': {
    type: 'model',
    label: 'MLP Class',
    width: 75,
    height: 55,
    metadata: { architecture: 'mlp', task: 'classification', fullyConnected: true },
    color: '#ff7a6c'
  },
  'model-resnet': {
    type: 'model',
    label: 'ResNet',
    width: 70,
    height: 55,
    metadata: { architecture: 'resnet', task: 'classification', residualConnections: true },
    color: '#e63c2c'
  },
  'model-vgg': {
    type: 'model',
    label: 'VGG',
    width: 70,
    height: 55,
    metadata: { architecture: 'vgg', task: 'classification', deep: true },
    color: '#d32c1c'
  },
  'model-autoencoder': {
    type: 'model',
    label: 'Autoencoder',
    width: 80,
    height: 55,
    metadata: { architecture: 'autoencoder', task: 'reconstruction', unsupervised: true },
    color: '#c01c0c'
  },
  'model-gan': {
    type: 'model',
    label: 'GAN',
    width: 70,
    height: 55,
    metadata: { architecture: 'gan', task: 'generation', adversarial: true },
    color: '#ad0c00'
  },
  'model-vae': {
    type: 'model',
    label: 'VAE',
    width: 70,
    height: 55,
    metadata: { architecture: 'vae', task: 'generation', probabilistic: true },
    color: '#ff8c7c'
  },

  // Layers
  'layer-conv2d': {
    type: 'layer',
    label: 'Conv2D',
    width: 65,
    height: 45,
    metadata: { layerType: 'conv2d', trainable: true },
    color: '#1abc9c'
  },
  'layer-maxpool': {
    type: 'layer',
    label: 'MaxPool',
    width: 65,
    height: 45,
    metadata: { layerType: 'maxpool', trainable: false },
    color: '#16a085'
  },
  'layer-dense': {
    type: 'layer',
    label: 'Dense',
    width: 65,
    height: 45,
    metadata: { layerType: 'dense', trainable: true },
    color: '#0e9c81'
  },
  'layer-dropout': {
    type: 'layer',
    label: 'Dropout',
    width: 65,
    height: 45,
    metadata: { layerType: 'dropout', trainable: false, regularization: true },
    color: '#0a8c71'
  },
  'layer-batchnorm': {
    type: 'layer',
    label: 'BatchNorm',
    width: 70,
    height: 45,
    metadata: { layerType: 'batchnorm', trainable: true, normalization: true },
    color: '#067c61'
  },
  'layer-flatten': {
    type: 'layer',
    label: 'Flatten',
    width: 65,
    height: 45,
    metadata: { layerType: 'flatten', trainable: false },
    color: '#1acca9'
  },
  'layer-embedding': {
    type: 'layer',
    label: 'Embedding',
    width: 70,
    height: 45,
    metadata: { layerType: 'embedding', trainable: true, forText: true },
    color: '#2adcb9'
  },
  'layer-attention': {
    type: 'layer',
    label: 'Attention',
    width: 70,
    height: 45,
    metadata: { layerType: 'attention', trainable: true },
    color: '#3aecc9'
  },

  // Loss Functions
  'loss-crossentropy': {
    type: 'loss',
    label: 'CrossEntropy',
    width: 75,
    height: 50,
    metadata: { lossType: 'crossentropy', forTask: 'classification' },
    color: '#f39c12'
  },
  'loss-bce': {
    type: 'loss',
    label: 'BCE',
    width: 65,
    height: 50,
    metadata: { lossType: 'bce', forTask: 'binary-classification' },
    color: '#e08e0b'
  },
  'loss-mse': {
    type: 'loss',
    label: 'MSE',
    width: 65,
    height: 50,
    metadata: { lossType: 'mse', forTask: 'regression' },
    color: '#d68910'
  },
  'loss-mae': {
    type: 'loss',
    label: 'MAE',
    width: 65,
    height: 50,
    metadata: { lossType: 'mae', forTask: 'regression' },
    color: '#c77a09'
  },
  'loss-huber': {
    type: 'loss',
    label: 'Huber',
    width: 65,
    height: 50,
    metadata: { lossType: 'huber', forTask: 'regression', robust: true },
    color: '#b86b08'
  },
  'loss-ctc': {
    type: 'loss',
    label: 'CTC',
    width: 65,
    height: 50,
    metadata: { lossType: 'ctc', forTask: 'sequence-to-sequence' },
    color: '#f4a522'
  },
  'loss-triplet': {
    type: 'loss',
    label: 'Triplet',
    width: 65,
    height: 50,
    metadata: { lossType: 'triplet', forTask: 'metric-learning' },
    color: '#f5b032'
  },

  // Optimizers
  'optimizer-sgd': {
    type: 'optimizer',
    label: 'SGD',
    width: 65,
    height: 45,
    metadata: { optimizerType: 'sgd', learningRate: 0.01 },
    color: '#9b59b6'
  },
  'optimizer-adam': {
    type: 'optimizer',
    label: 'Adam',
    width: 65,
    height: 45,
    metadata: { optimizerType: 'adam', learningRate: 0.001, adaptive: true },
    color: '#8e44ad'
  },
  'optimizer-rmsprop': {
    type: 'optimizer',
    label: 'RMSProp',
    width: 70,
    height: 45,
    metadata: { optimizerType: 'rmsprop', learningRate: 0.001, adaptive: true },
    color: '#7d3c98'
  },
  'optimizer-adagrad': {
    type: 'optimizer',
    label: 'AdaGrad',
    width: 70,
    height: 45,
    metadata: { optimizerType: 'adagrad', learningRate: 0.01, adaptive: true },
    color: '#6c3483'
  },
  'optimizer-adamw': {
    type: 'optimizer',
    label: 'AdamW',
    width: 65,
    height: 45,
    metadata: { optimizerType: 'adamw', learningRate: 0.001, weightDecay: true },
    color: '#5b2c6f'
  },

  // Regularization
  'regularization-l1': {
    type: 'regularization',
    label: 'L1 Reg',
    width: 65,
    height: 45,
    metadata: { regType: 'l1', lambda: 0.01 },
    color: '#34495e'
  },
  'regularization-l2': {
    type: 'regularization',
    label: 'L2 Reg',
    width: 65,
    height: 45,
    metadata: { regType: 'l2', lambda: 0.01 },
    color: '#2c3e50'
  },

  // Preprocessing
  'preprocessing-normalize': {
    type: 'preprocessing',
    label: 'Normalize',
    width: 70,
    height: 45,
    metadata: { method: 'standardization' },
    color: '#16a085'
  },
  'preprocessing-augment': {
    type: 'preprocessing',
    label: 'Augment',
    width: 70,
    height: 45,
    metadata: { method: 'augmentation', forImages: true },
    color: '#1abc9c'
  },
  'preprocessing-tokenize': {
    type: 'preprocessing',
    label: 'Tokenize',
    width: 70,
    height: 45,
    metadata: { method: 'tokenization', forText: true },
    color: '#27ae60'
  },

  // Activation Functions
  'activation-relu': {
    type: 'activation',
    label: 'ReLU',
    width: 60,
    height: 40,
    metadata: { activationType: 'relu' },
    color: '#e74c3c'
  },
  'activation-sigmoid': {
    type: 'activation',
    label: 'Sigmoid',
    width: 65,
    height: 40,
    metadata: { activationType: 'sigmoid' },
    color: '#c0392b'
  },
  'activation-tanh': {
    type: 'activation',
    label: 'Tanh',
    width: 60,
    height: 40,
    metadata: { activationType: 'tanh' },
    color: '#a93226'
  },
  'activation-softmax': {
    type: 'activation',
    label: 'Softmax',
    width: 70,
    height: 40,
    metadata: { activationType: 'softmax' },
    color: '#922b21'
  },

  // Metrics
  'metric-accuracy': {
    type: 'metric',
    label: 'Accuracy',
    width: 70,
    height: 40,
    metadata: { metricType: 'accuracy' },
    color: '#3498db'
  },
  'metric-precision': {
    type: 'metric',
    label: 'Precision',
    width: 70,
    height: 40,
    metadata: { metricType: 'precision' },
    color: '#2980b9'
  },
  'metric-recall': {
    type: 'metric',
    label: 'Recall',
    width: 70,
    height: 40,
    metadata: { metricType: 'recall' },
    color: '#2471a3'
  },
  'metric-f1': {
    type: 'metric',
    label: 'F1 Score',
    width: 70,
    height: 40,
    metadata: { metricType: 'f1' },
    color: '#1f618d'
  }
};
