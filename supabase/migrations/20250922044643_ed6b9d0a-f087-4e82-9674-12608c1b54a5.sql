-- Fix security issue: Restrict SELECT access to user's own goals only
DROP POLICY IF EXISTS "Anyone can view business goals" ON public.business_goals;

-- Create new policy that only allows users to see their own goals
CREATE POLICY "Users can view their own goals" 
ON public.business_goals 
FOR SELECT 
USING (session_id = ((current_setting('request.headers'::text, true))::json ->> 'x-session-id'::text));