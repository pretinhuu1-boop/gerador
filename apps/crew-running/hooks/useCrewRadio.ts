import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCrewRadio, postCrewRadio, pruneCrewRadio } from '../services/storage';
import {
  CREW_RADIO_TTL_MS,
  sanitizeRadioText,
  type CrewRadioMessage,
} from '../data/crewRadio';

export type UseCrewRadioOptions = {
  crewSlug?: string;
  selfUserId: string;
  selfRunnerName?: string;
  version?: number;
};

export const useCrewRadio = (options: UseCrewRadioOptions): {
  messages: CrewRadioMessage[];
  post: (text: string) => CrewRadioMessage | null;
} => {
  const { crewSlug, selfUserId, selfRunnerName, version = 0 } = options;
  const [tick, setTick] = useState(0);
  const [messages, setMessages] = useState<CrewRadioMessage[]>(() => getCrewRadio(crewSlug));

  useEffect(() => {
    pruneCrewRadio();
    setMessages(getCrewRadio(crewSlug));
  }, [crewSlug, version, tick]);

  useEffect(() => {
    if (!crewSlug) return;
    const id = window.setInterval(() => {
      pruneCrewRadio();
      setTick((t) => t + 1);
    }, 60 * 1000);
    return () => window.clearInterval(id);
  }, [crewSlug]);

  const post = useCallback(
    (rawText: string): CrewRadioMessage | null => {
      if (!crewSlug) return null;
      const text = sanitizeRadioText(rawText);
      if (!text) return null;
      const now = Date.now();
      const msg = postCrewRadio({
        authorUserId: selfUserId,
        authorName: selfRunnerName || 'Runner',
        crewSlug,
        text,
        postedAt: now,
        expiresAt: now + CREW_RADIO_TTL_MS,
      });
      setTick((t) => t + 1);
      return msg;
    },
    [crewSlug, selfUserId, selfRunnerName],
  );

  return useMemo(() => ({ messages, post }), [messages, post]);
};
