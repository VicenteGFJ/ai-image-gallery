import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import { createOpenAIClient, ANALYSIS_PROMPT } from '@/lib/openai'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceClient()

  // Verify image exists and belongs to user
  const { data: image, error: imgError } = await serviceClient
    .from('images')
    .select('*, image_metadata(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (imgError || !image) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const metadata = Array.isArray(image.image_metadata) ? image.image_metadata[0] : image.image_metadata
  const status = metadata?.ai_processing_status
  const hasTitle = !!(metadata as { title?: string | null })?.title

  // Block re-analysis only if complete AND already has a title
  if (status === 'complete' && hasTitle) {
    return NextResponse.json({ error: 'Image already analyzed' }, { status: 409 })
  }

  // Set status to processing
  await serviceClient
    .from('image_metadata')
    .update({ ai_processing_status: 'processing' })
    .eq('image_id', id)

  const startTime = Date.now()

  try {
    // Download original from Storage
    const { data: fileData, error: downloadError } = await serviceClient.storage
      .from('images')
      .download(image.original_path)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download image: ${downloadError?.message}`)
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Call GPT-4o Vision
    const openai = createOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: ANALYSIS_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${image.mime_type};base64,${base64}`,
                detail: 'low',
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    })

    const raw = response.choices[0]?.message?.content ?? ''
    // Strip markdown code fences if the model wrapped the JSON (e.g. ```json ... ```)
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned) as { title?: string; tags: string[]; description: string }

    if (!Array.isArray(parsed.tags) || typeof parsed.description !== 'string') {
      throw new Error('Invalid AI response structure')
    }

    const processingTime = Date.now() - startTime

    const { data: updated } = await serviceClient
      .from('image_metadata')
      .update({
        title: parsed.title ?? null,
        tags: parsed.tags,
        description: parsed.description,
        ai_processing_status: 'complete',
        model_used: 'gpt-4o',
        processing_time_ms: processingTime,
        ai_error_message: null,
      })
      .eq('image_id', id)
      .select()
      .single()

    return NextResponse.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    console.error('[analyze] error:', message, err)

    await serviceClient
      .from('image_metadata')
      .update({ ai_processing_status: 'failed', ai_error_message: message })
      .eq('image_id', id)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
