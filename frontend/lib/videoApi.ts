// lib/videoApi.ts
"use client";

import { getApiClient } from './apiClient';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface VideoUploadResponse {
  success: boolean;
  file_id: string;
  filename: string;
  duration: number;
  message: string;
}

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export interface SubtitleStyle {
  font_size?: number;
  font_color?: string;
  bg_color?: string;
}

export interface AddSubtitlesRequest {
  file_id: string;
  subtitles: SubtitleSegment[];
  style?: SubtitleStyle;
}

export interface AddSimpleSubtitlesRequest {
  file_id: string;
  text: string;
}

export interface SubtitlesResponse {
  success: boolean;
  output_file_id: string;
  message: string;
  download_url: string;
}

export interface CleanupResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Video API Service
// ============================================================================

class VideoApiService {
  private api = getApiClient();

  /**
   * Upload a video file to the server
   * @param file - Video file to upload (mp4, mov, avi, webm, mkv)
   * @param onProgress - Optional callback for upload progress
   * @returns Upload response with file_id and metadata
   */
  async uploadVideo(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<VideoUploadResponse> {
    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await this.api.post<VideoUploadResponse>(
        '/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      return response;
    } catch (error) {
      console.error('Video upload failed:', error);
      throw error;
    }
  }

  /**
   * Add subtitles to a video with custom styling
   * @param request - Subtitle configuration with segments and style
   * @returns Response with download URL
   */
  async addSubtitles(request: AddSubtitlesRequest): Promise<SubtitlesResponse> {
    try {
      const response = await this.api.post<SubtitlesResponse>(
        '/api/add-subtitles',
        request
      );

      return response;
    } catch (error) {
      console.error('Failed to add subtitles:', error);
      throw error;
    }
  }

  /**
   * Add a simple subtitle that spans the entire video duration
   * @param request - Simple subtitle request with text
   * @returns Response with download URL
   */
  async addSimpleSubtitles(
    request: AddSimpleSubtitlesRequest
  ): Promise<SubtitlesResponse> {
    try {
      const response = await this.api.post<SubtitlesResponse>(
        '/api/add-simple-subtitles',
        request
      );

      return response;
    } catch (error) {
      console.error('Failed to add simple subtitles:', error);
      throw error;
    }
  }

  /**
   * Download the processed video
   * @param fileId - The file_id returned from upload/processing
   * @returns Blob of the video file
   */
  async downloadVideo(fileId: string): Promise<Blob> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/download/${fileId}`
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Video download failed:', error);
      throw error;
    }
  }

  /**
   * Get download URL for a processed video
   * @param fileId - The file_id returned from upload/processing
   * @returns Full download URL
   */
  getDownloadUrl(fileId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    return `${baseUrl}/api/download/${fileId}`;
  }

  /**
   * Clean up uploaded and processed files
   * @param fileId - The file_id to clean up
   * @returns Cleanup confirmation
   */
  async cleanupFiles(fileId: string): Promise<CleanupResponse> {
    try {
      const response = await this.api.delete<CleanupResponse>(
        `/api/cleanup/${fileId}`
      );

      return response;
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Process video with AI-generated subtitles
   * This is a helper method that combines upload and subtitle addition
   * @param file - Video file
   * @param subtitles - Subtitle segments
   * @param style - Optional styling
   * @param onUploadProgress - Upload progress callback
   * @returns Final processed video response
   */
  async processVideoWithSubtitles(
    file: File,
    subtitles: SubtitleSegment[],
    style?: SubtitleStyle,
    onUploadProgress?: (progress: number) => void
  ): Promise<{ uploadResponse: VideoUploadResponse; subtitleResponse: SubtitlesResponse }> {
    // Upload video first
    const uploadResponse = await this.uploadVideo(file, onUploadProgress);

    // Add subtitles
    const subtitleResponse = await this.addSubtitles({
      file_id: uploadResponse.file_id,
      subtitles,
      style,
    });

    return { uploadResponse, subtitleResponse };
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

let videoApiInstance: VideoApiService | null = null;

export function getVideoApi(): VideoApiService {
  if (!videoApiInstance) {
    videoApiInstance = new VideoApiService();
  }
  return videoApiInstance;
}

// Default export
const videoApi = getVideoApi();
export default videoApi;