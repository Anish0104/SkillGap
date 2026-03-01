import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

    try {
        const { action, interviewId, resumeId, jobId, message } = await request.json()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!ai) {
            return NextResponse.json({ error: 'Gemini API not configured' }, { status: 500 })
        }

        if (action === 'start') {
            // Fetch Resume Details
            const { data: resume } = await supabase.from('resumes').select('*').eq('id', resumeId).single()
            if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 })

            const sysPrompt = `You are an expert technical recruiter conducting a mock interview. 
Based on this candidate's resume: ${JSON.stringify(resume.structured_data || resume.extracted_text)}.
Introduce yourself briefly and ask the FIRST technical or behavioral question. Keep it concise, engaging, and realistic (1-2 sentences maximum).`

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: sysPrompt,
            })

            const aiMessage = { role: 'ai', content: response.text }

            const { data: interview, error } = await supabase
                .from('mock_interviews')
                .insert({
                    user_id: user.id,
                    resume_id: resumeId,
                    job_id: jobId || null,
                    messages: [aiMessage],
                    status: 'in_progress'
                })
                .select('*')
                .single()

            if (error) throw error
            return NextResponse.json({ success: true, data: interview })
        }

        if (action === 'message') {
            // Fetch current interview
            const { data: interview } = await supabase.from('mock_interviews').select('*').eq('id', interviewId).single()
            if (!interview) return NextResponse.json({ error: 'Interview not found' }, { status: 404 })

            const updatedMessages = [...(interview.messages || []), { role: 'user', content: message }]

            const conversationHistory = updatedMessages.map((msg: any) =>
                `${msg.role === 'ai' ? 'Recruiter' : 'Candidate'}: ${msg.content}`
            ).join('\n\n')

            const prompt = `You are a technical recruiter. Continue the following mock interview.
Evaluate the candidate's last answer implicitly, but act natural. 
Ask the NEXT logical interview question or a follow-up. Do not break character. 
Keep your response strictly to what the recruiter would say (1-3 sentences).

Interview History:
${conversationHistory}

Recruiter:`

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            })

            const aiMessage = { role: 'ai', content: response.text?.replace(/^Recruiter:\s*/i, '').trim() }
            updatedMessages.push(aiMessage)

            const { data: updatedInterview, error } = await supabase
                .from('mock_interviews')
                .update({ messages: updatedMessages })
                .eq('id', interviewId)
                .select('*')
                .single()

            if (error) throw error
            return NextResponse.json({ success: true, data: updatedInterview })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error: any) {
        console.error('[Interviews API] Error:', error)
        return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

    try {
        const { interviewId } = await request.json()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        if (!ai) return NextResponse.json({ error: 'Gemini API not configured' }, { status: 500 })

        const { data: interview } = await supabase.from('mock_interviews').select('*').eq('id', interviewId).single()
        if (!interview) return NextResponse.json({ error: 'Interview not found' }, { status: 404 })

        const conversationHistory = interview.messages.map((msg: any) =>
            `${msg.role === 'ai' ? 'Recruiter' : 'Candidate'}: ${msg.content}`
        ).join('\n\n')

        const gradingPrompt = `You are an expert technical hiring manager analyzing a mock interview transcript.
Review the following transcript and provide structured feedback.

Transcript:
${conversationHistory}

Return ONLY a valid JSON object with this structure:
{
  "score": <overall score from 0-100>,
  "summary": "<A 2-3 sentence overview of their performance>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<area to improve 1>", "<area to improve 2>"]
}

Do not include markdown wrappers.`

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: gradingPrompt,
            config: {
                responseMimeType: 'application/json',
            }
        })

        let cleanJson = response.text || ""
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            cleanJson = jsonMatch[0]
        }

        let feedback
        try {
            feedback = JSON.parse(cleanJson)
        } catch {
            return NextResponse.json({ error: 'Failed to parse feedback' }, { status: 500 })
        }

        const { data: updatedInterview, error } = await supabase
            .from('mock_interviews')
            .update({ status: 'completed', feedback })
            .eq('id', interviewId)
            .select('*')
            .single()

        if (error) throw error
        return NextResponse.json({ success: true, data: updatedInterview })

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'Interview ID required' }, { status: 400 })

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { error } = await supabase.from('mock_interviews').delete().eq('id', id).eq('user_id', user.id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete interview' }, { status: 500 })
    }
}
