import { ValidationRule } from '../types';

// Rule: CNN requires image/spatial data
export const cnnRequiresImageData: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isTabularData = fromNode.type === 'dataset' && 
                        fromNode.metadata?.dataType === 'tabular';
  const isCNN = toNode.type === 'model' && 
                toNode.metadata?.architecture === 'cnn';

  if (isTabularData && isCNN) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error'
    };
  }

  return null;
};

// Rule: Softmax loss requires classification model
export const softmaxForClassification: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isRegressionModel = fromNode.type === 'model' && 
                            fromNode.metadata?.task === 'regression';
  const isSoftmaxLoss = toNode.type === 'loss' && 
                        toNode.metadata?.lossType === 'softmax';

  if (isRegressionModel && isSoftmaxLoss) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error'
    };
  }

  return null;
};

// Rule: MSE loss requires regression model
export const mseForRegression: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isClassificationModel = fromNode.type === 'model' && 
                                fromNode.metadata?.task === 'classification';
  const isMSELoss = toNode.type === 'loss' && 
                    toNode.metadata?.lossType === 'mse';

  if (isClassificationModel && isMSELoss) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error'
    };
  }

  return null;
};

// Rule: Dataset must connect to model (not directly to loss)
export const datasetToModelFirst: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isDataset = fromNode.type === 'dataset';
  const isLoss = toNode.type === 'loss';

  if (isDataset && isLoss) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error'
    };
  }

  return null;
};

// Rule: Optimizer must connect after loss
export const optimizerAfterLoss: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isModel = fromNode.type === 'model';
  const isOptimizer = toNode.type === 'optimizer';

  if (isModel && isOptimizer) {
    // Check if there's a loss node in the path
    const hasLossConnection = scene.connections.some(c => {
      const lossNode = scene.nodes.find(n => n.id === c.toNodeId);
      return c.fromNodeId === fromNode.id && lossNode?.type === 'loss';
    });

    if (!hasLossConnection) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'error'
      };
    }
  }

  return null;
};

// Rule: RNN/LSTM requires sequential data
export const rnnRequiresSequentialData: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const isNonSequentialData = fromNode.type === 'dataset' && 
                              fromNode.metadata?.dataType === 'static';
  const isRNN = toNode.type === 'model' && 
                (toNode.metadata?.architecture === 'rnn' || 
                 toNode.metadata?.architecture === 'lstm');

  if (isNonSequentialData && isRNN) {
    return {
      connectionId: connection.id,
      isValid: false,
      severity: 'error'
    };
  }

  return null;
};

// Rule: Batch size must match
export const batchSizeConsistency: ValidationRule = (connection, scene) => {
  const fromNode = scene.nodes.find(n => n.id === connection.fromNodeId);
  const toNode = scene.nodes.find(n => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const fromBatchSize = fromNode.metadata?.batchSize;
  const toBatchSize = toNode.metadata?.batchSize;

  if (fromBatchSize !== undefined && toBatchSize !== undefined) {
    if (fromBatchSize !== toBatchSize) {
      return {
        connectionId: connection.id,
        isValid: false,
        severity: 'error'
      };
    }
  }

  return null;
};
