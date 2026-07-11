"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Package } from "lucide-react";

function ResetPasswordForm() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (password !== confirm) {
            toast.error("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            await authService.resetPassword(token, password);
            toast.success("Password reset — please log in");
            router.push("/login");
        } catch (err: any) {
            toast.error(err?.error?.message || "Reset failed. The link may have expired.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center space-y-3">
                <p className="text-gray-700">This reset link is missing its token.</p>
                <Link href="/forgot-password" className="text-amber-800 hover:underline">Request a new link</Link>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full h-11 bg-amber-900 hover:bg-amber-800" disabled={loading}>
                {loading ? "Resetting…" : "Reset password"}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f4f1ea" }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-800/10 border border-amber-900/20 mb-3">
                        <Package className="w-7 h-7 text-amber-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-amber-950">Choose a new password</h1>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-amber-900/10 p-6">
                    <Suspense fallback={<p className="text-gray-500 text-center">Loading…</p>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
