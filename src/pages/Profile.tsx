import React, { useState, useEffect, useCallback } from 'react';
import { User, Settings, CreditCard, Shield, Upload, KeyRound } from 'lucide-react'; // Added KeyRound
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Added DialogClose
} from '@/components/ui/dialog';
import ThemeCustomizer from '@/components/ThemeCustomizer';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authService, storageService } from '@/lib/appwrite';

const Profile = () => {
  const { user, refreshUser } = useAuth(); // Added refreshUser
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    currency: 'INR',
    occupation: '',
    age: '',
    idealRetirementAge: '',
    country: '',
    // Theme fields are not directly managed here, but loaded from AuthContext
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [avatarUrl, setavatarUrl] = useState<string | null>(null);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const loadUserProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // User object from AuthContext should now have all details
      // If not, fetch specifically using authService.getUserProfile
      let profileDoc = user; // Assuming user from context is up-to-date
      
      // Fallback if user from context is not fully populated (e.g., direct navigation)
      if (!user.occupation && user.$id) { 
          const dbProfile = await authService.getUserProfile(user.$id);
          if (dbProfile) {
            profileDoc = { ...user, ...dbProfile };
          }
      }


      if (profileDoc) {
        setUserProfile({
          name: profileDoc.name || '',
          email: profileDoc.email || '',
          currency: (profileDoc as any).currency || 'INR',
          occupation: (profileDoc as any).occupation || '',
          age: (profileDoc as any).age?.toString() || '',
          idealRetirementAge: (profileDoc as any).idealRetirementAge?.toString() || '',
          country: (profileDoc as any).country || '',
        });

        if ((profileDoc as any).avatarUrl) {
          // If avatarUrl in profileDoc is just an ID, resolve it
          // If it's already a URL (from AuthContext), use it directly
          if (typeof (profileDoc as any).avatarUrl === 'string' && !(profileDoc as any).avatarUrl.startsWith('http')) {
            setavatarUrl(storageService.getFileView((profileDoc as any).avatarUrl as string).toString());
          } else {
            setavatarUrl((profileDoc as any).avatarUrl);
          }
        }
      } else {
        // This case should be less likely if AuthContext is robust
        setUserProfile(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
        }));
         toast({
          title: "Profile Incomplete",
          description: "Using default information as full profile could not be loaded.",
          variant: "warning",
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error Loading Profile",
        description: `Failed to load profile data: ${error.message || 'Unknown error'}.`,
        variant: "destructive",
      });
      setUserProfile(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
      }));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserProfile();
  }, [user, loadUserProfile]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setUpdating(true);
      const ageNumber = userProfile.age ? parseInt(userProfile.age, 10) : undefined;
      const idealRetirementAgeNumber = userProfile.idealRetirementAge ? parseInt(userProfile.idealRetirementAge, 10) : undefined;

      if (userProfile.age && (isNaN(ageNumber as number) || (ageNumber as number) < 0)) {
        toast({ title: "Invalid Age", description: "Please enter a valid age.", variant: "destructive" });
        setUpdating(false);
        return;
      }
      if (userProfile.idealRetirementAge && (isNaN(idealRetirementAgeNumber as number) || (idealRetirementAgeNumber as number) < 0)) {
        toast({ title: "Invalid Retirement Age", description: "Please enter a valid ideal retirement age.", variant: "destructive" });
        setUpdating(false);
        return;
      }

      await authService.updateUserProfile(user.$id, {
        name: userProfile.name,
        currency: userProfile.currency,
        occupation: userProfile.occupation,
        age: ageNumber,
        idealRetirementAge: idealRetirementAgeNumber,
        country: userProfile.country,
      });
      await refreshUser(); // Refresh user data in AuthContext

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. The document might be missing or there was a server error.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    let oldAvatarId: string | undefined;

    try {
      setUpdating(true);

      // Get current profile to find old avatar ID
      const currentProfile = await authService.getUserProfile(user.$id);
      if (currentProfile && currentProfile.avatarUrl) {
        oldAvatarId = currentProfile.avatarUrl;
      }

      const uploadedFile = await storageService.uploadFile(file, user.$id); 

      await authService.updateUserProfile(user.$id, {
        avatarUrl: uploadedFile.$id
      });
      await refreshUser(); // Refresh user data in AuthContext

      setavatarUrl(storageService.getFileView(uploadedFile.$id).toString()); 

      // If there was an old avatar, delete it
      if (oldAvatarId && oldAvatarId !== uploadedFile.$id) {
        try {
          await storageService.deleteFile(oldAvatarId);
          console.log(`Old avatar ${oldAvatarId} deleted successfully.`);
        } catch (deleteError) {
          console.error("Error deleting old avatar:", deleteError);
          // Non-critical, proceed with success toast for new avatar
        }
      }

      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion Requested",
      description: "This action cannot be undone. All your data will be permanently deleted. (This is a demo - no actual deletion)",
      variant: "destructive",
    });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "New password must be at least 8 characters long.", variant: "destructive" });
      return;
    }
    if (!oldPassword) {
      toast({ title: "Error", description: "Current password is required.", variant: "destructive" });
      return;
    }

    setPasswordUpdating(true);
    try {
      await authService.updatePassword(newPassword, oldPassword);
      toast({ title: "Success", description: "Password updated successfully." });
      setShowPasswordDialog(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({ title: "Error", description: error.message || "Failed to update password.", variant: "destructive" });
    } finally {
      setPasswordUpdating(false);
    }
  };

  interface ThemeColors {
    name: string; // Added name to ThemeColors for onThemeChange
    primary: string;
    accent: string;
  }

  const handleThemeChange = (colors: ThemeColors) => { // colors will be { name, primary, accent }
    if (user?.$id) {
      // updateUserThemePreferences is now part of AuthContext
      // It will handle DB update and local state update
      // No need to call refreshUser() here as updateUserThemePreferences should update context
    }
    toast({
      title: "Theme Updated",
      description: `Your theme colors have been successfully updated. Primary: ${colors.primary}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="w-20 h-20">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Profile" />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {userProfile.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
                    disabled={updating}
                  />
                </label>
              </div>

              <div className="space-y-3 w-full">
                <div>
                  <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                  <Input
                    id="fullName"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    value={userProfile.email}
                    disabled
                    className="mt-1 bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-sm">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={userProfile.age}
                    onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., 30"
                  />
                </div>
                <div>
                  <Label htmlFor="occupation" className="text-sm">Occupation</Label>
                  <Input
                    id="occupation"
                    value={userProfile.occupation}
                    onChange={(e) => setUserProfile({ ...userProfile, occupation: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="idealRetirementAge" className="text-sm">Ideal Retirement Age</Label>
                  <Input
                    id="idealRetirementAge"
                    type="number"
                    value={userProfile.idealRetirementAge}
                    onChange={(e) => setUserProfile({ ...userProfile, idealRetirementAge: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., 60"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  {/* Consider using a Select component for countries if you have a predefined list */}
                  <Input
                    id="country"
                    value={userProfile.country}
                    onChange={(e) => setUserProfile({ ...userProfile, country: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., India"
                  />
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={updating}
                className="w-full mt-6"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Settings & Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ThemeCustomizer onThemeChange={handleThemeChange} />

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4" />
                Currency & Format
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="defaultCurrency" className="text-sm font-normal">Default Currency</Label>
                  <select
                    id="defaultCurrency"
                    value={userProfile.currency}
                    onChange={(e) => setUserProfile({ ...userProfile, currency: e.target.value })}
                    className="text-sm border rounded px-2 py-1 bg-input text-foreground"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-base">
                <Shield className="w-4 h-4" />
                Security
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-normal">Change Password</Label>
                    <p className="text-xs text-muted-foreground">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)}>
                    Change
                  </Button>
                </div>
              </div>
            </div>
            {/* Danger Zone Removed */}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" /> Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 8 characters)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={passwordUpdating}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleChangePassword} disabled={passwordUpdating}>
              {passwordUpdating ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
