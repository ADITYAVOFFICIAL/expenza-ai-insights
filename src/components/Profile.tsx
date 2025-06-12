
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Phone, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Profile</h1>
          <p className="text-slate-600">Manage your account settings</p>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-xl text-slate-800">John Doe</CardTitle>
          <p className="text-slate-600">Premium Member</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
              <Mail className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-medium text-slate-800">john.doe@example.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
              <Phone className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Phone</p>
                <p className="font-medium text-slate-800">+91 9876543210</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start rounded-xl border-slate-300">
              <Settings className="w-4 h-4 mr-3" />
              Account Settings
            </Button>
            
            <Button variant="outline" className="w-full justify-start rounded-xl border-slate-300">
              <Shield className="w-4 h-4 mr-3" />
              Privacy & Security
            </Button>
            
            <Button variant="destructive" className="w-full justify-start rounded-xl">
              <User className="w-4 h-4 mr-3" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
