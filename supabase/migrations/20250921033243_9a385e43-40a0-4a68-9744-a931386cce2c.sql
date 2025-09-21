-- Create table for business goals announcements
CREATE TABLE public.business_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_name TEXT NOT NULL,
  goal_text TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can view all goals)
CREATE POLICY "Anyone can view business goals" 
ON public.business_goals 
FOR SELECT 
USING (true);

-- Create policy for inserting (anyone can add goals)
CREATE POLICY "Anyone can create business goals" 
ON public.business_goals 
FOR INSERT 
WITH CHECK (true);

-- Create policy for deleting (only owner can delete their goals)
CREATE POLICY "Users can delete their own goals" 
ON public.business_goals 
FOR DELETE 
USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- Create index for better performance
CREATE INDEX idx_business_goals_session_id ON public.business_goals(session_id);
CREATE INDEX idx_business_goals_created_at ON public.business_goals(created_at DESC);