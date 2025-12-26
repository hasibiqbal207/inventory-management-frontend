"use client";

import { ModuleGuide } from "@/config/module-guides";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Lightbulb, Zap } from "lucide-react";

interface ModuleGuideCardProps {
    guide: ModuleGuide;
}

export function ModuleGuideCard({ guide }: ModuleGuideCardProps) {
    const Icon = guide.icon;

    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 border-border">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{guide.title}</CardTitle>
                        </div>
                    </div>
                </div>
                <CardDescription className="mt-2">
                    {guide.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Quick Actions */}
                {guide.quickActions.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Quick Actions
                        </div>
                        <div className="space-y-2">
                            {guide.quickActions.map((action, index) => (
                                <Link
                                    key={index}
                                    href={action.href}
                                    className="block group"
                                >
                                    <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all duration-200">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                {action.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {action.description}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tips */}
                {guide.tips.length > 0 && (
                    <div className="space-y-3 mt-auto pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Pro Tips
                        </div>
                        <ul className="space-y-2">
                            {guide.tips.map((tip, index) => (
                                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span className="flex-1">{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
