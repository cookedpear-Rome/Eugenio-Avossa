
export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  error: string | null;
  progressMessage: string;
}
