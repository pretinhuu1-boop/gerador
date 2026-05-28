import React from 'react';
import type { SpZoneId } from '../../../data/spLiveMap';
import type { ProjectionOpts } from '../../../data/spLiveMap';
import { ZoneLayer } from '../ZoneLayer';

// Phase B wrapper around the existing ZoneLayer. The legacy component
// already carries the objectBoundingBox pattern fix from commit
// 8fbe848 — re-exporting it under the layers/ namespace keeps the
// MapaCidade shell consistent without forking the impl twice. Phase
// E inlines this into the unified component and deletes ../ZoneLayer.
type Props = {
  projection: ProjectionOpts;
  activeZoneId?: SpZoneId;
  ownershipByZone?: Partial<Record<SpZoneId, number>>;
  onSelectZone?: (zoneId: SpZoneId) => void;
};

export const ZonesLayer: React.FC<Props> = (props) => <ZoneLayer {...props} />;
