"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Copy, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function SecurityPage() {
    return (
        <ProtectedRoute>
            <SecurityContent />
        </ProtectedRoute>
    );
}

function SecurityContent() {
    const { user } = useAuth();
    // The user record from /auth/me carries mfaEnabled; fall back to false.
    const [mfaEnabled, setMfaEnabled] = useState<boolean>(!!user?.mfaEnabled);

    const [setup, setSetup] = useState<{ secret: string; otpauthUri: string } | null>(null);
    const [code, setCode] = useState("");
    const [disableCode, setDisableCode] = useState("");
    const [busy, setBusy] = useState(false);

    const beginSetup = async () => {
        setBusy(true);
        try {
            const result = await authService.setupMfa();
            setSetup(result);
        } catch (e: any) {
            toast.error(e?.error?.message || "Failed to start MFA setup");
        } finally {
            setBusy(false);
        }
    };

    const confirmEnable = async () => {
        if (code.length !== 6) return;
        setBusy(true);
        try {
            await authService.enableMfa(code);
            setMfaEnabled(true);
            setSetup(null);
            setCode("");
            toast.success("Two-factor authentication enabled");
        } catch (e: any) {
            toast.error(e?.error?.message || "Invalid code — try again");
        } finally {
            setBusy(false);
        }
    };

    const disable = async () => {
        if (disableCode.length !== 6) return;
        setBusy(true);
        try {
            await authService.disableMfa(disableCode);
            setMfaEnabled(false);
            setDisableCode("");
            toast.success("Two-factor authentication disabled");
        } catch (e: any) {
            toast.error(e?.error?.message || "Invalid code");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-7 h-7 text-blue-600" />
                    Security
                </h1>
                <p className="text-gray-600 mt-1">Manage two-factor authentication for your account.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-blue-600" />
                            Authenticator app (TOTP)
                        </span>
                        {mfaEnabled ? <Badge variant="success">Enabled</Badge> : <Badge variant="default">Off</Badge>}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mfaEnabled ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                                Two-factor is on. You&apos;ll be asked for a 6-digit code at login. To turn it
                                off, confirm with a current code.
                            </p>
                            <div className="flex items-end gap-2">
                                <div>
                                    <Label htmlFor="disableCode">Current code</Label>
                                    <Input
                                        id="disableCode"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={disableCode}
                                        onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                                        placeholder="123456"
                                        className="w-32 tracking-widest text-center"
                                    />
                                </div>
                                <Button variant="destructive" onClick={disable} disabled={busy || disableCode.length !== 6}>
                                    Disable 2FA
                                </Button>
                            </div>
                        </div>
                    ) : setup ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Add this secret to your authenticator app (Google Authenticator, Authy, 1Password…),
                                then enter the 6-digit code it shows to finish.
                            </p>
                            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                                <p className="text-xs text-gray-500 mb-1">Secret</p>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-sm break-all flex-1">{setup.secret}</code>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(setup.secret);
                                            toast.success("Secret copied");
                                        }}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 break-all">{setup.otpauthUri}</p>
                            </div>
                            <div className="flex items-end gap-2">
                                <div>
                                    <Label htmlFor="code">Code from app</Label>
                                    <Input
                                        id="code"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                        placeholder="123456"
                                        className="w-32 tracking-widest text-center"
                                    />
                                </div>
                                <Button onClick={confirmEnable} disabled={busy || code.length !== 6}>
                                    Verify &amp; enable
                                </Button>
                                <Button variant="ghost" onClick={() => setSetup(null)}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                                Add a second factor so a stolen password isn&apos;t enough to sign in.
                            </p>
                            <Button onClick={beginSetup} disabled={busy}>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Set up two-factor authentication
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
