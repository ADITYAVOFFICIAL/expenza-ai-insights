
import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

const ParentAccess: React.FC = () => {
  const [parentAccessEnabled, setParentAccessEnabled] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [accessCode] = useState('PAR-2024-8539'); // Mock access code

  const handleEnableParentAccess = () => {
    if (!parentEmail) {
      toast({
        title: "Email Required",
        description: "Please enter parent's email address.",
        variant: "destructive",
      });
      return;
    }

    setParentAccessEnabled(true);
    toast({
      title: "Parent Access Enabled",
      description: "Parent access has been granted. Share the access code securely.",
    });
  };

  const handleDisableParentAccess = () => {
    setParentAccessEnabled(false);
    setParentEmail('');
    toast({
      title: "Parent Access Disabled",
      description: "Parent access has been revoked.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Parent Access Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Parent access allows designated guardians to view your expense data for financial guidance and monitoring.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Enable Parent Access</Label>
            <p className="text-sm text-muted-foreground">
              Allow parents to view your expenses and provide financial guidance
            </p>
          </div>
          <Switch
            checked={parentAccessEnabled}
            onCheckedChange={parentAccessEnabled ? handleDisableParentAccess : () => {}}
          />
        </div>

        {!parentAccessEnabled && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="parent-email">Parent's Email Address</Label>
              <Input
                id="parent-email"
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleEnableParentAccess} className="w-full">
              Enable Parent Access
            </Button>
          </div>
        )}

        {parentAccessEnabled && (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                Parent access is active for: {parentEmail}
              </p>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                Access Code
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAccessCode(!showAccessCode)}
                >
                  {showAccessCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </Label>
              <Input
                type={showAccessCode ? 'text' : 'password'}
                value={accessCode}
                readOnly
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Share this code with your parent for access verification
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Parent Permissions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>View all expenses</Label>
                  <Switch defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label>View spending analytics</Label>
                  <Switch defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label>View goal progress</Label>
                  <Switch defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Receive spending alerts</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <Button 
              variant="destructive" 
              onClick={handleDisableParentAccess}
              className="w-full"
            >
              Revoke Parent Access
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParentAccess;
