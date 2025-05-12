// src/hooks/useStrandSync.ts
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface UseStrandSyncParams {
  studentId: string;
  experiment: 'distance' | 'magnets';
  currentStrand: number;
  content: string;
  onLoad: (loaded: string) => void;
  onSave?: (status: 'saving' | 'saved' | 'error') => void;
}

export function useStrandSync({
  studentId,
  experiment,
  currentStrand,
  content,
  onLoad,
  onSave,
}: UseStrandSyncParams) {
  const strandKey = `strand${currentStrand}` as
    | 'strand1'
    | 'strand2'
    | 'strand3'
    | 'strand4'
    | 'strand5';

  // 1. Load once on mount
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('responses')
        .select(
          'strand1, strand2, strand3, strand4, strand5'
        )
        .eq('student_id', studentId)
        .eq('experiment', experiment)
        .maybeSingle();

      if (error) {
        console.warn('[useStrandSync] Fetch error:', error.message);
        return;
      }

      if (data && data[strandKey]) {
        onLoad(data[strandKey] || '');
      }
    };

    load();
  }, [studentId, experiment, currentStrand]);

  // 2. Save on change (debounced)
  useEffect(() => {
    if (!content.trim()) return;
    const timeout = setTimeout(async () => {
      if (onSave) onSave('saving');
      const { error } = await supabase
        .from('responses')
        .upsert(
          {
            student_id: studentId,
            experiment,
            [strandKey]: content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'student_id,experiment' }
        );

      if (onSave) onSave(error ? 'error' : 'saved');
      if (error) console.error('[useStrandSync] Save error:', error.message);
    }, 800);

    return () => clearTimeout(timeout);
  }, [content, studentId, experiment, currentStrand]);
}
