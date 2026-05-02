import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Environment variables missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local (and to Vercel project settings).'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'))

// ============== AUTH ==============
export async function signInWithMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })
  return { error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// ============== ADMIN CHECK ==============
export async function isUserAdmin(email) {
  if (!email) return false
  const { data, error } = await supabase
    .from('admins')
    .select('email')
    .eq('email', email)
    .maybeSingle()
  if (error) {
    console.error('[admins] check failed:', error.message)
    return false
  }
  return Boolean(data)
}

// ============== CASES ==============
export async function fetchAllCases() {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) {
    console.error('[cases] fetch failed:', error.message)
    return []
  }
  return (data || []).map(rowToCase)
}

export async function upsertCase(caseObj) {
  const row = caseToRow(caseObj)
  const { data, error } = await supabase
    .from('cases')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  if (error) {
    console.error('[cases] upsert failed:', error.message)
    return { error }
  }
  return { data: rowToCase(data) }
}

export async function deleteCaseRow(id) {
  const { error } = await supabase.from('cases').delete().eq('id', id)
  if (error) console.error('[cases] delete failed:', error.message)
  return { error }
}

// Convert app-side case object → DB row
function caseToRow(c) {
  const {
    id, hospital, department, bedNumber, title, chiefComplaint, system, severity, tags,
    ...rest
  } = c
  return {
    id,
    hospital,
    department: department || null,
    bed_number: bedNumber || null,
    title,
    chief_complaint: chiefComplaint || null,
    system: system || null,
    severity: severity || 'urgent',
    tags: tags || [],
    data: rest, // every other field goes into the JSONB blob
  }
}

// Convert DB row → app-side case object
function rowToCase(row) {
  return {
    id: row.id,
    hospital: row.hospital,
    department: row.department,
    bedNumber: row.bed_number,
    title: row.title,
    chiefComplaint: row.chief_complaint,
    system: row.system,
    severity: row.severity,
    tags: row.tags || [],
    ...(row.data || {}),
  }
}

// ============== PROGRESS ==============
export async function fetchProgress(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.error('[progress] fetch failed:', error.message)
    return null
  }
  if (!data) return null
  return {
    xp: data.xp || 0,
    completedStages: data.completed_stages || {},
    mcqScores: data.mcq_scores || {},
    badges: data.badges || [],
    teachingMode: data.teaching_mode || 'advanced',
  }
}

export async function saveProgress(userId, progress) {
  if (!userId) return
  const row = {
    user_id: userId,
    xp: progress.xp || 0,
    completed_stages: progress.completedStages || {},
    mcq_scores: progress.mcqScores || {},
    badges: progress.badges || [],
    teaching_mode: progress.teachingMode || 'advanced',
  }
  const { error } = await supabase
    .from('progress')
    .upsert(row, { onConflict: 'user_id' })
  if (error) console.error('[progress] save failed:', error.message)
}
