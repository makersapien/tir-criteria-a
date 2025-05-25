import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  studentId: string;
  experiment: string;
  sessionCode: string | null;
  strandhoot: string;
  currentStrand: number;
  content: string;
  evaluatedLevel?: number; // ✅ NEW
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
  onLoad,
}: Props) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'typing'>('idle');


  const isValidUuid = (uuid: string) => /^[0-9a-fA-F-]{36}$/.test(uuid);

  useEffect(() => {
    if (!isValidUuid(studentId)) {
      console.warn('❌ Invalid studentId UUID format:', studentId);
      return;
    }

    const fetchSaved = async () => {
      const strandKey = `strand${currentStrand}`;
      const { data, error } = await supabase
        .from('responses')
        .select(`${strandKey}`)
        .eq('student_id', studentId)
        .eq('experiment', experiment)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading saved content:', error);
        setSyncStatus('error');
      } else if (data && data[strandKey]) {
        onLoad?.(data[strandKey]);
      }
    };

    fetchSaved();
  }, [studentId, experiment, currentStrand]);

  useEffect(() => {
    if (!isValidUuid(studentId)) return;

    const timer = setTimeout(async () => {
      
      const strandKey = `strand${currentStrand}`;
      const levelKey = `${strandKey}_level`;
      const { error } = await supabase.from('responses').upsert({
        student_id: studentId,
        experiment,
        session_code: sessionCode,
        [strandKey]: content,
        [levelKey]: evaluatedLevel ?? null, 
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,session_code,experiment' } // ✅ Correct

    
    );

      if (error) {
        console.error('💥 Error saving to Supabase:', error.message);
        setSyncStatus('error');
      } else {
        setSyncStatus('success');
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      setSyncStatus('saving');
    };
  }, [content, studentId, experiment, currentStrand]);

  return { syncStatus };
}
