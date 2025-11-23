// types.ts
// Populating this file with all necessary type definitions for the application.

// General types
export type CreationMode = 'image' | 'video' | 'tools';

export interface ImageFile {
  name: string;
  type: string;
  size: number;
  base64: string;
  preview: string;
}

export interface AudioFile {
  name: string;
  type: string;
  size: number;
  base64: string;
}

// Scanning and DNA
export interface ScanProfile {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface CreativeDNA {
  style: string;
  palette: string[];
  texture: string;
  emotion: string;
  lighting: string;
  keywords: string[];
}

export type Emotion = 'vibrant' | 'introspective' | 'aggressive' | 'romantic' | 'nostalgic' | 'dreamy' | 'powerful';


// --- Image Studio: Flyer Creator ---

export interface Artist {
    id: string;
    name: string;
    logo: ImageFile | null;
    photos: ImageFile[];
    logoScanProfile?: ScanProfile | null;
    photoScanProfiles?: (ScanProfile | null)[];
}

export interface BusinessProfile {
    id: string;
    name: string; // Company Name
    logo: ImageFile | null;
    productPhotos: ImageFile[]; // Re-used for Brand Identity in business cards
    logoScanProfile?: ScanProfile | null;
    productPhotoScanProfiles?: (ScanProfile | null)[];
    
    // New fields for business card
    personName?: string;
    personTitle?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
}

export type LayoutTemplate = 
  | 'single_artist_centered' | 'artists_side_by_side' | 'split_vertical' 
  | 'info_block_bottom' | 'three_artists_grid' | 'overlay_panel'
  | 'split_diagonal' | 'photo_collage' | 'text_as_graphic'
  | 'framed_content' | 'vertical_list_agenda' | 'full_bleed_typography';

export type TextHierarchy = 'artist_name' | 'event_name' | 'title' | 'call_to_action';

export type TypographyStyle =
  | 'modern' | 'urban' | 'elegant' | 'bold' | 'script'
  | 'digital_pixel' | 'classic_serif' | 'geometric_sans' | 'street_tagging'
  | 'luxury_fashion_script' | 'playful_rounded' | 'outline_wireframe'
  | 'stamped_distressed' | 'graffiti_bubble' | 'graffiti_wildstyle'
  | 'handwritten_marker';
  
export type PostProductionStyle = 'clean' | 'graphic' | 'retro' | 'digital_glitch' | 'digital_illustration' | 'corporate_clean';
export type ColorGrade = 'none' | 'neon_urban' | 'warm_sepia' | 'bw_contrast' | 'duotone_vibrant' | 'teal_orange' | 'desaturated_moody';
export type TextureOverlay = 
  | 'none' | 'paper' | 'noise' | 'dust' | 'neon_lines' | 'geometric'
  | 'film_grain' | 'wood_grain' | 'frosted_glass_plastic' 
  | 'concrete_urban_wall' | 'brushed_metal' | 'laser_beams' | 'digital_glitch';

export type CompositionGuideline = 'none' | 'diagonal_composition' | 'scene_framing' | 'negative_space' | 'leading_lines_perspective';
export type ColorScheme = 'default' | 'vibrant_gradient' | 'monochromatic' | 'triadic_complementary';
export type LightingStyle = 'default' | 'soft_light' | 'hard_light' | 'volumetric_light' | 'strobe_lights' | 'laser_grid';
export type GraphicElement = 'repeating_text_pattern' | 'abstract_organic_shapes' | 'paint_splashes_drips' | 'geometric_patterns' | 'typography_as_texture';
export type CardMaterial = 'matte' | 'glossy' | 'textured' | 'black_card';
export type CardFinishing = 'none' | 'gold_foil' | 'silver_foil' | 'emboss' | 'spot_uv';
export type CardBorderStyle = 'none' | 'thin_line' | 'colored_edges' | 'geometric_lines' | 'rounded_corners';

export interface FormData {
    creationMode: CreationMode;
    flyerType: 'artist_agenda' | 'event' | 'business_promo' | 'contrate' | 'business_card';
    artistProfiles: Artist[];
    businessProfile: BusinessProfile | null;
    referencePhotos: ImageFile[];
    referencePhotoScanProfiles: (ScanProfile | null)[];
    creativePrompt: string;
    eventDates: string;
    influenceOptions: string[];
    identityFidelity: number;
    clothingFidelity: number;
    typographyStyle: TypographyStyle;
    textHierarchy: TextHierarchy;
    layout: LayoutTemplate;
    emotion: Emotion;
    aspectRatio: '1:1' | '9:16' | '16:9';
    postProductionStyle: PostProductionStyle;
    colorGrade: ColorGrade;
    textureOverlay: TextureOverlay;
    primaryColor: string;
    secondaryColor: string;
    usePresetPalette: boolean;
    compositionGuideline: CompositionGuideline;
    colorScheme: ColorScheme;
    lightingStyle: LightingStyle;
    graphicElements: GraphicElement[];
    cardMaterial?: CardMaterial;
    cardFinishing?: CardFinishing;
    cardBorderStyle?: CardBorderStyle;
}

// --- Image Studio: General ---
export type ImageStudioMode = 'flyer' | 'telao' | 'editorial' | 'decupagem';

// --- Image Studio: Telao Creator ---
export type ArtistType = 'DJ' | 'Cantor' | 'Dupla' | 'Instrumentista';
export type TelaoStageStylePreset = 'neon_minimalist' | 'cinematic_drama' | 'bw_contrast' | 'ethereal_dream' | 'vibrant_texture' | 'retro_future' | 'rock_classic_bw' | 'geometric_tunnel';

export interface TelaoFormData {
    artistName: string;
    artistType: ArtistType;
    artistLogo: ImageFile | null;
    artistPhoto: ImageFile | null;
    artistPhotoScanProfile?: ScanProfile | null;
    artistLogoScanProfile?: ScanProfile | null;
    primaryColor: string;
    secondaryColor: string;
    creativePrompt: string;
    typographyStyle: TypographyStyle;
    textureOverlay: TextureOverlay;
    compositionGuideline: CompositionGuideline;
    lightingStyle: LightingStyle;
    graphicElements: GraphicElement[];
    finalPrompt: string;
    stageStylePreset: TelaoStageStylePreset;
}

// --- Image Studio: Editorial Studio ---
export interface EditorialPreset {
  id: string;
  name: string;
  description: string;
  promptBase: string;
  filterClass: string;
  shadowClass: string;
}
export interface ProductPreset extends EditorialPreset {}
export interface CustomEditorialPreset {
  id: string;
  name: string;
  settings: {
    mode: 'editorial' | 'product';
    selectedPresetId: string;
    selectedBackgroundId: string;
    customPrompt: string;
    aspectRatio: '1:1' | '3:4' | '16:9';
  };
}

// --- Image Studio: Decupagem Studio ---
export interface SibOutput {
    intentJson: any; // Can be parsed JSON object
    guiaSemantico: string;
    cenasPreparadas: string;
}

export interface DecoupageEngineOutput {
    technicalDecupage: string;
    frameDescriptions: {
        frame_1: string;
        frame_2: string;
        frame_3: string;
    };
    framesSuperPrompt: string;
    structuralJson: any; // Can be parsed JSON object
}

export interface DecupagemShot {
    id: string;
    plan: string;
    action: string;
    duration?: string;
    lens?: string;
    fullDescription: string;

    // --- Decoupage Engine Output ---
    technicalDecupage?: string;
    frameDescriptions?: {
        frame_1: string;
        frame_2: string;
        frame_3: string;
    };
    framesSuperPrompt?: string;
    structuralJson?: any; // Stored as parsed object
    frameImageUrls?: string[]; // Array to hold 3 image URLs

    isLoading: boolean;
    veoPrompt?: string;
    isGeneratingVeoPrompt?: boolean;
    videoUrl?: string;
    isGeneratingVideo?: boolean;
}

export interface DecupagemScene {
    id: string;
    sceneNumber: number;
    title: string;
    location: string;
    emotion: string;
    lighting: string;
    textures: string;
    props: string;
    shots: DecupagemShot[];
}

export interface DecupagemFormData {
    script: string;
    actor1Name: string;
    actor1Photos: ImageFile[];
    actor2Name: string;
    actor2Photos: ImageFile[];
    actor3Name: string;
    actor3Photos: ImageFile[];
    aestheticPreset: string;
    aspectRatio: '16:9' | '9:16';
    bRollCategoryIds: string[];
}


// --- Video Studio: General ---
export type VideoStudioMode = 'compositor' | 'dna_extractor' | 'art_director' | 'visualizer_engine' | 'motion_designer' | 'production_pipeline' | 'intelligent_pipeline' | 'b_roll_library' | 'cinema';
export type VideoAspectRatio = '16:9' | '9:16';
export type VideoResolution = '720p' | '1080p';

export interface Scene {
    id: string;
    description: string;
}

export interface VideoFormData {
    artistName: string;
    artistLogo: ImageFile | null;
    referencePhotos: ImageFile[];
    masterFrame: ImageFile | null;
    motionEvents: Scene[];
    finalScript: string;
    cameraBehavior: string;
    atmosphere: string;
    transition: string;
    aspectRatio: VideoAspectRatio;
    resolution: VideoResolution;
    useFaceLock: boolean;
    endFrame: ImageFile | null;
}

// --- Video Studio: Telao Compositor ---
export type TelaoSceneCategory = 'stage_energy' | 'typography_pulse' | 'visual_burst' | 'artist_loop' | 'mood_loop' | 'abstract_geometry' | 'story_pulse' | 'logo_motion';
export type TelaoLightingStyle = 'neon_lateral' | 'backlight_difuso' | 'strobe_suave' | 'luz_volumetrica' | 'gradiente_giratorio';
export type TelaoStylePreset = 'neon_urban' | 'trap_tech' | 'bass_orange' | 'romantic_pink' | 'futuristic_metal' | 'urban_glitch_reveal';
export type TelaoDuration = 8 | 16 | 30;

export interface TelaoCompositorFormData {
    artistName: string;
    artistLogo: ImageFile | null;
    artistLogoScanProfile: ScanProfile | null;
    artistPhoto: ImageFile | null;
    artistPhotoScanProfile: ScanProfile | null;
    audioFile: AudioFile | null;
    creativePrompt: string;
    sceneCategory: TelaoSceneCategory;
    lightingStyle: TelaoLightingStyle;
    stylePreset: TelaoStylePreset;
    duration: TelaoDuration;
    finalPrompt: string;
}

// --- Video Studio: Visualizer Engine ---
export type VisualizerStyle = 'neon_grid' | 'organic_liquid' | 'geometric_pulse' | 'vhs_glitch' | 'cinematic_particles';
export type VisualizerCoreElement = 'logo' | 'photo' | 'typography' | 'abstract';
export type VisualizerColorPalette = 'vibrant' | 'monochromatic' | 'pastel' | 'dark_mode';
export type VisualizerDuration = 8 | 15 | 30;
export type VisualizerTemplate = 'photo_loop_core' | 'logo_pulse' | 'dual_layer' | 'motion_frame' | 'abstract_reactive' | 'story_splash';

export interface VisualizerFormData {
    artistName: string;
    logo: ImageFile | null;
    photos: ImageFile[];
    audio: AudioFile | null;
    bpm: number;
    style: VisualizerStyle;
    coreElement: VisualizerCoreElement;
    colorPalette: VisualizerColorPalette;
    duration: VisualizerDuration;
    finalPrompt: string;
}

export interface VisualizerEngineFormData {
    artistName: string;
    logo: ImageFile | null;
    photos: ImageFile[];
    audio: AudioFile | null;
    bpm: number;
    template: VisualizerTemplate;
    primaryColor: string;
    secondaryColor: string;
    pulseIntensity: number;
    duration: 8 | 15 | 30;
    photoUsage: 'off' | 'foreground' | 'texture' | 'sequence';
    logoUsage: 'off' | 'center' | 'corner' | 'watermark';
    grain: 'off' | 'low' | 'high';
    glow: 'off' | 'low' | 'high';
}

export interface VisualizerEnginePreset {
  id: string;
  name: string;
  settings: VisualizerEngineFormData;
}

// --- Video Studio: Motion Designer ---
export type LoopSceneType = 
    | 'driving' | 'motorbike' | 'jetski' | 'singing' | 'dj' 
    | 'glasses' | 'smoking' | 'leaning' | 'street_corner' | 'breathing' | 'drone_shot'
    | 'motorcycle_wheelie' | 'floating_in_pool' | 'beach_fireworks' | 'summer_roadtrip' 
    | 'beach_volleyball' | 'boat_party';

export interface MotionDesignerFormData {
    artistPhoto: ImageFile | null;
    artistLogo: ImageFile | null;
    sceneType: LoopSceneType;
    duration: 4 | 6 | 8;
    aspectRatio: VideoAspectRatio;
    resolution: VideoResolution;
    creativePrompt: string;
    loopingInstructions: string;
}

// --- Video Studio: Production Pipeline ---
export interface VibePreset {
    id: string;
    name: string;
    description: string;
    settings: {
        culturalContext: string;
        narrativeTemplateId: string;
        noFaceLockMode: string;
    };
}

export interface SequencedShot {
    shot_number: number;
    description: string;
    duration_seconds: number;
}

// --- Video Studio: Cinema Studio ---
export interface CinemaGenre {
    id: string;
    name: string;
    description: string;
    pccCode?: string;
}

export interface FilmmakerFormData {
    scriptIdea: string;
    scriptText: string;
    genreId: string;
    castingPhotos: ImageFile[];
    locationPhotos: ImageFile[];
}

export interface GeneratedScene {
    id: string;
    shot_number: number;
    description: string;
    duration_seconds: number;
    master_frame_description: string;
    aux_frame_1_description: string;
    aux_frame_2_description: string;
    masterFrameUrl?: string;
    videoUrl?: string;
    isGeneratingMasterFrame: boolean;
    isGeneratingVideo: boolean;
    editPrompt: string;
}

// --- Tools Studio ---
export type ToolMode = 'generate' | 'edit' | 'inpaint' | 'resize' | 'analyze' | 'upscale' | 'copy_pose' | 'extract_style';
export type ImagenAspectRatio = '1:1' | '9:16' | '16:9' | '4:3' | '3:4';
export interface ExtractedStyleProfile {
  poseDescription: string;
  lightingDescription: string;
  styleDescription: string;
  compositionDescription: string;
  generatedPrompt: string;
}

// Extend window type for aistudio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}