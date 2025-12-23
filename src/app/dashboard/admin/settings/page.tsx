"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, Users, Activity } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            General Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">System Name</label>
                                <input
                                    type="text"
                                    defaultValue="Inventory Management System"
                                    className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Time Zone</label>
                                <select className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                                    <option>UTC</option>
                                    <option>America/New_York</option>
                                    <option>Europe/London</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Currency</label>
                                <select className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                                    <option>USD ($)</option>
                                    <option>EUR (€)</option>
                                    <option>GBP (£)</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Database Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Connection Status</p>
                                    <p className="text-sm text-gray-600">MongoDB Connected</p>
                                </div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Backup Schedule</p>
                                <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                                    <option>Daily at 2:00 AM</option>
                                    <option>Weekly on Sunday</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            User Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Allow User Registration</span>
                                <input type="checkbox" defaultChecked className="h-4 w-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Email Verification Required</span>
                                <input type="checkbox" defaultChecked className="h-4 w-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                                <input type="checkbox" className="h-4 w-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Low Stock Alerts</span>
                                <input type="checkbox" defaultChecked className="h-4 w-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Order Notifications</span>
                                <input type="checkbox" defaultChecked className="h-4 w-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">Email Notifications</span>
                                <input type="checkbox" className="h-4 w-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
