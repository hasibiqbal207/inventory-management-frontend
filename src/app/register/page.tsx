"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { Eye, EyeOff, Package, Sparkles, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // Calculate password strength
    useEffect(() => {
        const password = formData.password;
        let strength = 0;

        if (password.length >= 6) strength += 25;
        if (password.length >= 10) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

        setPasswordStrength(Math.min(strength, 100));
    }, [formData.password]);

    // Check password match
    useEffect(() => {
        if (formData.confirmPassword.length > 0) {
            setPasswordMatch(formData.password === formData.confirmPassword);
        } else {
            setPasswordMatch(null);
        }
    }, [formData.password, formData.confirmPassword]);

    const getStrengthColor = () => {
        if (passwordStrength < 40) return "bg-red-500";
        if (passwordStrength < 70) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthText = () => {
        if (passwordStrength < 40) return "Weak";
        if (passwordStrength < 70) return "Medium";
        return "Strong";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
            });
            toast.success("Registration successful! Please login.");
            router.push("/login");
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Registration failed. Please try again."));
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden" style={{ backgroundColor: '#f4f1ea' }}>
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
                        Create Account
                        <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
                    </h1>
                    <p className="text-amber-900/70 text-lg">
                        Join our IMS platform
                    </p>
                </div>

                {/* Glass Card */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-amber-900/10">
                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-amber-950 font-medium">
                                    First Name
                                </Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/50 border-amber-900/20 text-amber-950 placeholder:text-amber-900/40 focus:bg-white/70 focus:border-amber-900/40 transition-all duration-300 h-11 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-amber-950 font-medium">
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="bg-white/50 border-amber-900/20 text-amber-950 placeholder:text-amber-900/40 focus:bg-white/70 focus:border-amber-900/40 transition-all duration-300 h-11 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-amber-950 font-medium">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                className="bg-white/50 border-amber-900/20 text-amber-950 placeholder:text-amber-900/40 focus:bg-white/70 focus:border-amber-900/40 transition-all duration-300 h-11 rounded-xl"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-amber-950 font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    className="bg-white/50 border-amber-900/20 text-amber-950 placeholder:text-amber-900/40 focus:bg-white/70 focus:border-amber-900/40 transition-all duration-300 h-11 rounded-xl pr-12"
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

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-amber-900/70">Password Strength</span>
                                        <span className={`font-semibold ${passwordStrength < 40 ? "text-red-700" :
                                            passwordStrength < 70 ? "text-amber-700" :
                                                "text-green-700"
                                            }`}>
                                            {getStrengthText()}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-amber-900/20 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getStrengthColor()} transition-all duration-300`}
                                            style={{ width: `${passwordStrength}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-amber-950 font-medium">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    className={`bg-white/50 border-amber-900/20 text-amber-950 placeholder:text-amber-900/40 focus:bg-white/70 focus:border-amber-900/40 transition-all duration-300 h-11 rounded-xl pr-12 ${passwordMatch === false ? "border-red-600" :
                                        passwordMatch === true ? "border-green-600" : ""
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-900/60 hover:text-amber-900 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Password Match Indicator */}
                            {passwordMatch !== null && (
                                <div className={`flex items-center gap-1 text-xs ${passwordMatch ? "text-green-700" : "text-red-700"
                                    }`}>
                                    {passwordMatch ? (
                                        <>
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Passwords match</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-3 h-3" />
                                            <span>Passwords do not match</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-amber-900 text-white hover:bg-amber-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
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
                        <span className="text-amber-900/70">Already have an account? </span>
                        <Link
                            href="/login"
                            className="text-amber-900 font-semibold hover:text-amber-700 transition-colors inline-flex items-center gap-1 group"
                        >
                            Sign in
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
