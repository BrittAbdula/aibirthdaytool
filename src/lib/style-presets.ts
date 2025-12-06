// lib/style-presets.ts
// Frontend-only style preset catalog with cost tiers and sample images.
// Video is Premium only by product rule; presets indicate which formats they support.

export type OutputFormat = 'svg' | 'image' | 'video';

// Per product requirement:
// - For image/video generation, style uses a single prompt string (no positive/negative split)
// - For svg (animated), we keep a structured prompt for finer control
export interface StylePrompts {
  svg?: {
    positive: string;
    negative?: string;
    qualityTags?: string[];
  };
  image?: string; // single prompt for static image
  video?: string; // single prompt for video (if not provided, fallback to image)
}

export interface StylePreset {
  id: string;
  name: string;
  category: string; // e.g., Art, Design, Photo, 3D/Motion
  cost: 0 | 1 | 2 | 3 | 4 | 5 | 6; // points surcharge
  formats: OutputFormat[]; // supported formats
  prompts: StylePrompts; // prompt definitions per format
  sample?: string; // remote sample image URL (can be replaced later)
  recommendedFor?: string[]; // optional: cardType slugs where this preset shines
}

// Note on sample: using remote URLs so the client can load images without bundling assets.
// These can be replaced with local assets later.

export const stylePresets: StylePreset[] = [
  {
    id: 'watercolor_soft',
    name: 'Watercolor Soft',
    category: 'Art',
    cost: 0,
    formats: ['image', 'video'],
    prompts: {
      image: 'soft watercolor painting, gentle brush strokes, pastel palette, paper texture, subtle bloom',
      video: 'soft watercolor painting animation look, pastel palette, subtle bloom, gentle transitions, dreamy mood'
    },
    sample: '/images/style-presets/watercolor_soft.png',
    recommendedFor: ['birthday', 'anniversary', 'thank-you']
  },
  {
    id: 'minimalist_poster',
    name: 'Minimalist Poster',
    category: 'Design',
    cost: 1,
    formats: ['image', 'svg', 'video'],
    prompts: {
      svg: {
        positive: 'minimalist vector composition, bold typography, geometric shapes, smooth svg paths, clean layout',
        negative: 'raster textures, bitmap noise, photo realism'
      },
      image: 'minimalist composition, bold typography, large negative space, simple geometric shapes, clean layout',
      video: 'minimalist motion poster, bold typography, clean geometric motion, subtle easing, negative space'
    },
    sample: '/images/style-presets/minimalist_poster.png',
    recommendedFor: ['birthday', 'congratulations', 'graduation']
  },
  {
    id: 'cartoon_cute',
    name: 'Cartoon Cute',
    category: 'SVG Friendly',
    cost: 3,
    formats: ['svg', 'image', 'video'],
    prompts: {
      svg: {
        positive: 'cute cartoon vector illustration, thick outlines, flat colors, soft gradients, friendly characters, clean shapes',
        negative: 'photoreal shading, raster noise'
      },
      image: 'cute cartoon illustration, thick outlines, flat colors, soft gradients, friendly characters',
      video: 'cute cartoon motions, smooth easing, squash and stretch, playful transitions'
    },
    sample: '/images/style-presets/cartoon_cute.png',
    recommendedFor: ['birthday', 'baby', 'get-well']
  },
  {
    id: 'vintage_film',
    name: 'Vintage Film',
    category: 'Photo',
    cost: 3,
    formats: ['image', 'video'],
    prompts: {
      image: 'vintage film look, soft grain, faded tones, light leaks, nostalgic mood',
      video: 'vintage film transitions, soft grain overlay, light leaks, nostalgic motion'
    },
    sample: '/images/style-presets/vintage_film.png'
  },
  {
    id: 'paper_cut',
    name: 'Paper Cut',
    category: 'Design',
    cost: 3,
    formats: ['image', 'svg', 'video'],
    prompts: {
      svg: {
        positive: 'paper cut vector layers, clean paths, layered depth, soft drop shadows',
        negative: 'photoreal skin, bitmap noise'
      },
      image: 'paper cut craft, layered paper, soft shadows, handcrafted feel',
      video: 'layered paper motion, parallax depth, soft shadow animation'
    },
    sample: '/images/style-presets/paper_cut.png'
  },
  {
    id: 'pixel_art',
    name: 'Pixel Art',
    category: 'Design',
    cost: 3,
    formats: ['image', 'svg'],
    prompts: {
      svg: {
        positive: 'vectorized pixel grid look, crisp squares, limited palette, retro game vibe',
        negative: 'antialiased vector smoothing, complex gradients'
      },
      image: '8-bit pixel art, limited color palette, crisp pixels, retro game vibe'
    },
    sample: '/images/style-presets/pixel_art.png'
  },
  // {
  //   id: 'low_poly',
  //   name: 'Low Poly',
  //   category: 'Design',
  //   cost: 3,
  //   formats: ['image', 'video'],
  //   prompts: {
  //     image: 'low poly geometric, faceted shapes, sharp edges, stylized lighting',
  //     video: 'low poly motion, rotating facets, stylized lighting transitions'
  //   },
  //   sample: 'https://raw.githubusercontent.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts/main/assets/samples/low_poly.jpg'
  // },
  {
    id: 'line_art',
    name: 'Line Art',
    category: 'SVG Friendly',
    cost: 3,
    formats: ['svg', 'image'],
    prompts: {
      svg: {
        positive: 'clean vector line art, monochrome or two-tone, elegant strokes, minimal fill',
        negative: 'heavy texture, photoreal shading'
      },
      image: 'clean line art, monochrome or two-tone, elegant strokes, vector-friendly'
    },
    sample: '/images/style-presets/line_art.png'
  },
  // {
  //   id: 'clay_3d',
  //   name: 'Clay 3D',
  //   category: '3D/Motion',
  //   cost: 4,
  //   formats: ['image', 'video'],
  //   prompts: {
  //     image: 'soft clay render, subsurface scattering, studio lighting, playful shapes',
  //     video: 'soft clay motion, turntable animation, studio lighting changes'
  //   },
  //   sample: 'https://raw.githubusercontent.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts/main/assets/samples/clay_3d.jpg'
  // },
  // {
  //   id: 'neon_glow',
  //   name: 'Neon Glow',
  //   category: 'Design',
  //   cost: 3,
  //   formats: ['image', 'svg', 'video'],
  //   prompts: {
  //     svg: {
  //       positive: 'neon glow vector signs, clean bezier curves, dark background, vibrant gradients',
  //       negative: 'paper textures, bitmap noise'
  //     },
  //     image: 'neon glow signs, dark background, vibrant gradients, cyber aesthetics',
  //     video: 'neon glow motion, flicker effect, cyber transitions'
  //   },
  //   sample: 'https://raw.githubusercontent.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts/main/assets/samples/neon_glow.jpg'
  // },
  // {
  //   id: 'photoreal_portrait',
  //   name: 'Photoreal Portrait',
  //   category: 'Photo',
  //   cost: 6,
  //   formats: ['image', 'video'],
  //   prompts: {
  //     image: 'high-end portrait photography, soft key light, shallow depth of field, premium retouch',
  //     video: 'portrait motion, gentle camera move, soft focus transitions, premium look'
  //   },
  //   sample: 'https://raw.githubusercontent.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts/main/assets/samples/photoreal_portrait.jpg'
  // },
  // {
  //   id: 'vaporwave',
  //   name: 'Vaporwave',
  //   category: 'Design',
  //   cost: 3,
  //   formats: ['image', 'video'],
  //   prompts: {
  //     image: 'vaporwave aesthetics, retro 80s neon, greek bust, grid horizon, purple-pink palette',
  //     video: 'vaporwave motion, retro neon transitions, grid horizon parallax'
  //   },
  //   sample: 'https://raw.githubusercontent.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts/main/assets/samples/vaporwave.jpg'
  // },
  // {
  //   id: 'ink_sketch',
  //   name: 'Ink Sketch',
  //   category: 'Art',
  //   cost: 3,
  //   formats: ['svg', 'image'],
  //   prompts: {
  //     svg: {
  //       positive: 'ink pen vector sketch, hatching and cross-hatching, minimal shading, paper white background',
  //       negative: 'full color fill, photoreal rendering'
  //     },
  //     image: 'ink pen sketch, hatching, cross-hatching, minimal shading, paper white background'
  //   },
  //   sample: 'https://raw.githubusercontent.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts/main/assets/samples/ink_sketch.jpg'
  // }
];

export const getPresetsForFormat = (format: OutputFormat): StylePreset[] => {
  return stylePresets.filter(p => {
    if (!p.formats.includes(format)) return false;
    if (format === 'svg') return !!p.prompts.svg;
    if (format === 'video') return !!(p.prompts.video || p.prompts.image);
    // image
    return !!p.prompts.image;
  });
};
