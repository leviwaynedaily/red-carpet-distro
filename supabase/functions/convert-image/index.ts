import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Sharp from 'https://esm.sh/sharp@0.32.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Processing new image conversion request');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const productId = formData.get('productId')

    if (!file || !productId) {
      console.error('Missing file or productId');
      return new Response(
        JSON.stringify({ error: 'Missing file or productId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processing image for product ${productId}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Read file data
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Convert to WebP
    const webpBuffer = await Sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer()

    // Generate filenames
    const originalName = file.name.replace(/[^\x00-\x7F]/g, '')
    const baseName = originalName.split('.')[0]
    const webpFileName = `${baseName}.webp`
    
    // Upload both original and WebP versions
    const originalPath = `products/${productId}/${originalName}`
    const webpPath = `products/${productId}/${webpFileName}`

    console.log(`Uploading files: 
      Original: ${originalPath}
      WebP: ${webpPath}`
    );

    // Upload original file
    const { error: originalError } = await supabase.storage
      .from('media')
      .upload(originalPath, file, {
        contentType: file.type,
        upsert: true
      })

    if (originalError) {
      console.error('Error uploading original file:', originalError);
      throw originalError;
    }

    // Upload WebP version
    const { error: webpError } = await supabase.storage
      .from('media')
      .upload(webpPath, webpBuffer, {
        contentType: 'image/webp',
        upsert: true
      })

    if (webpError) {
      console.error('Error uploading WebP file:', webpError);
      throw webpError;
    }

    // Get public URLs
    const { data: originalUrl } = supabase.storage
      .from('media')
      .getPublicUrl(originalPath)

    const { data: webpUrl } = supabase.storage
      .from('media')
      .getPublicUrl(webpPath)

    console.log('Successfully processed and uploaded both versions');

    // Update product with both URLs
    const { error: updateError } = await supabase
      .from('products')
      .update({
        image_url: originalUrl.publicUrl,
        media: {
          webp: webpUrl.publicUrl
        }
      })
      .eq('id', productId)

    if (updateError) {
      console.error('Error updating product:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        message: 'Images processed and uploaded successfully',
        originalUrl: originalUrl.publicUrl,
        webpUrl: webpUrl.publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Conversion error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process image', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})