-- Make goals publicly viewable again
DROP POLICY IF EXISTS "Users can view their own goals" ON public.business_goals;

-- Create new policy that allows anyone to view all goals
CREATE POLICY "Anyone can view business goals" 
ON public.business_goals 
FOR SELECT 
USING (true);