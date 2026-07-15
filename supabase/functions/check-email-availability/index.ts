import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://neightag.com',
  'https://www.neightag.com',
])

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''

  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://www.neightag.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

serve(async (req) => {
  const headers = corsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...headers, 'Content-Type': 'application/json' } },
    )
  }

  try {
    const { email } = await req.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return new Response(
        JSON.stringify({ error: 'A valid email address is required' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } },
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase function configuration')
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const perPage = 1000
    let page = 1

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })

      if (error) {
        throw error
      }

      if (data.users.some((user) => user.email?.trim().toLowerCase() === normalizedEmail)) {
        return new Response(
          JSON.stringify({ registered: true }),
          { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } },
        )
      }

      if (data.users.length < perPage) {
        return new Response(
          JSON.stringify({ registered: false }),
          { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } },
        )
      }

      page += 1
    }
  } catch (error: unknown) {
    console.error('Email availability check failed', error)

    return new Response(
      JSON.stringify({ error: 'Unable to check email availability' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } },
    )
  }
})
