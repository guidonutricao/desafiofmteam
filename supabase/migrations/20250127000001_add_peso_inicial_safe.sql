-- Migration: Add peso_inicial field to profiles table (Safe Version)
-- This migration safely adds the peso_inicial column and updates the trigger function

-- Step 1: Check if profiles table exists and add peso_inicial column
DO $$ 
BEGIN
    -- Check if profiles table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN
        -- Add peso_inicial column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'peso_inicial'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN peso_inicial NUMERIC(5,2);
            RAISE NOTICE 'Added peso_inicial column to profiles table';
        ELSE
            RAISE NOTICE 'peso_inicial column already exists in profiles table';
        END IF;
    ELSE
        RAISE EXCEPTION 'profiles table does not exist';
    END IF;
END $$;

-- Step 2: Add comment for documentation
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'peso_inicial'
    ) THEN
        EXECUTE 'COMMENT ON COLUMN public.profiles.peso_inicial IS ''Initial weight recorded during user registration (in kg)''';
        RAISE NOTICE 'Added comment to peso_inicial column';
    END IF;
END $$;

-- Step 3: Create index for potential queries filtering by initial weight
CREATE INDEX IF NOT EXISTS idx_profiles_peso_inicial ON public.profiles(peso_inicial);

-- Step 4: Backup the current handle_new_user function (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'handle_new_user'
    ) THEN
        RAISE NOTICE 'handle_new_user function exists, will be updated';
    ELSE
        RAISE NOTICE 'handle_new_user function does not exist, will be created';
    END IF;
END $$;

-- Step 5: Update the handle_new_user function to include peso_inicial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Insert into profiles with peso_inicial support
    INSERT INTO public.profiles (user_id, nome, peso_inicial)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
        CASE 
            WHEN NEW.raw_user_meta_data->>'peso_inicial' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'peso_inicial')::NUMERIC(5,2)
            ELSE NULL
        END
    );
    
    -- Insert into pontuacoes
    INSERT INTO public.pontuacoes (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and re-raise
        RAISE EXCEPTION 'Error in handle_new_user: %', SQLERRM;
END;
$$;

-- Step 6: Verify the function was created successfully
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'handle_new_user'
    ) THEN
        RAISE NOTICE 'handle_new_user function updated successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create handle_new_user function';
    END IF;
END $$;

-- Step 7: Test query to verify the structure
DO $$
DECLARE
    column_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'peso_inicial'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'Migration completed successfully - peso_inicial column is available';
    ELSE
        RAISE EXCEPTION 'Migration failed - peso_inicial column not found';
    END IF;
END $$;