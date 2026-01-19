-- Profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  carbon_preference TEXT DEFAULT 'balanced' CHECK (carbon_preference IN ('eco-first', 'balanced', 'comfort-first')),
  total_carbon_saved DECIMAL(10, 2) DEFAULT 0,
  trips_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Destinations table
CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  carbon_score TEXT DEFAULT 'B' CHECK (carbon_score IN ('A', 'B', 'C')),
  rating DECIMAL(2, 1) DEFAULT 4.5,
  highlight TEXT,
  avg_price_per_day DECIMAL(10, 2),
  wifi_speed INTEGER,
  coworking_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coworking spaces table
CREATE TABLE public.coworking_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  image_url TEXT,
  price_per_hour DECIMAL(10, 2),
  price_per_day DECIMAL(10, 2),
  price_per_month DECIMAL(10, 2),
  amenities TEXT[],
  rating DECIMAL(2, 1) DEFAULT 4.5,
  wifi_speed INTEGER,
  opening_hours TEXT,
  carbon_score TEXT DEFAULT 'B' CHECK (carbon_score IN ('A', 'B', 'C')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Accommodations table
CREATE TABLE public.accommodations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('hotel', 'apartment', 'coliving', 'hostel', 'eco-lodge')),
  description TEXT,
  image_url TEXT,
  price_per_night DECIMAL(10, 2),
  amenities TEXT[],
  rating DECIMAL(2, 1) DEFAULT 4.5,
  distance_to_center TEXT,
  carbon_score TEXT DEFAULT 'B' CHECK (carbon_score IN ('A', 'B', 'C')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mobility options table
CREATE TABLE public.mobility_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('electric-bike', 'electric-scooter', 'bicycle', 'public-transport', 'walking-tour')),
  description TEXT,
  image_url TEXT,
  price_per_hour DECIMAL(10, 2),
  price_per_day DECIMAL(10, 2),
  carbon_per_km DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10, 2),
  duration_hours DECIMAL(4, 1),
  category TEXT CHECK (category IN ('culture', 'nature', 'sport', 'wellness', 'gastronomy', 'eco-tour')),
  carbon_impact DECIMAL(10, 2) DEFAULT 0,
  eco_certified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination_id UUID REFERENCES public.destinations(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_price DECIMAL(10, 2) DEFAULT 0,
  total_carbon_impact DECIMAL(10, 2) DEFAULT 0,
  carbon_offset_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reservation items table
CREATE TABLE public.reservation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('coworking', 'accommodation', 'mobility', 'activity')),
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  carbon_impact DECIMAL(10, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Carbon footprint history table
CREATE TABLE public.carbon_footprint_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  transport_carbon DECIMAL(10, 2) DEFAULT 0,
  accommodation_carbon DECIMAL(10, 2) DEFAULT 0,
  activities_carbon DECIMAL(10, 2) DEFAULT 0,
  total_carbon DECIMAL(10, 2) DEFAULT 0,
  offset_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('destination', 'coworking', 'accommodation', 'activity')),
  target_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coworking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobility_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_footprint_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Destinations policies (public read)
CREATE POLICY "Destinations are viewable by everyone" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create destinations" ON public.destinations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Coworking spaces policies (public read)
CREATE POLICY "Coworking spaces are viewable by everyone" ON public.coworking_spaces FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create coworking spaces" ON public.coworking_spaces FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Accommodations policies (public read)
CREATE POLICY "Accommodations are viewable by everyone" ON public.accommodations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create accommodations" ON public.accommodations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Mobility options policies (public read)
CREATE POLICY "Mobility options are viewable by everyone" ON public.mobility_options FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create mobility options" ON public.mobility_options FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Activities policies (public read)
CREATE POLICY "Activities are viewable by everyone" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Reservations policies (user-specific)
CREATE POLICY "Users can view their own reservations" ON public.reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reservations" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reservations" ON public.reservations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reservations" ON public.reservations FOR DELETE USING (auth.uid() = user_id);

-- Reservation items policies
CREATE POLICY "Users can view their reservation items" ON public.reservation_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.reservations WHERE id = reservation_items.reservation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create their reservation items" ON public.reservation_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.reservations WHERE id = reservation_items.reservation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete their reservation items" ON public.reservation_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.reservations WHERE id = reservation_items.reservation_id AND user_id = auth.uid())
);

-- Carbon footprint history policies
CREATE POLICY "Users can view their carbon history" ON public.carbon_footprint_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their carbon history" ON public.carbon_footprint_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();