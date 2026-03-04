import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY
    const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

    try {
        const { skills, jobId } = await request.json()

        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return NextResponse.json({ error: 'Missing skills to generate path for.' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!ai) {
            console.error('[Learning Path API] Gemini API key missing')
            return NextResponse.json({ error: 'Gemini API not configured' }, { status: 500 })
        }

        console.log(`[Learning Path API] Generating path for skills: ${skills.join(', ')}`)

        const prompt = `You are an expert technical career coach and curriculum designer. 
A user is missing the following skills from their resume for potential job opportunities: ${skills.join(', ')}.

Create a highly detailed, step-by-step learning path to help them acquire these skills. 
Return ONLY a valid JSON object with the following structure:
{
  "title": "A catchy title for this learning path",
  "estimatedHours": <number of total hours>,
  "modules": [
    {
      "title": "<module title>",
      "description": "<what this module covers>",
      "duration": "<e.g., 2 hours>",
      "topics": ["<topic 1>", "<topic 2>"],
      "resources": [
        { "name": "<resource name, e.g. React Official Docs>", "type": "<Article/Video/Course>" }
      ]
    }
  ],
  "encouragement": "<A brief, motivating closing message>"
}

Do not include markdown wrappers like \`\`\`json. Just the raw JSON object.`

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json",
            }
        })

        const rawContent = response.text || ""
        let cleanJson = rawContent

        // Sometimes Gemini still adds markdown blocks even with responseMimeType
        if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '')
        }
        cleanJson = cleanJson.trim()

        let pathData
        try {
            pathData = JSON.parse(cleanJson)
        } catch (e) {
            console.error('[Learning Path API] Failed to parse JSON:', cleanJson)
            return NextResponse.json({ error: 'Failed to generate learning path structure.' }, { status: 500 })
        }

        // Save to Database
        const { data: savedPath, error: dbError } = await supabase
            .from('learning_paths')
            .insert({
                user_id: user.id,
                job_id: jobId || null,
                missing_skills: skills,
                path_data: pathData
            })
            .select('*')
            .single()

        if (dbError) {
            console.error('[Learning Path API] Database Error:', dbError)
            return NextResponse.json({ error: 'Failed to save learning path to database' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: savedPath })

    } catch (error: any) {
        console.error('[Learning Path API] Route Error:', error)
        return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 })
    }
}
