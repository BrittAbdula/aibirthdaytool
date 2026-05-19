import { extractSvgFromResponse } from './utils';

export interface DailyStatsPreviewInput {
  isError: boolean;
  status?: string | null;
  errorMessage?: string | null;
  r2Url?: string | null;
  responseContent?: string | null;
}

export type DailyStatsPreview =
  | {
      kind: 'image';
      src: string;
    }
  | {
      kind: 'video';
      src: string;
    }
  | {
      kind: 'none';
      label: string;
      detail: string;
    };

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm', 'ogg'];

export function isPreviewVideoUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return VIDEO_EXTENSIONS.some((extension) => pathname.endsWith(`.${extension}`));
  } catch {
    const withoutQuery = url.split(/[?#]/)[0]?.toLowerCase() || '';
    return VIDEO_EXTENSIONS.some((extension) => withoutQuery.endsWith(`.${extension}`));
  }
}

export function getDailyStatsPreview(detail: DailyStatsPreviewInput): DailyStatsPreview {
  const status = detail.status?.toLowerCase();

  if (detail.isError || status === 'failed') {
    return {
      kind: 'none',
      label: 'Failed',
      detail: detail.errorMessage?.trim() || 'Generation failed before a preview was available.',
    };
  }

  if ((status === 'pending' || status === 'processing') && !detail.r2Url && !detail.responseContent) {
    return {
      kind: 'none',
      label: status === 'processing' ? 'Processing' : 'Pending',
      detail: 'Generation has not produced a preview yet.',
    };
  }

  const r2Url = detail.r2Url?.trim();
  if (r2Url) {
    return {
      kind: isPreviewVideoUrl(r2Url) ? 'video' : 'image',
      src: r2Url,
    };
  }

  const responseContent = detail.responseContent?.trim();
  if (responseContent) {
    if (responseContent.startsWith('data:image/')) {
      return {
        kind: 'image',
        src: responseContent,
      };
    }

    const svgContent = extractSvgFromResponse(responseContent);
    if (svgContent) {
      return {
        kind: 'image',
        src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`,
      };
    }
  }

  return {
    kind: 'none',
    label: 'No preview',
    detail: 'No image, video, or SVG content was stored for this record.',
  };
}
