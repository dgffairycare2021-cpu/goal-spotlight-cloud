-- Create a function to delete business goals with proper session validation
CREATE OR REPLACE FUNCTION public.delete_business_goal(
  goal_id uuid,
  user_session_id text
)
RETURNS boolean AS $$
BEGIN
  -- Delete the goal if it belongs to the user's session
  DELETE FROM public.business_goals 
  WHERE id = goal_id AND session_id = user_session_id;
  
  -- Return true if a row was deleted
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;