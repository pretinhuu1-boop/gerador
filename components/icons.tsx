import React from 'react';

type SVGProps = React.SVGProps<SVGSVGElement>;

export const UploadIcon = (props: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

export const DownloadIcon = (props: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const PlayIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" {...props}>
        <path d="M8 5v14l11-7z" />
    </svg>
);

export const PauseIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" {...props}>
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);


export const EditIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

export const SparklesIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
    </svg>
);

export const VideoIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m22 8-6 4 6 4V8Z" />
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
);

export const FilmIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
);

export const ClapperboardIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20.2 6.8 22 8.6" />
        <path d="M18.6 5.2 20.4 7" />
        <path d="M2 12h20" />
        <path d="M4 4.5 12 11l8-6.5" />
        <path d="M4 4.5v15h16v-15" />
    </svg>
);

export const ImageIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    </svg>
);

export const GemIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M6 3h12l4 6-10 13L2 9z"/>
        <path d="M12 22V9"/>
        <path d="m3.5 8.5 17 0"/>
        <path d="m2 9 4-6"/>
        <path d="m22 9-4-6"/>
    </svg>
);

export const KeyIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m21 2-2 2-2.5 2.5-2 2-2.5 2.5-2 2L2 21"/>
        <path d="M14.5 7.5c.3-.3.6-.5.9-.6"/>
        <circle cx="7" cy="15" r="5"/>
    </svg>
);

export const PlusIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

export const TrashIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
);

export const LayersIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
    </svg>
);

export const GridIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <line x1="15" y1="3" x2="15" y2="21"/>
    </svg>
);

export const FrameIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="22" y1="6" x2="2" y2="6"/>
        <line x1="22" y1="18" x2="2" y2="18"/>
        <line x1="6" y1="2" x2="6" y2="22"/>
        <line x1="18" y1="2" x2="18" y2="22"/>
    </svg>
);

export const PaletteIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="13.5" cy="6.5" r="2.5"/>
        <circle cx="17.5" cy="10.5" r="2.5"/>
        <circle cx="8.5" cy="7.5" r="4.5"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.667 0-.424-.153-.812-.425-1.125-.272-.312-.425-.714-.425-1.125s.153-.812.425-1.125c.272-.312.425-.714.425-1.125s-.153-.812-.425-1.125c-.272-.312-.425-.714-.425-1.125C13.648 2.746 12.926 2 12 2z"/>
    </svg>
);

export const BookOpenIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
);

export const ChevronDownIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export const CheckCircleIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);

export const XCircleIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
);

export const WandIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15 4V2"/>
        <path d="M15 16v-2"/>
        <path d="M8 9h2"/>
        <path d="M20 9h2"/>
        <path d="M17.8 11.8 19 13"/>
        <path d="M15 9a3 3 0 0 0-3-3"/>
        <path d="M12 12a3 3 0 0 0-3 3"/>
        <path d="m3 21 9-9"/>
    </svg>
);

export const UserIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

export const SunIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m4.93 19.07 1.41-1.41"></path>
      <path d="m17.66 6.34 1.41-1.41"></path>
    </svg>
);

export const DropletIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>
    </svg>
);

export const CarIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 16.94V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1.1a2 2 0 0 1 .6-1.4L3 14h11"></path>
      <path d="M5 14h14v-4.5a2.5 2.5 0 0 0-2.5-2.5h-9A2.5 2.5 0 0 0 5 9.5V14Z"></path>
      <path d="M5 9.5V7a2 2 0 0 1 2-2h3"></path>
      <circle cx="7.5" cy="16.5" r=".5"></circle>
      <circle cx="15.5" cy="16.5" r=".5"></circle>
    </svg>
);

export const MapPinIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

export const PackageIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16.5 9.4 7.55 4.24"></path>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
);

export const CameraIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
      <circle cx="12" cy="13" r="3"></circle>
    </svg>
);

export const ZapIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

export const MessageSquareIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

export const CropIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2v14a2 2 0 0 0 2 2h14"></path>
      <path d="M18 22V8a2 2 0 0 0-2-2H2"></path>
    </svg>
);

export const SaveIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

export const CopyIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
    </svg>
);

export const RefreshCwIcon = (props: SVGProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const MotorcycleIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 10V7a2 2 0 0 1 2-2h3.5a2 2 0 0 1 2 2v2.5" />
        <path d="M12.5 6.5 16 6" />
        <path d="m14 10 5.4 0" />
        <path d="M12 14a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
        <path d="M14 21a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
        <path d="M10 14h.5" />
        <path d="M16.5 11.5 19 9" />
        <path d="M6.5 12.5 4 15" />
        <path d="m14 14 2.5 2.5" />
    </svg>
);

export const WavesIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 6c.7.5 1.5.8 2.5.8 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2" />
        <path d="M3 12c.7.5 1.5.8 2.5.8 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2" />
        <path d="M3 18c.7.5 1.5.8 2.5.8 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2" />
    </svg>
);

export const MicIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

export const HeadphonesIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 13.5a9 9 0 0 1 18 0" />
        <path d="M6 13a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3z" />
    </svg>
);

export const GlassesIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="6" cy="15" r="4" />
        <circle cx="18" cy="15" r="4" />
        <path d="M10 15h4" />
        <path d="M21 15a4 4 0 0 0-8 0" />
        <path d="M3 15a4 4 0 0 1 8 0" />
    </svg>
);

export const WindIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
        <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
        <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
);

export const BuildingIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M12 6h.01" />
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
        <path d="M16 10h.01" />
        <path d="M16 14h.01" />
        <path d="M8 10h.01" />
        <path d="M8 14h.01" />
    </svg>
);

export const DroneIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 18a6 6 0 0 0-6-6h-1a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3h1a6 6 0 0 0 6-6Z"/>
        <path d="M12 18a6 6 0 0 1 6-6h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1a6 6 0 0 1-6-6Z"/>
        <path d="M12 12a6 6 0 0 0-6 6"/>
        <path d="M12 12a6 6 0 0 1 6 6"/>
        <path d="M12 6a6 6 0 0 0-6-6h-1a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3h1a6 6 0 0 0 6-6Z"/>
        <path d="M12 6a6 6 0 0 1 6-6h1a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1a6 6 0 0 1-6-6Z"/>
    </svg>
);

export const BoatIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z" />
      <path d="M21 14 12 4 3 14h18Z" />
      <path d="M12 4V2" />
    </svg>
);

export const BodyScanIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 12h20"/>
        <path d="M12 2a10 10 0 0 1 10 10c0 3.5-1.8 6.6-4.5 8.3"/>
        <path d="M12 2a10 10 0 0 0-10 10c0 3.5 1.8 6.6 4.5 8.3"/>
        <path d="M12 4a8 8 0 0 1 8 8"/>
        <path d="M12 4a8 8 0 0 0-8 8"/>
        <path d="M12 12v10"/>
        <path d="M12 12a4 4 0 0 1 4 4"/>
        <path d="M12 12a4 4 0 0 0-4 4"/>
    </svg>
);

export const ChairIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 9v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/>
      <path d="M4 9h16"/>
      <path d="M12 9V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4"/>
      <path d="M14 19v-5"/>
      <path d="M10 19v-5"/>
    </svg>
);

export const SpotlightIcon = (props: SVGProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 12a6 6 0 0 0-6 6H4a8 8 0 0 1 8-8V2"/>
      <path d="M12 12a6 6 0 0 1 6 6h2a8 8 0 0 0-8-8V2"/>
      <path d="m6 18 1.5-3"/>
      <path d="m18 18-1.5-3"/>
    </svg>
);

export const PortraitIcon = (props: SVGProps) => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="12" cy="10" r="3"/>
      <path d="M17 17a5 5 0 0 0-10 0"/>
    </svg>
);
