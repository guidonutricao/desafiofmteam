-- Improved version of start_user_challenge function with better error handling
CREATE OR REPLACE FUNCTION public.start_user_challenge(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_exists BOOLEAN;
  already_started BOOLEAN;
  result JSON;
BEGIN
  -- Check if user profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE user_id = user_id_param
  ) INTO profile_exists;
  
  IF NOT profile_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'User profile not found'
    );
  END IF;
  
  -- Check if challenge is already started
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_id_param 
    AND challenge_start_date IS NOT NULL
  ) INTO already_started;
  
  IF already_started THEN
    RETURN json_build_object(
      'success', false,
      'error', 'CHALLENGE_ALREADY_STARTED',
      'message', 'Challenge has already been started for this user'
    );
  END IF;
  
  -- Update the user's profile to set challenge start date
  UPDATE public.profiles 
  SET 
    challenge_start_date = NOW(),
    challenge_completed_at = NULL,
    updated_at = NOW()
  WHERE user_id = user_id_param;
  
  -- Verify the update was successful
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UPDATE_FAILED',
      'message', 'Failed to update user profile'
    );
  END IF;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Challenge started successfully',
    'challenge_start_date', (
      SELECT challenge_start_date FROM public.profiles WHERE user_id = user_id_param
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UNEXPECTED_ERROR',
      'message', SQLERRM,
      'sqlstate', SQLSTATE
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.start_user_challenge(UUID) TO authenticated;