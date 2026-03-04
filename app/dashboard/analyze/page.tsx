
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Sparkles, Loader2, BarChart4, ChevronRight, AlertCircle, GraduationCap } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AnalysisResult {
    isMock?: boolean;
    matchScore: number;
    summary: string;
    missingSkills: string[];
    recommendations: string[];
    detailedAnalysis: string;
}

export default function AnalyzePage() {
    const [resumes, setResumes] = useState<{ id: string; file_name: string }[]>([])
    const [selectedResume, setSelectedResume] = useState<string>('')
    const [jobDescription, setJobDescription] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
    const [isLoadingResumes, setIsLoadingResumes] = useState(true)
    const [isGeneratingPath, setIsGeneratingPath] = useState(false)
    const router = useRouter()

    const supabase = createClient()

    useEffect(() => {
        const fetchResumes = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('resumes')
                .select('id, file_name')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                toast.error("Failed to load resumes")
            } else {
                setResumes(data || [])
                if (data && data.length > 0) {
                    setSelectedResume(data[0].id)
                }
            }
            setIsLoadingResumes(false)
        }

        fetchResumes()
    }, [supabase])

    const handleAnalyze = async () => {
        if (!selectedResume || !jobDescription) {
            toast.error("Please select a resume and enter a job description")
            return
        }

        setIsAnalyzing(true)
        setAnalysisResult(null)
        const toastId = toast.loading('AI is analyzing the match...')

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeId: selectedResume,
                    jobDescription
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Analysis failed")
            }

            const data = await response.json()
            setAnalysisResult(data.analysis)
            toast.success('Analysis complete!', { id: toastId })
        } catch (error: unknown) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
            toast.error(errorMessage, { id: toastId })
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleGenerateLearningPath = async () => {
        if (!analysisResult?.missingSkills?.length) {
            toast.error("No missing skills to generate a path for.")
            return
        }

        setIsGeneratingPath(true)
        const toastId = toast.loading('Generating your custom learning path...')

        try {
            const response = await fetch('/api/learning-path/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skills: analysisResult.missingSkills
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to generate learning path")
            }

            toast.success('Learning path generated successfully!', { id: toastId })
            router.push('/dashboard/learning-paths')
        } catch (error: unknown) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
            toast.error(errorMessage, { id: toastId })
        } finally {
            setIsGeneratingPath(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Job Matcher</h2>
                <p className="text-slate-500 dark:text-slate-400">Paste a job description to see how well your resume matches and identify skill gaps.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg">Step 1: Select Resume</CardTitle>
                            <CardDescription>Choose the resume you want to analyze.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="resume-select">Your Resumes</Label>
                                {isLoadingResumes ? (
                                    <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-md" />
                                ) : resumes.length > 0 ? (
                                    <Select value={selectedResume} onValueChange={setSelectedResume}>
                                        <SelectTrigger id="resume-select" className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                            <SelectValue placeholder="Select a resume" />
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                            {resumes.map((resume) => (
                                                <SelectItem key={resume.id} value={resume.id} className="focus:bg-slate-100 dark:focus:bg-slate-800">
                                                    {resume.file_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                        <p className="text-sm text-slate-500 mb-2">No resumes found</p>
                                        <Button variant="outline" size="sm" asChild className="dark:border-slate-700 dark:hover:bg-slate-800">
                                            <Link href="/dashboard/resumes/upload">Upload Now</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg">Step 2: Job Description</CardTitle>
                            <CardDescription>Paste the job details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="job-desc">Paste Job Description</Label>
                                <Textarea
                                    id="job-desc"
                                    placeholder="Enter the full job description text..."
                                    className="min-h-[300px] rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-blue-500"
                                    value={jobDescription}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 py-6"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !selectedResume || !jobDescription}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing Match...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Analyze Job Match
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    {!analysisResult ? (
                        <Card className="h-full border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-12 text-center rounded-2xl">
                            <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                                <BarChart4 className="h-8 w-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Analysis Yet</h3>
                            <p className="text-slate-500 max-w-sm mt-2">Fill in the details to the left and click &apos;Analyze&apos; to get AI insights.</p>
                        </Card>
                    ) : (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500">
                            {/* Match Score Card */}
                            <Card className="border-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Sparkles className="h-32 w-32" />
                                </div>
                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Overall Match Score</p>
                                                {analysisResult.isMock && (
                                                    <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400 border-none text-[10px] py-0 px-2 h-5">
                                                        Demo Data (Quota Limit)
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="text-6xl font-black">{analysisResult.matchScore}%</h3>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                            <p className="text-white font-medium text-sm leading-relaxed max-w-xs italic">
                                                &quot;{analysisResult.summary}&quot;
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Gaps Card */}
                                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
                                    <CardHeader className="flex flex-row items-center gap-2 border-b border-slate-50 dark:border-slate-800">
                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                        <CardTitle className="text-lg">Identified Gaps</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <ul className="space-y-3 mb-6">
                                            {analysisResult.missingSkills?.map((skill: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                                    {skill}
                                                </li>
                                            ))}
                                        </ul>
                                        {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 && (
                                            <Button
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 mt-4"
                                                onClick={handleGenerateLearningPath}
                                                disabled={isGeneratingPath}
                                            >
                                                {isGeneratingPath ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                                ) : (
                                                    <><GraduationCap className="mr-2 h-4 w-4" /> 🚀 Generate Learning Path</>
                                                )}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Recommendations */}
                                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
                                    <CardHeader className="flex flex-row items-center gap-2 border-b border-slate-50 dark:border-slate-800">
                                        <ChevronRight className="h-5 w-5 text-emerald-500" />
                                        <CardTitle className="text-lg">Recommendations</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <ul className="space-y-3">
                                            {analysisResult.recommendations?.map((rec: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Analysis */}
                            <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
                                <CardHeader>
                                    <CardTitle className="text-lg">Detailed Analysis</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                                        {analysisResult.detailedAnalysis.split('\n').filter(p => p.trim()).map((paragraph, i) => (
                                            <p key={i}>{paragraph}</p>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
