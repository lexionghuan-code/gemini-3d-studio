
export interface CameraParams {
  azimuth: number;    // 0 to 360
  elevation: number;  // -30 to 60
  distance: number;   // 0.6 to 1.4
}

export interface GenerationConfig {
  seed: number;
  randomizeSeed: boolean;
  guidanceScale: number;
  inferenceSteps: number;
}

export type AppStatus = 'idle' | 'uploading' | 'generating' | 'error';
