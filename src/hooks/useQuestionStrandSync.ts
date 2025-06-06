// src/hooks/useQuestionStrandSync.ts - Specialized sync for question responses
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { QuestionResponse } from '../types/questionBlock';

type Props = {
  studentId: string;
  experiment: string;
  sessionCode: string | null;
  strandhoot: string;
  currentStrand: number;
};

export function useQuestionStrandSync({
  studentId,
  experiment,
  sessionCode,
  strandhoot,
  currentStrand,
}: Props) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const isValidUUID = (uuid: string) => /^[0-9a-fA-F-]{36}$/.test(uuid);

  // 💾 Save individual question response
  const saveResponse = async (response: QuestionResponse): Promise<void> => {
    if (!studentId || !experiment || !sessionCode) {
      console.warn('❌ Missing required parameters for saving response');
      return;
    }

    if (!isValidUUID(studentId)) {
      console.warn('❌ Invalid UUID for studentId:', studentId);
      return;
    }

    setSyncStatus('saving');

    try {
      // Save to question_responses table
      const { error: responseError } = await supabase
        .from('question_responses')
        .upsert({
          student_id: studentId,
          session_code: sessionCode,
          experiment,
          strandhoot,
          strand: currentStrand,
          question_id: response.questionId,
          question_type: response.type,
          answer: response.answer,
          is_correct: response.isCorrect,
          score: response.score,
          feedback: response.feedback,
          timestamp: response.timestamp.toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'student_id,session_code,experiment,question_id'
        });

      if (responseError) {
        throw new Error(`Response save error: ${responseError.message}`);
      }

      // Also update the main responses table with strand progress
      const strandKey = `strand${currentStrand}`;
      const strandProgressKey = `${strandKey}_progress`;
      
      // Calculate strand progress based on question responses
      const { data: allResponses, error: fetchError } = await supabase
        .from('question_responses')
        .select('score, question_id')
        .eq('student_id', studentId)
        .eq('session_code', sessionCode)
        .eq('experiment', experiment)
        .eq('strand', currentStrand);

      if (fetchError) {
        console.warn('Could not fetch responses for progress calculation:', fetchError.message);
      } else if (allResponses) {
        // Calculate average score for this strand
        const totalScore = allResponses.reduce((sum, resp) => sum + (resp.score || 0), 0);
        const averageScore = allResponses.length > 0 ? totalScore / allResponses.length : 0;
        const strandLevel = Math.round(averageScore * 8); // Convert to 0-8 scale

        // Update main responses table
        const { error: mainUpdateError } = await supabase
          .from('responses')
          .upsert({
            student_id: studentId,
            session_code: sessionCode,
            experiment,
            [strandProgressKey]: strandLevel,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'student_id,session_code,experiment'
          });

        if (mainUpdateError) {
          console.warn('Could not update main responses table:', mainUpdateError.message);
        }
      }

      setSyncStatus('success');
      console.log('✅ Question response saved successfully');

    } catch (error) {
      console.error('💥 Error saving question response:', error);
      setSyncStatus('error');
    }
  };

  // 📥 Load all responses for current strand
  const loadResponses = async (): Promise<Record<string, QuestionResponse>> => {
    if (!studentId || !experiment || !sessionCode) {
      return {};
    }

    if (!isValidUUID(studentId)) {
      console.warn('❌ Invalid UUID for studentId in load:', studentId);
      return {};
    }

    try {
      const { data, error } = await supabase
        .from('question_responses')
        .select('*')
        .eq('student_id', studentId)
        .eq('session_code', sessionCode)
        .eq('experiment', experiment)
        .eq('strand', currentStrand);

      if (error) {
        throw new Error(`Load error: ${error.message}`);
      }

      const responses: Record<string, QuestionResponse> = {};
      
      if (data) {
        data.forEach(row => {
          responses[row.question_id] = {
            questionId: row.question_id,
            type: row.question_type,
            answer: row.answer,
            isCorrect: row.is_correct,
            score: row.score,
            feedback: row.feedback,
            timestamp: new Date(row.timestamp),
          };
        });
      }

      console.log(`📥 Loaded ${Object.keys(responses).length} responses for strand ${currentStrand}`);
      return responses;

    } catch (error) {
      console.error('💥 Error loading question responses:', error);
      return {};
    }
  };

  // 📊 Get progress summary for all strands
  const getProgressSummary = async (): Promise<Record<number, { level: number; completed: number; total: number }>> => {
    if (!studentId || !experiment || !sessionCode) {
      return {};
    }

    if (!isValidUUID(studentId)) {
      return {};
    }

    try {
      const { data, error } = await supabase
        .from('question_responses')
        .select('strand, score, is_correct')
        .eq('student_id', studentId)
        .eq('session_code', sessionCode)
        .eq('experiment', experiment);

      if (error) {
        throw new Error(`Progress summary error: ${error.message}`);
      }

      const summary: Record<number, { level: number; completed: number; total: number }> = {};

      if (data) {
        // Group by strand
        const byStrand = data.reduce((acc, response) => {
          if (!acc[response.strand]) {
            acc[response.strand] = [];
          }
          acc[response.strand].push(response);
          return acc;
        }, {} as Record<number, typeof data>);

        // Calculate progress for each strand
        Object.entries(byStrand).forEach(([strandStr, responses]) => {
          const strand = parseInt(strandStr);
          const completed = responses.length;
          const totalScore = responses.reduce((sum, resp) => sum + (resp.score || 0), 0);
          const averageScore = completed > 0 ? totalScore / completed : 0;
          const level = Math.round(averageScore * 8);

          summary[strand] = {
            level,
            completed,
            total: 12, // Assuming 12 questions per strand (3 per level x 4 levels)
          };
        });
      }

      return summary;

    } catch (error) {
      console.error('💥 Error getting progress summary:', error);
      return {};
    }
  };

  // 🧹 Clear all responses for current strand (for testing/reset)
  const clearStrandResponses = async (): Promise<void> => {
    if (!studentId || !experiment || !sessionCode) {
      return;
    }

    if (!isValidUUID(studentId)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('question_responses')
        .delete()
        .eq('student_id', studentId)
        .eq('session_code', sessionCode)
        .eq('experiment', experiment)
        .eq('strand', currentStrand);

      if (error) {
        throw new Error(`Clear error: ${error.message}`);
      }

      console.log(`🧹 Cleared all responses for strand ${currentStrand}`);

    } catch (error) {
      console.error('💥 Error clearing responses:', error);
    }
  };

  // 🔄 Auto-reset sync status after success/error
  useEffect(() => {
    if (syncStatus === 'success' || syncStatus === 'error') {
      const timer = setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  return {
    syncStatus,
    saveResponse,
    loadResponses,
    getProgressSummary,
    clearStrandResponses,
  };
}