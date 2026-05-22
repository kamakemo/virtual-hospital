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

// ============== RICH HTML CASE STORAGE ==============
// Uploads a raw HTML file to Supabase Storage bucket "rich-cases".
// Returns { url, path } on success or { error } on failure.
export async function uploadRichCaseFile(fileText, fileName) {
  const BUCKET = 'rich-cases'

  // Use File object (not just Blob) — gives the SDK the filename and explicit MIME type
  const safeName = fileName
    .replace(/[^a-zA-Z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  const path = `${Date.now()}-${safeName}`

  const file = new File([fileText], safeName, { type: 'text/html; charset=utf-8' })

  const { data, error } = await supabase
    .storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: 'text/html; charset=utf-8',
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('[storage] upload failed:', error.message)
    return { error }
  }

  // Get the public URL
  const { data: urlData } = supabase
    .storage
    .from(BUCKET)
    .getPublicUrl(path)

  return {
    url: urlData.publicUrl,
    path,
  }
}

// Deletes a Rich HTML file from Storage when the case is deleted.
export async function deleteRichCaseFile(htmlUrl) {
  if (!htmlUrl) return
  const BUCKET = 'rich-cases'

  // Extract the path from the public URL
  // Public URL format: https://<project>.supabase.co/storage/v1/object/public/rich-cases/<path>
  try {
    const url = new URL(htmlUrl)
    const parts = url.pathname.split(`/rich-cases/`)
    if (parts.length < 2) return
    const path = parts[1]
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) console.error('[storage] delete failed:', error.message)
  } catch (e) {
    console.error('[storage] delete parse error:', e.message)
  }
}

// Convert app-side case object → DB row
function caseToRow(c) {
  const {
    id, hospital, department, bedNumber, title, chiefComplaint, system, severity, tags,
    caseType, htmlUrl,
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
    case_type: caseType || 'interactive',
    html_url: htmlUrl || null,
    data: rest,
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
    caseType: row.case_type || 'interactive',
    htmlUrl: row.html_url || null,
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
    examProgress: data.exam_progress || {},
    conferenceProgress: data.conference_progress || {},
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
    exam_progress: progress.examProgress || {},
    conference_progress: progress.conferenceProgress || {},
  }
  const { error } = await supabase
    .from('progress')
    .upsert(row, { onConflict: 'user_id' })
  if (error) console.error('[progress] save failed:', error.message)
}

// ============== EXAM PREP — EXAMS ==============
export async function fetchAllExams() {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })
  if (error) {
    console.error('[exams] fetch failed:', error.message)
    return []
  }
  return data || []
}

export async function upsertExam(examObj) {
  const row = {
    id: examObj.id,
    title: examObj.title,
    short_title: examObj.shortTitle || examObj.short_title,
    description: examObj.description || null,
    category: examObj.category || 'international',
    region: examObj.region || null,
    icon: examObj.icon || '🎓',
    color: examObj.color || 'teal',
    display_order: examObj.displayOrder || examObj.display_order || 0,
    active: examObj.active !== false,
  }
  const { data, error } = await supabase
    .from('exams')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  if (error) {
    console.error('[exams] upsert failed:', error.message)
    return { error }
  }
  return { data }
}

export async function deleteExamRow(id) {
  const { error } = await supabase.from('exams').delete().eq('id', id)
  if (error) console.error('[exams] delete failed:', error.message)
  return { error }
}

// ============== EXAM PREP — TOPICS ==============
export async function fetchTopics(examId) {
  const { data, error } = await supabase
    .from('exam_topics')
    .select('*')
    .eq('exam_id', examId)
    .order('display_order', { ascending: true })
  if (error) {
    console.error('[topics] fetch failed:', error.message)
    return []
  }
  return data || []
}

export async function upsertTopic(topicObj) {
  const row = {
    id: topicObj.id,
    exam_id: topicObj.examId || topicObj.exam_id,
    subject: topicObj.subject,
    title: topicObj.title,
    description: topicObj.description || null,
    display_order: topicObj.displayOrder || topicObj.display_order || 0,
  }
  const { data, error } = await supabase
    .from('exam_topics')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  if (error) {
    console.error('[topics] upsert failed:', error.message)
    return { error }
  }
  return { data }
}

export async function deleteTopicRow(id) {
  const { error } = await supabase.from('exam_topics').delete().eq('id', id)
  if (error) console.error('[topics] delete failed:', error.message)
  return { error }
}

// ============== EXAM PREP — QUESTIONS ==============
export async function fetchQuestions(topicId) {
  const { data, error } = await supabase
    .from('exam_questions')
    .select('*')
    .eq('topic_id', topicId)
    .order('question_number', { ascending: true })
  if (error) {
    console.error('[questions] fetch failed:', error.message)
    return []
  }
  return (data || []).map(r => ({
    id: r.id,
    topicId: r.topic_id,
    questionNumber: r.question_number,
    ...(r.data || {}),
  }))
}

export async function fetchQuestionsForExam(examId) {
  // Get all topics first, then questions for those topics
  const topics = await fetchTopics(examId)
  if (!topics.length) return { topics: [], questions: [] }
  const topicIds = topics.map(t => t.id)
  const { data, error } = await supabase
    .from('exam_questions')
    .select('*')
    .in('topic_id', topicIds)
    .order('question_number', { ascending: true })
  if (error) {
    console.error('[questions] bulk fetch failed:', error.message)
    return { topics, questions: [] }
  }
  const questions = (data || []).map(r => ({
    id: r.id,
    topicId: r.topic_id,
    questionNumber: r.question_number,
    ...(r.data || {}),
  }))
  return { topics, questions }
}

export async function upsertQuestion(questionObj) {
  const { id, topicId, topic_id, questionNumber, question_number, ...mcqData } = questionObj
  const row = {
    id: id,
    topic_id: topicId || topic_id,
    question_number: questionNumber || question_number || null,
    data: mcqData,
  }
  const { data, error } = await supabase
    .from('exam_questions')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  if (error) {
    console.error('[questions] upsert failed:', error.message)
    return { error }
  }
  return { data }
}

export async function bulkInsertQuestions(topicId, questions) {
  // questions = array of MCQ objects
  const rows = questions.map((q, i) => {
    const id = `eq-${topicId}-${Date.now()}-${i}`
    return {
      id,
      topic_id: topicId,
      question_number: i + 1,
      data: q,
    }
  })
  const { data, error } = await supabase
    .from('exam_questions')
    .insert(rows)
    .select()
  if (error) {
    console.error('[questions] bulk insert failed:', error.message)
    return { error, count: 0 }
  }
  return { data, count: data?.length || 0 }
}

export async function deleteQuestionRow(id) {
  const { error } = await supabase.from('exam_questions').delete().eq('id', id)
  if (error) console.error('[questions] delete failed:', error.message)
  return { error }
}

// ============== CONFERENCES ==============
export async function fetchAllConferences() {
  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })
  if (error) {
    console.error('[conferences] fetch failed:', error.message)
    return []
  }
  return data || []
}

export async function fetchConference(id) {
  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('[conference] fetch failed:', error.message)
    return null
  }
  return data
}

export async function upsertConference(confObj) {
  const row = {
    id: confObj.id,
    title: confObj.title,
    subtitle: confObj.subtitle || null,
    description: confObj.description || null,
    banner_color: confObj.bannerColor || confObj.banner_color || 'teal',
    icon: confObj.icon || '🎤',
    organizer: confObj.organizer || null,
    date_label: confObj.dateLabel || confObj.date_label || null,
    hero_image: confObj.heroImage || confObj.hero_image || null,
    display_order: confObj.displayOrder || confObj.display_order || 0,
    active: confObj.active !== false,
  }
  const { data, error } = await supabase
    .from('conferences')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  if (error) {
    console.error('[conference] upsert failed:', error.message)
    return { error }
  }
  return { data }
}

export async function deleteConferenceRow(id) {
  const { error } = await supabase.from('conferences').delete().eq('id', id)
  if (error) console.error('[conference] delete failed:', error.message)
  return { error }
}

export async function fetchSessions(conferenceId) {
  const { data, error } = await supabase
    .from('conference_sessions')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('display_order', { ascending: true })
  if (error) {
    console.error('[sessions] fetch failed:', error.message)
    return []
  }
  return (data || []).map(rowToSession)
}

export async function fetchSession(id) {
  const { data, error } = await supabase
    .from('conference_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('[session] fetch failed:', error.message)
    return null
  }
  return data ? rowToSession(data) : null
}

export async function upsertSession(sessionObj) {
  const { id, conferenceId, conference_id, sessionNumber, session_number,
          topic, durationMinutes, duration_minutes,
          speakerName, speaker_name, speakerTitle, speaker_title,
          speakerAffiliation, speaker_affiliation, speakerPhoto, speaker_photo,
          speakerBio, speaker_bio, displayOrder, display_order,
          ...rest } = sessionObj
  const row = {
    id,
    conference_id: conferenceId || conference_id,
    session_number: sessionNumber || session_number || 1,
    topic,
    duration_minutes: durationMinutes || duration_minutes || null,
    speaker_name: speakerName || speaker_name || null,
    speaker_title: speakerTitle || speaker_title || null,
    speaker_affiliation: speakerAffiliation || speaker_affiliation || null,
    speaker_photo: speakerPhoto || speaker_photo || null,
    speaker_bio: speakerBio || speaker_bio || null,
    data: rest, // lectureHTML, moderatorQs, audienceQs all go in here
    display_order: displayOrder || display_order || 0,
  }
  const { data, error } = await supabase
    .from('conference_sessions')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  if (error) {
    console.error('[session] upsert failed:', error.message)
    return { error }
  }
  return { data: rowToSession(data) }
}

export async function deleteSessionRow(id) {
  const { error } = await supabase.from('conference_sessions').delete().eq('id', id)
  if (error) console.error('[session] delete failed:', error.message)
  return { error }
}

function rowToSession(row) {
  return {
    id: row.id,
    conferenceId: row.conference_id,
    sessionNumber: row.session_number,
    topic: row.topic,
    durationMinutes: row.duration_minutes,
    speakerName: row.speaker_name,
    speakerTitle: row.speaker_title,
    speakerAffiliation: row.speaker_affiliation,
    speakerPhoto: row.speaker_photo,
    speakerBio: row.speaker_bio,
    displayOrder: row.display_order,
    ...(row.data || {}),
  }
}
