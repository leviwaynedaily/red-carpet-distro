import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Generate filenames
    const originalName = file.name.replace(/[^\x00-\x7F]/g, '')
    const baseName = originalName.split('.')[0]
    
    // Upload original file
    const originalPath = `products/${productId}/${originalName}`

    console.log(`Uploading original file: ${originalPath}`);

    const { error: originalError, data } = await supabase.storage
      .from('media')
      .upload(originalPath, file, {
        contentType: file.type,
        upsert: true
      })

    if (originalError) {
      console.error('Error uploading original file:', originalError);
      throw originalError;
    }

    // Get public URL for original file
    const { data: originalUrl } = supabase.storage
      .from('media')
      .getPublicUrl(originalPath)

    console.log('Successfully uploaded original file');

    // Update product with original URL
    const { error: updateError } = await supabase
      .from('products')
      .update({
        image_url: originalUrl.publicUrl,
        media: {
          original: originalUrl.publicUrl
        }
      })
      .eq('id', productId)

    if (updateError) {
      console.error('Error updating product:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        message: 'File uploaded successfully',
        originalUrl: originalUrl.publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process image', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})