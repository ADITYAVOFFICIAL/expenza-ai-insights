
import React from 'react';
import { User, Settings, Bell, CreditCard, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ParentAccess from '@/components/ParentAccess';
import ThemeCustomizer from '@/components/ThemeCustomizer';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
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
              <Avatar className="w-20 h-20 mb-4">
                <AvatarFallback className="text-lg">JD</AvatarFallback>
              </Avatar>
              <div className="space-y-3 w-full">
                <div>
                  <Label className="text-sm">Full Name</Label>
                  <Input defaultValue="John Doe" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Email</Label>
                  <Input defaultValue="john.doe@example.com" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm">Phone Number</Label>
                  <Input defaultValue="+91 9876543210" className="mt-1" />
                </div>
              </div>
              <div className="flex gap-2 mt-4 w-full">
                <Button variant="outline" size="sm" className="flex-1">
                  Change Photo
                </Button>
                <Button size="sm" className="flex-1">
                  Save Changes
                </Button>
              </div>
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
                  { id: 'email-notifications', label: 'Email notifications', defaultChecked: true },
                  { id: 'expense-reminders', label: 'Expense reminders', defaultChecked: true },
                  { id: 'goal-updates', label: 'Goal progress updates', defaultChecked: false },
                  { id: 'budget-alerts', label: 'Budget alerts', defaultChecked: true }
                ].map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <Label htmlFor={setting.id} className="text-sm">{setting.label}</Label>
                    <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
                  </div>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4" />
                Currency & Format
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'Default Currency', value: 'INR (₹)' },
                  { label: 'Date Format', value: 'DD/MM/YYYY' },
                  { label: 'Number Format', value: '1,23,456.78' }
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Label className="text-sm">{setting.label}</Label>
                    <Button variant="outline" size="sm" className="text-xs">
                      {setting.value}
                    </Button>
                  </div>
                ))}
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
                  <Switch id="two-factor" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="biometric" className="text-sm">Biometric login</Label>
                  <Switch id="biometric" defaultChecked />
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

      {/* Parent Access */}
      <ParentAccess />
    </div>
  );
};

export default Profile;
