
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { login, signup } from "./actions"
import { Zap } from "lucide-react"

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const { message } = await searchParams;
    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-background to-secondary/30 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-[480px] space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="text-center space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-2xl shadow-primary/20 ring-4 ring-primary/10 mb-1">
                        <Zap className="h-6 w-6 text-primary-foreground fill-current" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">
                        SkillGap<span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground text-base font-medium">The Intelligent Precision Search for your next role.</p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12 p-1.5 bg-secondary/50 backdrop-blur-xl rounded-2xl mb-6">
                        <TabsTrigger value="login" className="rounded-xl font-black text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg">Login</TabsTrigger>
                        <TabsTrigger value="signup" className="rounded-xl font-black text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <Card className="border-border/40 bg-card/60 backdrop-blur-3xl shadow-2xl rounded-[2rem] overflow-hidden">
                            <CardHeader className="space-y-1 p-8 pb-4 text-center">
                                <CardTitle className="text-2xl font-black tracking-tight">Welcome Back</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Continue your journey to a better career.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-4">
                                <form action={login} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Email Address</Label>
                                        <Input id="email" name="email" type="email" required placeholder="name@company.com" className="h-12 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 focus:border-primary text-base px-5 font-medium transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between ml-1">
                                            <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Password</Label>
                                            <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot?</a>
                                        </div>
                                        <Input id="password" name="password" type="password" required className="h-12 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 focus:border-primary text-base px-5 font-medium transition-all" />
                                    </div>
                                    {message && (
                                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold animate-in zoom-in-95">
                                            {message}
                                        </div>
                                    )}
                                    <Button type="submit" className="w-full h-12 rounded-xl text-base font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                                        Enter Dashboard
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="signup">
                        <Card className="border-border/40 bg-card/60 backdrop-blur-3xl shadow-2xl rounded-[2rem] overflow-hidden">
                            <CardHeader className="space-y-1 p-8 pb-4 text-center">
                                <CardTitle className="text-2xl font-black tracking-tight">Create Account</CardTitle>
                                <CardDescription className="text-sm font-medium">
                                    Unlock your personalized AI career engine.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-4">
                                <form action={signup} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Full Name</Label>
                                        <Input id="fullName" name="fullName" required placeholder="John Doe" className="h-12 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 focus:border-primary text-base px-5 font-medium transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="signup-email" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Email Address</Label>
                                        <Input id="signup-email" name="email" type="email" required placeholder="name@company.com" className="h-12 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 focus:border-primary text-base px-5 font-medium transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="signup-password" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Password</Label>
                                        <Input id="signup-password" name="password" type="password" required className="h-12 rounded-xl bg-background/50 border-border/40 focus:ring-primary/20 focus:border-primary text-base px-5 font-medium transition-all" />
                                    </div>
                                    <Button type="submit" className="w-full h-12 rounded-xl text-base font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                                        Create Pro Account
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <p className="text-center text-sm text-muted-foreground font-medium">
                    By continuing, you agree to our <a href="#" className="text-primary font-bold hover:underline">Terms of Service</a>.
                </p>
            </div>
        </div>
    )
}
