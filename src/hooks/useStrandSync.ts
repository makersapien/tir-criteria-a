import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useStrandContext } from '../contexts/StrandContext';
import { evaluateStrand } from '../utils/evaluateStrand'; // ✅ Make sure this exists

interface UseStrandSyncProps {
  studentId: string;
  experiment: string;
  sessionCode?: string | null;
  strandhoot: string;
  currentStrand: number;
  content: string;
  onLoad?: (content: string) => void;
  onSave?: (status: 'success' | 'error') => void;
}

export const useStrandSync = ({
  studentId,
  experiment,
  sessionCode = null,
  strandhoot,
  currentStrand,
  content,
  onLoad,
  onSave,
}: UseStrandSyncProps) => {
  const { userInputs } = useStrandContext();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const strandKey = `strand${currentStrand}`;
  const levelKey = `strand${currentStrand}_level`;

  // Load
  useEffect(() => {
    const loadStrand = async () => {
      const { data, error } = await supabase
        .from('responses')
        .select(`${strandKey}, ${levelKey}`)
        .eq('student_id', studentId)
        .eq('experiment', experiment)
        .eq('session_code', sessionCode)
        .eq('strandhoot', strandhoot)
        .maybeSingle();

      if (error) {
        console.error('Error loading saved content:', error);
        return;
      }

      const savedContent = data?.[strandKey];
      if (savedContent && onLoad) {
        onLoad(savedContent);
      }
    };

    if (studentId && experiment && strandhoot) {
      loadStrand();
    }
  }, [studentId, experiment, strandKey, sessionCode, strandhoot]);

  // Save
  useEffect(() => {
    setSyncStatus('saving');

    const timeout = setTimeout(async () => {
      // ✅ evaluate content for level
      const { level } = await evaluateStrand(content, experiment as 'distance' | 'magnets', strandKey);

      const { error } = await supabase
        .from('responses')
        .upsert(
          {
            student_id: studentId,
            experiment,
            session_code: sessionCode,
            strandhoot,
            [strandKey]: content,
            [levelKey]: level,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'student_id,experiment,session_code,strandhoot',
          }
        );

      if (error) {
        console.error('Error saving to Supabase:', error.message);
        setSyncStatus('error');
        onSave?.('error');
      } else {
        setSyncStatus('success');
        onSave?.('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [content, strandKey, levelKey, studentId, experiment, sessionCode, strandhoot]);

  return { syncStatus };
};
