
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
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "This action cannot be undone. All your data will be permanently deleted.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarFallback className="text-lg">JD</AvatarFallback>
              </Avatar>
              <div className="space-y-2 w-full">
                <div>
                  <Label>Full Name</Label>
                  <Input defaultValue="John Doe" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input defaultValue="john.doe@example.com" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input defaultValue="+91 9876543210" />
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
            <CardTitle>Settings & Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notifications */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email notifications</Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="expense-reminders">Expense reminders</Label>
                  <Switch id="expense-reminders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="goal-updates">Goal progress updates</Label>
                  <Switch id="goal-updates" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="budget-alerts">Budget alerts</Label>
                  <Switch id="budget-alerts" defaultChecked />
                </div>
              </div>
            </div>

            {/* Currency */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Currency & Format
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Default Currency</Label>
                  <Button variant="outline" size="sm">INR (₹)</Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Date Format</Label>
                  <Button variant="outline" size="sm">DD/MM/YYYY</Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Number Format</Label>
                  <Button variant="outline" size="sm">1,23,456.78</Button>
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Security
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Change Password</Label>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor">Two-factor authentication</Label>
                  <Switch id="two-factor" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="biometric">Biometric login</Label>
                  <Switch id="biometric" defaultChecked />
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="profile-visibility">Profile visibility</Label>
                  <Switch id="profile-visibility" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="expense-sharing">Allow expense sharing</Label>
                  <Switch id="expense-sharing" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics-sharing">Share analytics data</Label>
                  <Switch id="analytics-sharing" />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2 text-red-600">
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
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </p>
                      <div className="space-y-2">
                        <Label>Type "DELETE" to confirm</Label>
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
