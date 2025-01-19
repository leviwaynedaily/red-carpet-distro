import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { join } from "https://deno.land/std@0.168.0/path/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received request to upload PWA icons');
    const formData = await req.formData()
    const file = formData.get('file')
    const size = formData.get('size')
    const type = formData.get('type') // 'any' or 'maskable'
    const format = formData.get('format') // 'png' or 'webp'

    if (!file || !size || !type || !format) {
      console.error('Missing required fields', { file, size, type, format });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Construct the filename
    const filename = `icon-${size}${type === 'maskable' ? '-maskable' : ''}.${format}`
    const publicPath = join('public', 'pwa', filename)

    console.log('Writing file:', publicPath);

    try {
      // Ensure the directory exists
      await Deno.mkdir(join('public', 'pwa'), { recursive: true });
      
      // Write the file
      const fileData = new Uint8Array(await file.arrayBuffer())
      await Deno.writeFile(publicPath, fileData)

      console.log('Successfully wrote file:', publicPath);

      return new Response(
        JSON.stringify({ 
          success: true, 
          path: `/pwa/${filename}`,
          fullPath: publicPath
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      )
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      return new Response(
        JSON.stringify({ error: 'Failed to write file', details: writeError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})