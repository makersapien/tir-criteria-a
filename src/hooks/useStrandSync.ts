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

  // 🔁 1. Load saved strand content
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

  // ✅ 2. Handle typing + debounce reset
  useEffect(() => {
    if (!studentId || !experiment || !sessionCode || !isTyping) return;
    if (!isValidUUID(studentId)) {
      console.warn('❌ Invalid UUID for studentId in typing:', studentId);
      return;
    }

    let lastTypedAt = Date.now();

    // 🔼 Set is_typing = true
    supabase
      .from('responses')
      .update({ is_typing: true })
      .eq('student_id', studentId)
      .eq('experiment', experiment)
      .eq('session_code', sessionCode)
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Error setting is_typing true:', error.message);
        } else {
          console.log('✍️ is_typing = true for', studentId);
        }
      });

    // 🔽 Reset after inactivity
    const reset = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTypedAt;

      if (delta >= 3000) {
        supabase
          .from('responses')
          .update({ is_typing: false })
          .eq('student_id', studentId)
          .eq('experiment', experiment)
          .eq('session_code', sessionCode)
          .select('*')
          .then(({ data, error }) => {
            if (error) {
              console.error('❌ Error resetting is_typing:', error.message);
            } else {
              console.log('🌀 is_typing reset to false for', studentId);
            }
          });

        clearInterval(reset);
      }
    }, 1000);

    return () => clearInterval(reset);
  }, [isTyping, studentId, experiment, sessionCode]);

  // 💾 3. Save content + level (debounced)
  useEffect(() => {
    if (!studentId || !experiment || !sessionCode) return;
    if (!isValidUUID(studentId)) {
      console.warn('❌ Invalid UUID for studentId in upsert:', studentId);
      return;
    }

    const timer = setTimeout(async () => {
      setSyncStatus('saving');

      const { error } = await supabase.from('responses').upsert(
        {
          student_id: studentId,
          experiment,
          session_code: sessionCode,
          [strandKey]: content,
          [levelKey]: evaluatedLevel ?? null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'student_id,session_code,experiment',
        }
      );

      if (error) {
        console.error('💥 Error saving to Supabase:', error.message);
        setSyncStatus('error');
      } else {
        setSyncStatus('success');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [content, studentId, experiment, sessionCode, strandhoot, currentStrand, evaluatedLevel]);

  return { syncStatus };
}
