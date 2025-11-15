"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Settings,
  Lock,
  Bell,
  User,
  Palette,
  Shield,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const features = [
    {
      icon: User,
      title: "Profile Settings",
      description: "Manage your personal information and preferences",
    },
    {
      icon: Lock,
      title: "Security",
      description: "Two-factor authentication and password management",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Customize your notification preferences",
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Theme customization and display options",
    },
    {
      icon: Shield,
      title: "Privacy",
      description: "Control your data and privacy settings",
    },
  ];

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm bg-white">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-3xl shadow-2xl">
                <Settings
                  className="size-16 text-white animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </div>
            </div>

            <div className="mb-4 flex items-center gap-x-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <Sparkles className="size-6 text-purple-500" />
            </div>

            <p className="text-xl text-gray-600 mb-2">Coming Soon!</p>
            <p className="text-gray-500 max-w-md mb-12">
              We&apos;re working hard to bring you powerful settings and
              customization options. Stay tuned for exciting updates!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="size-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
