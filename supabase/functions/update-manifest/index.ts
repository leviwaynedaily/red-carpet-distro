import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const manifest = await req.json()
    
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Convert manifest object to string
    const manifestContent = JSON.stringify(manifest, null, 2)

    // Upload manifest.json to the static bucket
    const { error: uploadError } = await supabase.storage
      .from('static')
      .upload('manifest.json', manifestContent, {
        contentType: 'application/json',
        upsert: true // Override if exists
      })

    if (uploadError) {
      console.error('Error uploading manifest:', uploadError)
      throw uploadError
    }

    // Get the public URL of the manifest file
    const { data: { publicUrl } } = supabase.storage
      .from('static')
      .getPublicUrl('manifest.json')

    console.log('Manifest updated successfully:', publicUrl)

    return new Response(
      JSON.stringify({ 
        message: 'Manifest updated successfully',
        url: publicUrl 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error updating manifest:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    )
  }
})