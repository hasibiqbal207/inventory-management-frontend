"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Package, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [devToken, setDevToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const res = await authService.forgotPassword(email);
            setSent(true);
            // In dev (SMTP not configured) the token comes back so the flow is testable.
            if (res?.devResetToken) setDevToken(res.devResetToken);
        } catch (err: any) {
            toast.error(err?.error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f4f1ea" }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-800/10 border border-amber-900/20 mb-3">
                        <Package className="w-7 h-7 text-amber-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-amber-950">Reset your password</h1>
                    <p className="text-amber-900/70 mt-1">We&apos;ll send a reset link if the email exists.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-amber-900/10 p-6">
                    {sent ? (
                        <div className="space-y-4 text-center">
                            <p className="text-gray-700">
                                If <span className="font-medium">{email}</span> has an account, a reset link is on its way.
                            </p>
                            {devToken && (
                                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-left">
                                    <p className="text-xs text-amber-800 font-medium mb-1">Dev mode (SMTP not configured) — use this link:</p>
                                    <Link href={`/reset-password?token=${devToken}`} className="text-sm text-blue-600 break-all hover:underline">
                                        /reset-password?token={devToken}
                                    </Link>
                                </div>
                            )}
                            <Link href="/login" className="inline-flex items-center text-amber-800 hover:underline">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
                            </div>
                            <Button type="submit" className="w-full h-11 bg-amber-900 hover:bg-amber-800" disabled={loading || !email}>
                                {loading ? "Sending…" : "Send reset link"}
                            </Button>
                            <Link href="/login" className="block text-center text-sm text-amber-800 hover:underline">
                                Back to login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
