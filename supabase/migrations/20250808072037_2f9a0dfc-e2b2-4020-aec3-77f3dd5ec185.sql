-- Fix the stuck training session
UPDATE ai_training_sessions 
SET 
    status = 'failed',
    completed_at = now(),
    error_message = 'Training timed out - processed 22/40 items before timeout',
    progress = 100
WHERE id = '0792bf18-8a77-4704-b6e8-29177d00d905' 
AND status = 'processing';