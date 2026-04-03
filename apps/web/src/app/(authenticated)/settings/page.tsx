'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Bell, Shield, Palette, Globe, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    website: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_generation: true,
    email_downloads: true,
    email_community: false,
    push_generation: true,
    push_downloads: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profile_public: true,
    songs_public: true,
    show_in_leaderboard: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: '',
        website: '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-900 border border-white/5">
          <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-600">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="data-[state=active]:bg-purple-600">
            <Shield className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-slate-900/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-slate-400">
                Update your profile details and public information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white text-2xl font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                  Change Avatar
                </Button>
              </div>
              <Separator className="bg-white/5" />
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Username</label>
                    <Input
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Email</label>
                    <Input
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="w-full h-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Website</label>
                  <Input
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-slate-900/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Email Notifications</CardTitle>
              <CardDescription className="text-slate-400">
                Choose which emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'email_generation', label: 'Generation complete', description: 'Get notified when your music is ready' },
                { key: 'email_downloads', label: 'Download ready', description: 'Receive download links for your tracks' },
                { key: 'email_community', label: 'Community updates', description: 'New features and community highlights' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings] })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationSettings[item.key as keyof typeof notificationSettings]
                        ? 'bg-purple-600'
                        : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        notificationSettings[item.key as keyof typeof notificationSettings]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="bg-slate-900/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white">Privacy Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Control who can see your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'profile_public', label: 'Public profile', description: 'Anyone can see your profile' },
                { key: 'songs_public', label: 'Public songs', description: 'Your songs appear in the explore page' },
                { key: 'show_in_leaderboard', label: 'Leaderboard', description: 'Show your stats on the leaderboard' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                  <button
                    onClick={() => setPrivacySettings({ ...privacySettings, [item.key]: !privacySettings[item.key as keyof typeof privacySettings] })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      privacySettings[item.key as keyof typeof privacySettings]
                        ? 'bg-purple-600'
                        : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        privacySettings[item.key as keyof typeof privacySettings]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-white text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-slate-400">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="bg-red-900 hover:bg-red-800 text-white">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="flex items-center text-green-400 text-sm">
            <Check className="w-4 h-4 mr-1" />
            Saved
          </span>
        )}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
