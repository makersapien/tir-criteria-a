import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  studentId: string;
  experiment: string;
  sessionCode: string | null;
  strandhoot: string;
  currentStrand: number;
  content: string;
  evaluatedLevel?: number;
  isTyping?: boolean;
  onLoad?: (html: string) => void;
};

export function useStrandSync({
  studentId,
  experiment,
  sessionCode,
  strandhoot,
  currentStrand,
  content,
  evaluatedLevel,
  isTyping = false,
  onLoad,
}: Props) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const strandKey = `strand${currentStrand}`;
  const levelKey = `${strandKey}_level`;

  const isValidUUID = (uuid: string) => /^[0-9a-fA-F-]{36}$/.test(uuid);

  useEffect(() => {
    if (!studentId || !experiment || !sessionCode) return;
    if (!isValidUUID(studentId)) {
      console.warn('❌ Invalid UUID for studentId in fetch:', studentId);
      return;
    }

    const fetchSaved = async () => {
      const { data, error } = await supabase
        .from('responses')
        .select(`${strandKey}`)
        .eq('student_id', studentId)
        .eq('experiment', experiment)
        .eq('session_code', sessionCode)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading saved content:', error);
        setSyncStatus('error');
      } else if (data && data[strandKey]) {
        onLoad?.(data[strandKey]);
      }
    };

    fetchSaved();
  }, [studentId, experiment, sessionCode, strandhoot, currentStrand]);

  useEffect(() => {
    if (!studentId || !experiment || !sessionCode) return;
    if (!isValidUUID(studentId)) {
      console.warn('❌ Invalid UUID for studentId in typing:', studentId);
      return;
    }
  
    let resetTimer: NodeJS.Timeout | null = null;
    let lastTypedAt = Date.now();
  
    // ✅ 1. Send `is_typing: true`
    if (isTyping) {
      lastTypedAt = Date.now();
      console.log('✍️ Typing detected → setting is_typing true');
  
      supabase
        .from('responses')
        .update({ is_typing: true })
        .eq('student_id', studentId)
        .eq('experiment', experiment)
        .eq('session_code', sessionCode);
  
      // ✅ 2. Setup smart reset if no new typing within 3s
      resetTimer = setInterval(() => {
        const now = Date.now();
        const secondsSinceLastType = (now - lastTypedAt) / 1000;
  
        if (secondsSinceLastType >= 3) {
          console.log('🌀 Typing stopped → setting is_typing false');
  
          supabase
            .from('responses')
            .update({ is_typing: false })
            .eq('student_id', studentId)
            .eq('experiment', experiment)
            .eq('session_code', sessionCode);
  
          clearInterval(resetTimer!);
        }
      }, 1000);
    }
  
    return () => {
      if (resetTimer) clearInterval(resetTimer);
    };
  }, [isTyping, studentId, experiment, sessionCode]);
  
  return { syncStatus };
}
