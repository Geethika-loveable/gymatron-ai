
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the auth header
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the client's IP address
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
    
    if (!clientIP) {
      return new Response(
        JSON.stringify({ error: 'Could not determine client IP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make a request to a free geolocation API
    const geoResponse = await fetch(`https://ipapi.co/${clientIP}/json/`);
    if (!geoResponse.ok) {
      console.error('Failed to fetch geolocation data:', await geoResponse.text());
      return new Response(
        JSON.stringify({ error: 'Geolocation service unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geoData = await geoResponse.json();
    
    // Update all sessions with this IP address that don't have country set
    const { error } = await supabase
      .from('analytics_sessions')
      .update({
        country: geoData.country_name,
        city: geoData.city,
        ip_address: clientIP,
      })
      .is('country', null)
      .eq('anonymous_id', req.headers.get('x-anonymous-id'));
    
    if (error) {
      console.error('Error updating sessions with geo data:', error);
    }

    return new Response(
      JSON.stringify({ success: true, country: geoData.country_name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in geo-locate function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
