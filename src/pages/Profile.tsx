
import React, { useState, useEffect } from 'react';
import { User, Settings, Bell, CreditCard, Shield, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ThemeCustomizer from '@/components/ThemeCustomizer';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authService, storageService } from '@/lib/appwrite';

const Profile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    currency: 'INR',
    parentAccess: false,
    notifications: {
      email: true,
      expenseReminders: true,
      goalUpdates: false,
      budgetAlerts: true
    },
    preferences: {
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1,23,456.78',
      twoFactor: false,
      biometric: true
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profile = await authService.getUserProfile(user.$id);
      
      if (profile) {
        setUserProfile({
          name: profile.name || user.name || '',
          email: profile.email || user.email || '',
          phoneNumber: profile.phoneNumber || '',
          currency: profile.currency || 'INR',
          parentAccess: profile.parentAccess || false,
          notifications: {
            email: profile.emailNotifications ?? true,
            expenseReminders: profile.expenseReminders ?? true,
            goalUpdates: profile.goalUpdates ?? false,
            budgetAlerts: profile.budgetAlerts ?? true
          },
          preferences: {
            dateFormat: profile.dateFormat || 'DD/MM/YYYY',
            numberFormat: profile.numberFormat || '1,23,456.78',
            twoFactor: profile.twoFactor ?? false,
            biometric: profile.biometric ?? true
          }
        });
        
        if (profile.profileImage) {
          setProfileImage(storageService.getFileView(profile.profileImage));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setUpdating(true);
      
      await authService.updateUserProfile(user.$id, {
        name: userProfile.name,
        phoneNumber: userProfile.phoneNumber,
        currency: userProfile.currency,
        parentAccess: userProfile.parentAccess,
        emailNotifications: userProfile.notifications.email,
        expenseReminders: userProfile.notifications.expenseReminders,
        goalUpdates: userProfile.notifications.goalUpdates,
        budgetAlerts: userProfile.notifications.budgetAlerts,
        dateFormat: userProfile.preferences.dateFormat,
        numberFormat: userProfile.preferences.numberFormat,
        twoFactor: userProfile.preferences.twoFactor,
        biometric: userProfile.preferences.biometric,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const uploadedFile = await storageService.uploadFile(file);
      
      await authService.updateUserProfile(user.$id, {
        profileImage: uploadedFile.$id
      });
      
      setProfileImage(storageService.getFileView(uploadedFile.$id));
      
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "This action cannot be undone. All your data will be permanently deleted.",
      variant: "destructive",
    });
  };

  const handleThemeChange = (colors: any) => {
    toast({
      title: "Theme Updated",
      description: "Your theme colors have been successfully updated.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="w-20 h-20">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt="Profile" />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {userProfile.name.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90">
                  <Upload className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="space-y-3 w-full">
                <div>
                  <Label className="text-sm">Full Name</Label>
                  <Input 
                    value={userProfile.name} 
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <Label className="text-sm">Email</Label>
                  <Input 
                    value={userProfile.email} 
                    disabled
                    className="mt-1 bg-muted" 
                  />
                </div>
                <div>
                  <Label className="text-sm">Phone Number</Label>
                  <Input 
                    value={userProfile.phoneNumber} 
                    onChange={(e) => setUserProfile({ ...userProfile, phoneNumber: e.target.value })}
                    className="mt-1" 
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleUpdateProfile} 
                disabled={updating} 
                className="w-full mt-4"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Settings & Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Customization */}
            <ThemeCustomizer onThemeChange={handleThemeChange} />

            {/* Notifications */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-base">
                <Bell className="w-4 h-4" />
                Notifications
              </h4>
              <div className="space-y-3">
                {[
                  { 
                    key: 'email', 
                    label: 'Email notifications', 
                    checked: userProfile.notifications.email 
                  },
                  { 
                    key: 'expenseReminders', 
                    label: 'Expense reminders', 
                    checked: userProfile.notifications.expenseReminders 
                  },
                  { 
                    key: 'goalUpdates', 
                    label: 'Goal progress updates', 
                    checked: userProfile.notifications.goalUpdates 
                  },
                  { 
                    key: 'budgetAlerts', 
                    label: 'Budget alerts', 
                    checked: userProfile.notifications.budgetAlerts 
                  }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <Label htmlFor={setting.key} className="text-sm">{setting.label}</Label>
                    <Switch 
                      id={setting.key} 
                      checked={setting.checked}
                      onCheckedChange={(checked) => 
                        setUserProfile({
                          ...userProfile,
                          notifications: {
                            ...userProfile.notifications,
                            [setting.key]: checked
                          }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Currency & Format */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4" />
                Currency & Format
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Default Currency</Label>
                  <select 
                    value={userProfile.currency}
                    onChange={(e) => setUserProfile({ ...userProfile, currency: e.target.value })}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Date Format</Label>
                  <select 
                    value={userProfile.preferences.dateFormat}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      preferences: { ...userProfile.preferences, dateFormat: e.target.value }
                    })}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-base">
                <Shield className="w-4 h-4" />
                Security
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Change Password</Label>
                    <p className="text-xs text-muted-foreground">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor" className="text-sm">Two-factor authentication</Label>
                  <Switch 
                    id="two-factor" 
                    checked={userProfile.preferences.twoFactor}
                    onCheckedChange={(checked) => 
                      setUserProfile({
                        ...userProfile,
                        preferences: { ...userProfile.preferences, twoFactor: checked }
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="biometric" className="text-sm">Biometric login</Label>
                  <Switch 
                    id="biometric" 
                    checked={userProfile.preferences.biometric}
                    onCheckedChange={(checked) => 
                      setUserProfile({
                        ...userProfile,
                        preferences: { ...userProfile.preferences, biometric: checked }
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2 text-red-600 text-base">
                <Trash2 className="w-4 h-4" />
                Danger Zone
              </h4>
              <div className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </p>
                      <div className="space-y-2">
                        <Label className="text-sm">Type "DELETE" to confirm</Label>
                        <Input placeholder="DELETE" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          Cancel
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={handleDeleteAccount}>
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
