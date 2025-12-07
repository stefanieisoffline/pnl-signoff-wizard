-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'product_controller', 'trader', 'desk_head');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (email, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_email text, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE email = _email
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_email text)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE email = _email
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Anyone can read user roles"
ON public.user_roles
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(current_setting('app.current_user_email', true), 'admin'));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(current_setting('app.current_user_email', true), 'admin'));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(current_setting('app.current_user_email', true), 'admin'));

-- Insert initial admin users
INSERT INTO public.user_roles (email, name, role, user_id) VALUES
('stefanie.shi@sefe.eu', 'Stefanie Shi', 'admin', gen_random_uuid()),
('robert.jenkins@sefe.eu', 'Robert Jenkins', 'admin', gen_random_uuid()),
('edward.costelloe@sefe.eu', 'Edward Costelloe', 'admin', gen_random_uuid()),
('ross.graham@sefe.eu', 'Ross Graham', 'admin', gen_random_uuid()),
('jonathan.hughes@sefe.eu', 'Jonathan Hughes', 'admin', gen_random_uuid()),
('ero.kapatos@sefe.eu', 'Ero Kapatos', 'admin', gen_random_uuid()),
('vinson.sharma@sefe.eu', 'Vinson Sharma', 'admin', gen_random_uuid());

-- Insert existing product controllers
INSERT INTO public.user_roles (email, name, role, user_id) VALUES
('mark.prenty@sefe-energy.com', 'Mark Prenty', 'product_controller', gen_random_uuid()),
('emma.sherrington@sefe-energy.com', 'Emma Sherrington', 'product_controller', gen_random_uuid()),
('ryan.sherlock@sefe-energy.com', 'Ryan Sherlock', 'product_controller', gen_random_uuid()),
('benjamin.sherrington@sefe.eu', 'Benjamin Sherrington', 'product_controller', gen_random_uuid()),
('michael.williams@sefe-energy.com', 'Michael Williams', 'product_controller', gen_random_uuid()),
('sarah.thompson@sefe-energy.com', 'Sarah Thompson', 'product_controller', gen_random_uuid());

-- Insert existing traders
INSERT INTO public.user_roles (email, name, role, user_id) VALUES
('jonathan.sherlock@sefe.eu', 'Jonathan Sherlock', 'trader', gen_random_uuid()),
('ryan.smith@sefe.eu', 'Ryan Smith', 'trader', gen_random_uuid()),
('sarah.jones@sefe.eu', 'Sarah Jones', 'trader', gen_random_uuid()),
('daniel.johnson@sefe.eu', 'Daniel Johnson', 'trader', gen_random_uuid()),
('laura.wilson@sefe.eu', 'Laura Wilson', 'trader', gen_random_uuid()),
('kevin.brown@sefe.eu', 'Kevin Brown', 'trader', gen_random_uuid()),
('jennifer.taylor@sefe.eu', 'Jennifer Taylor', 'trader', gen_random_uuid()),
('christopher.anderson@sefe.eu', 'Christopher Anderson', 'trader', gen_random_uuid()),
('elizabeth.martinez@sefe.eu', 'Elizabeth Martinez', 'trader', gen_random_uuid()),
('david.garcia@sefe.eu', 'David Garcia', 'trader', gen_random_uuid()),
('michelle.rodriguez@sefe.eu', 'Michelle Rodriguez', 'trader', gen_random_uuid()),
('james.lee@sefe.eu', 'James Lee', 'trader', gen_random_uuid()),
('patricia.white@sefe.eu', 'Patricia White', 'trader', gen_random_uuid()),
('john.thompson@sefe.eu', 'John Thompson', 'trader', gen_random_uuid()),
('linda.clark@sefe.eu', 'Linda Clark', 'trader', gen_random_uuid()),
('michael.harris@sefe.eu', 'Michael Harris', 'trader', gen_random_uuid()),
('jessica.lewis@sefe.eu', 'Jessica Lewis', 'trader', gen_random_uuid());

-- Insert existing desk heads
INSERT INTO public.user_roles (email, name, role, user_id) VALUES
('ed.humphreys@sefe.eu', 'Ed Humphreys', 'desk_head', gen_random_uuid()),
('mark.sherrington@sefe.eu', 'Mark Sherrington', 'desk_head', gen_random_uuid()),
('peter.williamson@sefe.eu', 'Peter Williamson', 'desk_head', gen_random_uuid()),
('anna.fitzgerald@sefe.eu', 'Anna Fitzgerald', 'desk_head', gen_random_uuid()),
('thomas.henderson@sefe.eu', 'Thomas Henderson', 'desk_head', gen_random_uuid()),
('richard.abbott@sefe.eu', 'Richard Abbott', 'desk_head', gen_random_uuid()),
('catherine.powell@sefe.eu', 'Catherine Powell', 'desk_head', gen_random_uuid()),
('steven.murray@sefe.eu', 'Steven Murray', 'desk_head', gen_random_uuid()),
('helen.crawford@sefe.eu', 'Helen Crawford', 'desk_head', gen_random_uuid()),
('paul.sinclair@sefe.eu', 'Paul Sinclair', 'desk_head', gen_random_uuid()),
('margaret.douglas@sefe.eu', 'Margaret Douglas', 'desk_head', gen_random_uuid());