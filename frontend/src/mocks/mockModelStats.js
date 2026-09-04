export const initialModelStats = {
  modelName: "YOLOv8n-face (ArcFace 512D)",
  status: "TRAINING_ACTIVE",
  datasetSize: "1,248 Images",
  classesCount: 8,
  currentEpoch: 42,
  totalEpochs: 50,
  progressPercent: 84,
  mapScore: "96.4%",
  loss: "0.0194",
  batchSize: 16,
  gpuDevice: "NVIDIA RTX 4070 (8.2 GB / 12 GB VRAM)",
  gpuTemperature: "64°C",
  fpsInference: "45 FPS",
};

export const initialGpuLogs = [
  "[SYSTEM] CUDA device detected: NVIDIA GeForce RTX 4070",
  "[SYSTEM] Loading base weights: yolov8n-face.pt...",
  "[YOLO] Transferred 355/355 items from pretrained weights",
  "[YOLO] Optimizer: AdamW(lr=0.001, momentum=0.9, weight_decay=0.0005)",
  "[EPOCH 38/50] Box Loss: 0.0241 | Cls Loss: 0.0182 | DFL: 0.0101 | mAP50: 0.948",
  "[EPOCH 39/50] Box Loss: 0.0229 | Cls Loss: 0.0175 | DFL: 0.0098 | mAP50: 0.952",
  "[EPOCH 40/50] Box Loss: 0.0210 | Cls Loss: 0.0163 | DFL: 0.0095 | mAP50: 0.959",
  "[EPOCH 41/50] Box Loss: 0.0202 | Cls Loss: 0.0158 | DFL: 0.0091 | mAP50: 0.961",
  "[EPOCH 42/50] Box Loss: 0.0194 | Cls Loss: 0.0149 | DFL: 0.0088 | mAP50: 0.964",
  "[YOLO] Validating checkpoint against test batch (128 images)... Validation OK.",
];
