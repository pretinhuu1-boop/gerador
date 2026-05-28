import React from 'react';
import { PhotoUpload } from '../../PhotoUpload';
import type { PhotoInput } from '../../../services/crewService';

type Photo = PhotoInput & { previewUrl: string };

type Props = {
  photo: Photo | null;
  onChange: (next: Photo | null) => void;
};

export const FotoTab: React.FC<Props> = ({ photo, onChange }) => (
  <section
    id="creator-panel-foto"
    role="tabpanel"
    aria-labelledby="creator-tab-foto"
    className="runner-tab__section"
  >
    <PhotoUpload photo={photo} onChange={onChange} />
  </section>
);
