// src/services/api.ts

export type FileType = 'sdat' | 'esl';

export interface SdatResult {
  sensorId: string;
  data: { ts: number; value: number }[];
}

export interface EslResult {
  [obisCode: string]: number;
}

export interface UploadResponse<T> {
  type: FileType;
  files: T[];
}

/**
 * Upload one or more SDAT or ESL files to the backend.
 *
 * @param fileType  'sdat' or 'esl'
 * @param files     Array of File objects selected by the user
 * @returns         Parsed JSON response from the server
 */
export async function uploadFiles(
  fileType: FileType,
  files: File[],
): Promise<UploadResponse<SdatResult> | UploadResponse<EslResult>> {
  const form = new FormData();
  form.append('file_type', fileType);
  files.forEach((file) => form.append('files', file));

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    // Try to parse error detail
    let errorMsg = 'Upload failed';
    try {
      const err = await res.json();
      errorMsg = err.detail || JSON.stringify(err);
    } catch {}
    throw new Error(errorMsg);
  }

  return (await res.json()) as UploadResponse<SdatResult> | UploadResponse<EslResult>;
}
