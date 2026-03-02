'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    User,
    Bell,
    Shield,
    Zap,
    Download,
    Trash2,
    Loader2,
    Check,
    Mail,
    Globe,
    Lock,
    CreditCard
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        bio: '',
        avatar_url: '',
        salary_expectation: '',
        location_preference: 'Remote'
    })

    const supabase = createClient()

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) {
                const names = (data.full_name || '').split(' ')
                setProfile({
                    first_name: names[0] || '',
                    last_name: names.slice(1).join(' ') || '',
                    email: data.email || user.email || '',
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || '',
                    salary_expectation: data.salary_expectation || '',
                    location_preference: data.location_preference || 'Remote'
                })
            }
            setLoading(false)
        }

        fetchProfile()
    }, [supabase])

    const handleSave = async () => {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: `${profile.first_name} ${profile.last_name}`.trim(),
                bio: profile.bio,
                avatar_url: profile.avatar_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (error) {
            toast.error("Failed to update profile: " + error.message)
        } else {
            toast.success("Profile updated successfully!")
            // Force a reload to update the layout header avatar
            setTimeout(() => window.location.reload(), 1000)
        }
        setSaving(false)
    }

    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingAvatar(true)

            if (!event.target.files || event.target.files.length === 0) {
                return
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const filePath = `${user.id}-${Math.random()}.${fileExt}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            // Get public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

            setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }))
            toast.success("Avatar uploaded! Remember to click 'Save Identity'.")

        } catch (error: any) {
            toast.error(error.message || "Error uploading avatar!")
        } finally {
            setUploadingAvatar(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Preferences</h2>
                <p className="text-slate-500 dark:text-slate-400">Optimize your SkillGap experience and manage your professional identity.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-8">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl h-14 w-full md:w-auto overflow-x-auto justify-start md:justify-center">
                    <TabsTrigger value="profile" className="rounded-xl px-6 h-12 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm gap-2 font-bold">
                        <User className="h-4 w-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-xl px-6 h-12 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm gap-2 font-bold">
                        <Bell className="h-4 w-4" /> Alerts
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="rounded-xl px-6 h-12 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm gap-2 font-bold">
                        <Lock className="h-4 w-4" /> Privacy
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />
                        <CardContent className="px-8 pb-8 -mt-12 relative">
                            <div className="flex flex-col md:flex-row gap-8 items-end mb-8">
                                <div className="h-28 w-28 rounded-[2rem] bg-white dark:bg-slate-950 p-1 shadow-2xl relative group cursor-pointer overflow-hidden">
                                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                                        <div className="h-full w-full rounded-[1.75rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-12 w-12 text-slate-300" />
                                            )}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-bold text-xs">
                                                {uploadingAvatar ? (
                                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                ) : (
                                                    <>
                                                        <Zap className="h-5 w-5 mb-1 text-blue-400 fill-blue-400" />
                                                        Update
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Label>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={uploadAvatar}
                                        disabled={uploadingAvatar}
                                    />
                                </div>
                                <div className="flex-1 pb-2">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Public Identity</h3>
                                    <p className="text-slate-500 text-sm">This data powers your AI-tailored applications.</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first-name" className="text-xs font-black uppercase tracking-widest text-slate-400">First Name</Label>
                                            <Input
                                                id="first-name"
                                                value={profile.first_name}
                                                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                                className="rounded-xl h-12 border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last-name" className="text-xs font-black uppercase tracking-widest text-slate-400">Last Name</Label>
                                            <Input
                                                id="last-name"
                                                value={profile.last_name}
                                                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                                className="rounded-xl h-12 border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                                        <div className="relative">
                                            <Input id="email" type="email" value={profile.email} disabled className="rounded-xl h-12 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pl-10" />
                                            <Mail className="h-4 w-4 absolute left-3.5 top-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-slate-400">Professional Summary</Label>
                                        <Textarea
                                            id="bio"
                                            value={profile.bio}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            placeholder="Write a brief professional summary..."
                                            className="rounded-xl min-h-[148px] border-slate-200 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 resize-none leading-relaxed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-8" />

                            <div className="flex justify-end gap-4">
                                <Button variant="ghost" className="rounded-xl px-6" onClick={() => window.location.reload()}>Discard Changes</Button>
                                <Button
                                    disabled={saving}
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 h-12 font-bold shadow-xl shadow-blue-500/20"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                    {saving ? "Deploying Updates..." : "Save Identity"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                                <Bell className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black">Job Alerts</h3>
                                <p className="text-slate-500 text-sm">Get notified when hyper-relevant roles appear.</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Daily Opportunity Digest</Label>
                                    <p className="text-xs text-slate-500 font-medium">Receive a curated list of jobs matching your fit every morning.</p>
                                </div>
                                <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 opacity-60">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Instant SMS Notifications</Label>
                                    <p className="text-xs text-slate-500 font-medium">Real-time alerts for high-priority matches (Enterprise only).</p>
                                </div>
                                <div className="h-6 w-11 bg-slate-300 rounded-full relative cursor-not-allowed">
                                    <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="privacy" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="grid gap-6">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-8">
                            <h3 className="text-xl font-black mb-6">Data Sovereignty</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed">You own your data. Export your professional profile, interaction history, and AI analysis results in high-fidelity JSON format at any time.</p>
                            <div className="flex flex-wrap gap-4">
                                <Button variant="outline" className="rounded-xl h-12 px-6 gap-2 border-slate-200 font-bold">
                                    <Download className="h-4 w-4" /> Export All Data
                                </Button>
                                <Button variant="outline" className="rounded-xl h-12 px-6 gap-2 border-slate-200 font-bold">
                                    <Shield className="h-4 w-4" /> Transparency Report
                                </Button>
                            </div>
                        </Card>

                        <Card className="border-red-100 dark:border-red-900/20 bg-red-50/10 dark:bg-red-900/5 rounded-3xl p-8">
                            <h3 className="text-xl font-black text-red-900 dark:text-red-400 mb-2">Danger Zone</h3>
                            <p className="text-red-800/60 dark:text-red-400/60 text-sm mb-6 max-w-lg">Deleting your account will permanently erase all resumes, tracked applications, and AI historical data. This action cannot be reversed.</p>
                            <Button variant="destructive" className="rounded-xl h-12 px-8 font-black shadow-lg shadow-red-500/20 gap-2">
                                <Trash2 className="h-4 w-4" /> Terminate Account
                            </Button>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
