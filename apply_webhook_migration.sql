-- Apply webhook integration migration
-- Run this script to enable webhook functionality for new user registrations

\echo 'Applying webhook integration migration...'

-- Enable http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http;

-- Create a function to send webhook data
CREATE OR REPLACE FUNCTION public.send_user_webhook(user_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url text := 'https://n8n.guidonutri.com/webhook/2f60b388-e1a4-4703-b6ea-e85ea8f0511b';
  response http_response;
BEGIN
  -- Send POST request to webhook
  SELECT * INTO response
  FROM http_post(
    webhook_url,
    user_data::text,
    'application/json'
  );
  
  -- Log the response (optional - for debugging)
  RAISE NOTICE 'Webhook response: status=%, content=%', response.status, response.content;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation process
    RAISE WARNING 'Failed to send webhook: %', SQLERRM;
END;
$$;

-- Update handle_new_user function to include webhook call
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  webhook_data jsonb;
BEGIN
  -- Insert profile with challenge_start_date set to current time
  INSERT INTO public.profiles (
    user_id, 
    nome, 
    peso_inicial,
    challenge_start_date,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'peso_inicial' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'peso_inicial')::NUMERIC(5,2)
      ELSE NULL
    END,
    NOW(), -- Set challenge_start_date to current time
    NOW(),
    NOW()
  );
  
  -- Insert pontuacoes record
  INSERT INTO public.pontuacoes (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  
  -- Prepare webhook data
  webhook_data := jsonb_build_object(
    'user_id', NEW.id,
    'email', NEW.email,
    'nome', COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    'peso_inicial', CASE 
      WHEN NEW.raw_user_meta_data->>'peso_inicial' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'peso_inicial')::NUMERIC(5,2)
      ELSE NULL
    END,
    'created_at', NOW(),
    'challenge_start_date', NOW(),
    'event_type', 'user_created'
  );
  
  -- Send webhook asynchronously (won't block user creation if it fails)
  PERFORM public.send_user_webhook(webhook_data);
  
  RETURN NEW;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.send_user_webhook(jsonb) IS 'Sends user data to external webhook when a new user is created';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile and pontuacoes records for new users, with challenge_start_date set to creation time and sends webhook notification';

\echo 'Webhook integration applied successfully!'
\echo 'New user registrations will now be sent to: https://n8n.guidonutri.com/webhook/2f60b388-e1a4-4703-b6ea-e85ea8f0511b'