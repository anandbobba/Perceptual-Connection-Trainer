/**
 * Real-world ML Pipeline Connection Rules
 * Based on actual deep learning architecture patterns and data flow requirements
 */

import { ValidationRule, Scene } from '../types';

const getNode = (nodeId: string, scene: Scene) => {
  return scene.nodes.find(n => n.id === nodeId);
};

// Real ML data flow requirements
export const mlDatasetToModelRequired: ValidationRule = (connection, scene) => {
  const toNode = getNode(connection.toNodeId, scene);
  if (!toNode || !toNode.type.includes('model')) return null;

  const fromNode = getNode(connection.fromNodeId, scene);
  if (!fromNode || !fromNode.type.includes('dataset')) {
    return {
      isValid: false,
      severity: 'error',
      message: `${toNode.label} requires dataset input. Connect a dataset (ImageNet, COCO, CSV, etc.)`,
      connectionId: connection.id,
      rule: 'ML: Dataset required for model'
    };
  }

  // Check dataset-model compatibility
  const datasetType = fromNode.type;
  const modelType = toNode.type;

  // Real compatibility constraints
  const incompatibilities: Record<string, string[]> = {
    'dataset-imageNet': ['model-lstm', 'model-gru'], // CNNs for images, not RNNs
    'dataset-timeseries': ['model-yolov8', 'model-resnet50'], // RNNs for sequences
    'data-csv': ['model-yolov8'], // Object detection needs images
    'data-nlp-corpus': ['model-resnet50', 'model-yolov8'], // NLP models for text
    'data-audio-wav': ['model-resnet50', 'model-vgg16'] // Audio needs specialized models
  };

  const incompatible = incompatibilities[datasetType] || [];
  if (incompatible.includes(modelType)) {
    return {
      isValid: false,
      severity: 'error',
      message: `Dataset type ${datasetType} is incompatible with ${modelType}. Use appropriate dataset type.`,
      connectionId: connection.id,
      rule: 'ML: Dataset-Model compatibility'
    };
  }

  return null;
};

// Model must connect to layers (not directly to loss)
export const mlModelToLayersRequired: ValidationRule = (connection, scene) => {
  const toNode = getNode(connection.toNodeId, scene);
  
  if (!toNode || !toNode.type.includes('loss')) return null;

  const fromNode = getNode(connection.fromNodeId, scene);
  
  // Loss functions should receive output from layers/models, not datasets
  if (fromNode && fromNode.type.includes('dataset')) {
    return {
      isValid: false,
      severity: 'error',
      message: 'Loss function cannot directly connect to dataset. Add model and layers between dataset and loss.',
      connectionId: connection.id,
      rule: 'ML: Model layers required'
    };
  }

  return null;
};

// Loss function sequence requirement
export const mlLossToOptimizerRequired: ValidationRule = (connection, scene) => {
  const toNode = getNode(connection.toNodeId, scene);
  
  if (!toNode || !toNode.type.includes('optimizer')) return null;

  const fromNode = getNode(connection.fromNodeId, scene);
  
  // Optimizer should receive loss, not directly model
  if (fromNode && fromNode.type.includes('model') && !fromNode.type.includes('loss')) {
    return {
      isValid: false,
      severity: 'error',
      message: 'Optimizer typically receives loss function output, not model directly. Add loss function.',
      connectionId: connection.id,
      rule: 'ML: Loss-Optimizer sequence'
    };
  }

  return null;
};

// Real layer configuration validation
export const mlConvolutionalRequirements: ValidationRule = (connection, scene) => {
  const fromNode = getNode(connection.fromNodeId, scene);
  
  if (!fromNode || fromNode.type !== 'layer-conv2d') return null;

  const toNode = getNode(connection.toNodeId, scene);
  if (!toNode) return null;

  // Conv2D should connect to pooling, activation, or next layer
  const validNextLayers = [
    'layer-maxpool2d', 'layer-batchnorm', 'layer-dropout', 
    'layer-attention', 'layer-activation', 'layer-dense'
  ];

  if (!validNextLayers.includes(toNode.type) && !toNode.type.includes('model')) {
    return {
      isValid: false,
      severity: 'error',
      message: 'Conv2D layer should be followed by MaxPool, BatchNorm, or Activation for efficient processing.',
      connectionId: connection.id,
      rule: 'ML: Conv2D layer sequence'
    };
  }

  return null;
};

// Batch normalization placement
export const mlBatchNormPlacement: ValidationRule = (connection, scene) => {
  const fromNode = getNode(connection.fromNodeId, scene);
  
  if (!fromNode || fromNode.type !== 'layer-batchnorm') return null;

  const toNode = getNode(connection.toNodeId, scene);
  if (!toNode) return null;

  // BatchNorm should come after Conv or Dense, before activation
  const validPrevious = ['layer-conv2d', 'layer-dense', 'layer-embedding'];
  const validNext = ['layer-activation', 'layer-dropout', 'layer-dense', 'layer-maxpool2d'];

  // Count incoming connections to BatchNorm
  const incomingFromValid = scene.connections.some(c => 
    c.toNodeId === fromNode.id && 
    validPrevious.some(vp => {
      const node = getNode(c.fromNodeId, scene);
      return node?.type === vp;
    })
  );

  const outgoingToValid = scene.connections.some(c =>
    c.fromNodeId === fromNode.id &&
    validNext.some(vn => {
      const node = getNode(c.toNodeId, scene);
      return node?.type === vn;
    })
  );

  if (!incomingFromValid || !outgoingToValid) {
    return {
      isValid: false,
      severity: 'error',
      message: 'BatchNorm should be placed after Conv/Dense and before Activation layers.',
      connectionId: connection.id,
      rule: 'ML: BatchNorm placement'
    };
  }

  return null;
};

// Attention layer real requirements
export const mlAttentionHeads: ValidationRule = (connection, scene) => {
  const node = getNode(connection.fromNodeId, scene) || getNode(connection.toNodeId, scene);
  
  if (!node || node.type !== 'layer-attention') return null;

  // Validate attention heads configuration
  const heads = node.metadata?.heads || 8;
  if (heads !== 1 && heads !== 4 && heads !== 8 && heads !== 16) {
    return {
      isValid: false,
      severity: 'error',
      message: `Attention heads must be power of 2: 1, 2, 4, 8, or 16. Current: ${heads}`,
      connectionId: connection.id,
      rule: 'ML: Attention head count'
    };
  }

  return null;
};

// Dropout placement (should not be last layer)
export const mlDropoutPlacement: ValidationRule = (connection, scene) => {
  const fromNode = getNode(connection.fromNodeId, scene);
  
  if (!fromNode || fromNode.type !== 'layer-dropout') return null;

  // Check if there are any outgoing connections
  const hasOutgoing = scene.connections.some(c => c.fromNodeId === fromNode.id);

  if (!hasOutgoing) {
    return {
      isValid: false,
      severity: 'error',
      message: 'Dropout layer should not be the output layer. Add Dense or pooling after.',
      connectionId: connection.id,
      rule: 'ML: Dropout placement'
    };
  }

  return null;
};

// Embedding layer requirements (for NLP)
export const mlEmbeddingRequirements: ValidationRule = (connection, scene) => {
  const fromNode = getNode(connection.fromNodeId, scene);
  
  if (!fromNode || fromNode.type !== 'layer-embedding') return null;

  // Embedding should only receive tokenized data
  const prevNode = scene.connections
    .filter(c => c.toNodeId === fromNode.id)
    .map(c => getNode(c.fromNodeId, scene))[0];

  if (prevNode && !prevNode.type.includes('tokenizer')) {
    return {
      isValid: false,
      severity: 'error',
      message: 'Embedding layer requires tokenized input. Add Tokenizer layer before embedding.',
      connectionId: connection.id,
      rule: 'ML: Embedding requirements'
    };
  }

  return null;
};

// Real training hyperparameter validation
export const mlOptimizersRequireValidation: ValidationRule = (connection, scene) => {
  const toNode = getNode(connection.toNodeId, scene);
  
  if (!toNode || !toNode.type.includes('optimizer')) return null;

  const learningRate = toNode.metadata?.learningRate || 0.001;
  
  // Real LR ranges for different optimizers
  const lrRanges: Record<string, [number, number]> = {
    'optimizer-adam': [0.0001, 0.001],
    'optimizer-sgd': [0.001, 0.1],
    'optimizer-rmsprop': [0.0001, 0.001],
    'optimizer-adamw': [0.0001, 0.001]
  };

  const range = lrRanges[toNode.type];
  if (range && (learningRate < range[0] || learningRate > range[1])) {
    return {
      isValid: false,
      severity: 'error',
      message: `${toNode.type} LR ${learningRate} is outside typical range [${range[0]}-${range[1]}]`,
      connectionId: connection.id,
      rule: 'ML: Optimizer hyperparameters'
    };
  }

  return null;
};

// Loss function validation
export const mlLossFunctionCompatibility: ValidationRule = (connection, scene) => {
  const fromNode = getNode(connection.fromNodeId, scene);
  const toNode = getNode(connection.toNodeId, scene);

  // Check if we're connecting model output to loss
  if (fromNode?.type.includes('model') && toNode?.type.includes('loss')) {
    const lossType = toNode.type;
    const modelTask = fromNode.metadata?.task;

    // Real compatibility rules
    const compatibilities: Record<string, string[]> = {
      'loss-categorical-crossentropy': ['classification', 'multiclass'],
      'loss-binary-crossentropy': ['binary-classification'],
      'loss-mse': ['regression'],
      'loss-huber': ['regression']
    };

    const validTasks = compatibilities[lossType] || [];
    
    if (modelTask && !validTasks.includes(modelTask)) {
      return {
        isValid: false,
        severity: 'error',
        message: `${lossType} requires ${validTasks.join('/')} task. Model configured for ${modelTask}.`,
        connectionId: connection.id,
        rule: 'ML: Loss-Model compatibility'
      };
    }
  }

  return null;
};
