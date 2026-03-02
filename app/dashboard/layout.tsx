
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
    FileText,
    Search,
    BarChart,
    LayoutDashboard,
    Settings,
    LogOut,
    Bell,
    Briefcase,
    Zap,
    GraduationCap,
    Mic
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Get or create profile
    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const userName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "User"
    const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
            {/* Sidebar */}
            <aside className="hidden w-64 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f172a] md:flex md:flex-col fixed inset-y-0 z-50">
                <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-white/5">
                    <Link className="flex items-center gap-2 font-bold text-xl tracking-tight" href="/dashboard">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            SkillGap
                        </span>
                    </Link>
                </div>

                <div className="flex flex-1 flex-col overflow-y-auto pt-8 px-4">
                    <nav className="space-y-1">
                        <NavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Overview" />
                        <NavItem href="/dashboard/resumes" icon={<FileText className="h-4 w-4" />} label="Resumes" />
                        <NavItem href="/dashboard/analyze" icon={<Search className="h-4 w-4" />} label="Job Analysis" />
                        <NavItem href="/dashboard/learning-paths" icon={<GraduationCap className="h-4 w-4" />} label="Learning Paths" />
                        <NavItem href="/dashboard/interviews" icon={<Mic className="h-4 w-4" />} label="Mock Interviews" />
                        <NavItem href="/dashboard/applications" icon={<BarChart className="h-4 w-4" />} label="Tracker" />
                        <NavItem href="/dashboard/jobs" icon={<Briefcase className="h-4 w-4" />} label="Job Board" />
                    </nav>

                    <div className="mt-auto pb-8">
                        <nav className="space-y-1">
                            <NavItem href="/dashboard/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
                            <form action="/auth/logout" method="post">
                                <button
                                    type="submit"
                                    className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-all hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 group"
                                >
                                    <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    Log Out
                                </button>
                            </form>
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                            Overview
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-slate-100 dark:hover:bg-white/5 h-9 w-9 border border-slate-200 dark:border-white/10">
                                    <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full border border-white dark:border-slate-900" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80 border-slate-200 dark:border-slate-800">
                                <DropdownMenuLabel className="font-bold text-slate-900 dark:text-white">Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-900">
                                    <div className="flex items-center gap-2 w-full justify-between">
                                        <span className="font-semibold text-sm text-slate-900 dark:text-white">New Feature: AI Interviews 🤖</span>
                                        <span className="text-[10px] text-blue-600 font-bold bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-0.5 rounded-full">NEW</span>
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Practice your technical skills with our new mock interview simulator powered by Gemini.</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-900">
                                    <div className="flex items-center gap-2 w-full justify-between">
                                        <span className="font-semibold text-sm text-slate-900 dark:text-white">Welcome to SkillGap! 🎉</span>
                                    </div>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Upload a resume and analyze a job description to discover your skill gaps.</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                <div className="p-3 text-center text-xs text-slate-400 font-medium">
                                    You're all caught up!
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-fit rounded-full flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/5 pl-2 pr-4 border border-slate-200 dark:border-white/10">
                                    <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm ring-2 ring-slate-100 dark:ring-white/5">
                                        {userInitials}
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 hidden sm:inline-block">{userName}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 border-slate-200 dark:border-slate-800">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{userName}</p>
                                        <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-900">
                                    <Link href="/dashboard/settings" className="flex w-full items-center">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                <DropdownMenuItem asChild className="cursor-pointer text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50 focus:text-rose-600">
                                    <form action="/auth/logout" method="post" className="w-full">
                                        <button type="submit" className="flex w-full items-center">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </button>
                                    </form>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-700">
                    {children}
                </main>
            </div>
        </div>
    )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 dark:hover:text-blue-400 group"
        >
            <div className="text-slate-400 group-hover:text-blue-600 transition-colors">
                {icon}
            </div>
            {label}
        </Link>
    )
}
