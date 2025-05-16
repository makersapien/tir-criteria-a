import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useStrandContext } from '../contexts/StrandContext';
import { evaluateStrand } from '../utils/evaluateStrand';

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

  // 🧠 Load previously saved content
  useEffect(() => {
    const loadStrand = async () => {
      const { data, error } = await supabase
        .from('responses')
        .select(`${strandKey}, ${levelKey}`)
        .eq('student_id', studentId)
        .eq('experiment', experiment)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading saved content:', error);
        return;
      }

      const savedContent = data?.[strandKey];
      if (savedContent && onLoad) {
        onLoad(savedContent);
      }
    };

    if (studentId && experiment) {
      loadStrand();
    }
  }, [studentId, experiment, strandKey]);

  // 💾 Auto-save on content change
  useEffect(() => {
    if (!studentId || !experiment || !strandKey || !content) return;

    setSyncStatus('saving');

    const timeout = setTimeout(async () => {
      const { level } = await evaluateStrand(content, experiment as 'distance' | 'magnets', strandKey);

      const payload = {
        student_id: studentId,
        experiment,
        session_code: sessionCode ?? '', // ensure non-null
        strandhoot,
        [strandKey]: content,
        [levelKey]: level,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('responses')
        .upsert(payload, {
          onConflict: 'student_id,experiment',
        });

      if (error) {
        console.error('💥 Error saving to Supabase:', error.message);
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
