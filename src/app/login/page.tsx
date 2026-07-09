"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Package, Sparkles, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            await login({ email, password });
            toast.success("Login successful!");
            router.push("/dashboard");
        } catch (error: any) {
            toast.error(error?.error?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden" style={{ backgroundColor: '#f4f1ea' }}>
            {/* Book Paper Background with Texture */}
            <div className="absolute inset-0" style={{
                backgroundColor: '#f4f1ea',
                backgroundImage: `
                    radial-gradient(at 40% 20%, rgba(139, 92, 46, 0.05) 0px, transparent 50%),
                    radial-gradient(at 80% 80%, rgba(101, 67, 33, 0.05) 0px, transparent 50%),
                    radial-gradient(at 0% 50%, rgba(160, 120, 80, 0.03) 0px, transparent 50%)
                `
            }}>
                {/* Animated Orbs - Muted colors for paper theme */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Glassmorphism Card */}
            <div className="relative w-full max-w-md animate-fade-in">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-800/10 backdrop-blur-lg border border-amber-900/20 shadow-xl mb-4">
                        <Package className="w-8 h-8 text-amber-900" />
                    </div>
                    <h1 className="text-4xl font-bold text-amber-950 mb-2 flex items-center justify-center gap-2">
                        Welcome Back
                        <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
                    </h1>
                    <p className="text-amber-900/70 text-lg">
                        Sign in to your IMS account
                    </p>
                </div>

                {/* Glass Card */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-amber-900/10">
                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2 group">
                            <Label htmlFor="email" className="text-amber-950 font-medium">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="bg-white/50 border-amber-900/20 text-amber-950 placeholder:text-amber-900/40 focus:bg-white/70 focus:border-amber-900/40 transition-all duration-300 h-12 rounded-xl"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2 group">
                            <Label htmlFor="password" className="text-amber-950 font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="bg-white/50 border-amber-900/20 text-amber-950 placeholder:text-amber-900/40 focus:bg-white/70 focus:border-amber-900/40 transition-all duration-300 h-12 rounded-xl pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-900/60 hover:text-amber-900 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-amber-900 text-white hover:bg-amber-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-amber-900/20"></div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm">
                        <span className="text-amber-900/70">Don't have an account? </span>
                        <Link
                            href="/register"
                            className="text-amber-900 font-semibold hover:text-amber-700 transition-colors inline-flex items-center gap-1 group"
                        >
                            Sign up
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Additional Info */}
                <p className="text-center text-sm text-amber-900/60 mt-6">
                    Inventory Management System v1.0.0
                </p>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
