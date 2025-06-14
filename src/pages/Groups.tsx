import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Settings, Crown, DollarSign, AlertTriangle, Edit, Trash2, Image as ImageIcon, Globe , Badge} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService, COLLECTIONS, storageService } from '@/lib/appwrite';
import { toast } from '@/hooks/use-toast';
import { Models, ID } from 'appwrite';
import { Expense } from '@/types/expense';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

interface GroupExpense extends Expense {
  // Inherits from Expense
}

// Updated Group interface based on new Appwrite attributes
interface Group extends Models.Document {
  name: string;
  description?: string;
  members: string[]; // Array of user IDs
  adminUserIds: string[]; // Array of admin user IDs
  createdBy: string; // User ID of the creator
  currency: string; // Default 'INR'
  avatarUrl?: string; // URL string for group avatar
  // UI-derived or fetched separately
  membersToDisplay?: string[];
  isAdmin?: boolean;
  totalExpenses?: number;
  recentExpenses?: GroupExpense[];
  displayAvatarUrl?: string; // Processed avatar URL for display
}

const initialGroupFormState = {
  name: '',
  description: '',
  membersString: '',
  currency: 'INR',
  avatarFile: null as File | null,
  existingAvatarUrl: '' as string | undefined,
};

const Groups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [currentEditingGroupId, setCurrentEditingGroupId] = useState<string | null>(null);
  const [groupFormData, setGroupFormData] = useState(initialGroupFormState);

  const fetchGroupsAndExpenses = useCallback(async () => {
    if (!user?.$id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const groupResponse = await databaseService.getGroups(user.$id);
  const fetchedGroupsPromises = groupResponse.documents.map(async (doc) => {
    const groupDoc = doc as Group;
    let totalExpenses = 0;
    let recentExpenses: GroupExpense[] = [];
    let displayAvatarUrl: string | undefined = undefined;

    if (groupDoc.avatarUrl) {
      try {
        displayAvatarUrl = storageService.getFilePreview(groupDoc.avatarUrl).toString(); // Remove width and height arguments
      } catch (e) {
        console.warn("Failed to get avatar preview for group:", groupDoc.name, e)
      }
    }

    try {
          const expenseResponse = await databaseService.getGroupExpenses(groupDoc.$id, 50);
          recentExpenses = expenseResponse.documents.slice(0, 3).map(exDoc => ({
            ...exDoc,
            amount: Number(exDoc.amount),
            date: exDoc.date || exDoc.$createdAt,
          })) as GroupExpense[];
          totalExpenses = expenseResponse.documents.reduce((sum, ex) => sum + Number(ex.amount), 0);
        } catch (expenseError) {
          console.error(`Failed to fetch expenses for group ${groupDoc.$id}:`, expenseError);
        }

        return {
          ...groupDoc,
          isAdmin: groupDoc.adminUserIds.includes(user.$id),
          membersToDisplay: groupDoc.members.map(id => id === user.$id ? 'You' : id),
          totalExpenses,
          recentExpenses,
          displayAvatarUrl,
        };
      });

      const resolvedGroups = await Promise.all(fetchedGroupsPromises);
      setGroups(resolvedGroups as Group[]);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      toast({ title: 'Error', description: 'Could not fetch groups.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGroupsAndExpenses();
  }, [fetchGroupsAndExpenses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGroupFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGroupFormData(prev => ({ ...prev, avatarFile: e.target.files![0] }));
    }
  };

  const handleSubmitGroup = async () => {
    if (!user?.$id) return;

    if (!groupFormData.name.trim()) {
      toast({ title: 'Validation Error', description: 'Group name is required.', variant: 'destructive' });
      return;
    }
    setProcessing(true);

    let uploadedAvatarFileId: string | undefined = groupFormData.existingAvatarUrl;

    if (groupFormData.avatarFile) {
      try {
        // If there was an old avatar and we're uploading a new one, delete the old one first
        if (isEditingGroup && currentEditingGroupId && groupFormData.existingAvatarUrl) {
            const oldGroup = groups.find(g => g.$id === currentEditingGroupId);
            if (oldGroup?.avatarUrl) {
                 try { await storageService.deleteFile(oldGroup.avatarUrl); }
                 catch (e) { console.warn("Could not delete old avatar", e); }
            }
        }
        const uploadedFile = await storageService.uploadFile(groupFormData.avatarFile);
        uploadedAvatarFileId = uploadedFile.$id;
      } catch (error) {
        console.error('Failed to upload group avatar:', error);
        toast({ title: 'Avatar Upload Error', description: 'Could not upload group avatar.', variant: 'destructive' });
        setProcessing(false);
        return;
      }
    }


    const memberInputs = groupFormData.membersString.split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);
    const finalMembers = Array.from(new Set([user.$id, ...memberInputs]));

    const groupPayload: any = {
      name: groupFormData.name.trim(),
      description: groupFormData.description.trim() || undefined,
      members: finalMembers,
      currency: groupFormData.currency || 'INR',
      avatarUrl: uploadedAvatarFileId,
    };

    try {
      if (isEditingGroup && currentEditingGroupId) {
        // For update, adminUserIds and createdBy are generally not changed by this form
        // Only update fields that are part of the form
        const updatePayload = {
            name: groupPayload.name,
            description: groupPayload.description,
            members: groupPayload.members, // Allow members update
            currency: groupPayload.currency,
            avatarUrl: groupPayload.avatarUrl,
        };
        await databaseService.updateDocument(COLLECTIONS.GROUPS, currentEditingGroupId, updatePayload);
        toast({ title: 'Success', description: 'Group updated successfully.' });
      } else {
        // For new group
        groupPayload.adminUserIds = [user.$id]; // Creator is the first admin
        groupPayload.createdBy = user.$id;
        await databaseService.createGroup(groupPayload);
        toast({ title: 'Success', description: 'Group created successfully.' });
      }
      setShowGroupDialog(false);
      fetchGroupsAndExpenses();
    } catch (error) {
      console.error(`Failed to ${isEditingGroup ? 'update' : 'create'} group:`, error);
      toast({ title: 'Error', description: `Could not ${isEditingGroup ? 'update' : 'create'} group.`, variant: 'destructive' });
    } finally {
      setProcessing(false);
      setGroupFormData(initialGroupFormState); // Reset form
      setCurrentEditingGroupId(null);
      setIsEditingGroup(false);
    }
  };
  
  const handleOpenCreateDialog = () => {
    setIsEditingGroup(false);
    setCurrentEditingGroupId(null);
    setGroupFormData(initialGroupFormState);
    setShowGroupDialog(true);
  };

  const handleOpenEditDialog = (group: Group) => {
    setIsEditingGroup(true);
    setCurrentEditingGroupId(group.$id);
    setGroupFormData({
      name: group.name,
      description: group.description || '',
      membersString: group.members.filter(id => id !== user?.$id).join(', '),
      currency: group.currency || 'INR',
      avatarFile: null,
      existingAvatarUrl: group.avatarUrl, // Store existing avatar ID to avoid re-upload if not changed
    });
    setShowGroupDialog(true);
  };

  const handleDeleteGroup = async (groupId: string, avatarUrl?: string) => {
    const group = groups.find(g => g.$id === groupId);
    if (!group || !group.adminUserIds.includes(user?.$id || '')) {
        toast({ title: "Unauthorized", description: "Only an admin can delete this group.", variant: "destructive" });
        return;
    }
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    
    setProcessing(true);
    try {
      if (avatarUrl) {
        try { await storageService.deleteFile(avatarUrl); }
        catch (e) { console.warn("Could not delete group avatar during group deletion:", e); }
      }
      await databaseService.deleteDocument(COLLECTIONS.GROUPS, groupId);
      // Note: Expenses associated with this groupId are not automatically deleted.
      // This would require additional logic if desired.
      toast({ title: 'Success', description: 'Group deleted successfully.' });
      fetchGroupsAndExpenses();
    } catch (error) {
      console.error('Failed to delete group:', error);
      toast({ title: 'Error', description: 'Could not delete group.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddExpenseToGroup = (groupId: string) => {
    navigate(`/add-expense?groupId=${groupId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Groups</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Manage shared expenses with friends</p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="w-full sm:w-auto" disabled={processing}>
          <Plus className="w-4 h-4 mr-2" /> Create Group
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Active Groups</div>
                    <div className="text-xl font-bold">{groups.length}</div>
                </div>
            </div>
        </CardContent>
      </Card>

      {groups.length === 0 && !isLoading && (
         <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-1">No Groups Yet</h3>
            <p className="text-sm">Create a group to start sharing expenses with others.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {groups.map((group) => (
          <Card key={group.$id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        {group.displayAvatarUrl ? <AvatarImage src={group.displayAvatarUrl} alt={group.name} /> : null}
                        <AvatarFallback><Users className="w-5 h-5"/></AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        {group.isAdmin && <Badge variant="outline" className="mt-1 text-xs border-yellow-500 text-yellow-600"><Crown className="w-3 h-3 mr-1 text-yellow-500" />Admin</Badge>}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {group.isAdmin && (
                        <>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(group)} disabled={processing} title="Edit Group">
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.$id, group.avatarUrl)} disabled={processing} className="text-destructive hover:text-destructive/90" title="Delete Group">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        </>
                    )}
                     <Button variant="ghost" size="icon" onClick={() => toast({title: "Info", description: "Detailed group settings not implemented yet."})} title="Group Settings">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
              </div>
              {group.description && <p className="text-sm text-muted-foreground pt-2">{group.description}</p>}
            </CardHeader>
            <CardContent><div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Members ({group.members.length})</div>
                <div className="flex flex-wrap gap-2">
                  {(group.membersToDisplay || group.members).map((memberIdOrName, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md">
                      <Avatar className="w-5 h-5"><AvatarFallback className="text-xs">{typeof memberIdOrName === 'string' ? memberIdOrName.charAt(0).toUpperCase() : '?'}</AvatarFallback></Avatar>
                      <span className="text-sm">{memberIdOrName}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                    <div className="font-semibold">{group.currency} {(group.totalExpenses || 0).toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Currency</div>
                    <div className="font-semibold">{group.currency}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Recent Expenses</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(group.recentExpenses && group.recentExpenses.length > 0) ? group.recentExpenses.map((expense) => (
                    <div key={expense.$id} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded-md">
                      <div>
                        <div className="font-medium">{expense.name || 'Expense'}</div>
                        <div className="text-xs text-muted-foreground">
                          Paid by {expense.userId === user?.$id ? 'You' : (expense.userId || 'Unknown')} on {format(parseISO(expense.date), 'MMM dd')}
                        </div>
                      </div>
                      <div className="font-medium">{group.currency} {expense.amount.toLocaleString()}</div>
                    </div>
                  )) : <p className="text-xs text-muted-foreground">No recent expenses in this group.</p>}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleAddExpenseToGroup(group.$id)}>Add Expense</Button>
              </div>
            </div></CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Group Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={(isOpen) => {
          if (processing && !isOpen) return;
          setShowGroupDialog(isOpen);
          if (!isOpen) {
            setIsEditingGroup(false);
            setGroupFormData(initialGroupFormState);
            setCurrentEditingGroupId(null);
          }
      }}>
        <DialogContent className='dark:text-foreground'>
          <DialogHeader><DialogTitle>{isEditingGroup ? 'Edit' : 'Create New'} Group</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
                <Label htmlFor="groupName">Group Name *</Label>
                <Input id="groupName" name="name" value={groupFormData.name} onChange={handleInputChange} placeholder="e.g., Weekend Trip" />
            </div>
            <div>
                <Label htmlFor="groupDescription">Description</Label>
                <Textarea id="groupDescription" name="description" value={groupFormData.description} onChange={handleInputChange} placeholder="Brief description of the group" />
            </div>
            <div>
                <Label htmlFor="groupMembers">Add Members (comma separated user IDs/emails)</Label>
                <Input id="groupMembers" name="membersString" value={groupFormData.membersString} onChange={handleInputChange} placeholder="e.g., user_id_1, friend@example.com" />
                <p className="text-xs text-muted-foreground mt-1">You will be automatically added.</p>
            </div>
            <div>
                <Label htmlFor="groupCurrency">Currency</Label>
                <select id="groupCurrency" name="currency" value={groupFormData.currency} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded-md bg-background">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    {/* Add more currencies as needed */}
                </select>
            </div>
            <div>
                <Label htmlFor="groupAvatar">Group Avatar (Optional)</Label>
                <Input id="groupAvatar" name="avatarFile" type="file" accept="image/*" onChange={handleAvatarFileChange} className="mt-1" />
                {isEditingGroup && groupFormData.existingAvatarUrl && !groupFormData.avatarFile && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        Current avatar: <ImageIcon className="inline w-4 h-4 mr-1" /> 
                        {groupFormData.existingAvatarUrl.substring(0,20)}... 
                        (upload new to replace)
                    </div>
                )}
                 {groupFormData.avatarFile && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        New avatar selected: {groupFormData.avatarFile.name}
                    </div>
                )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={processing}>Cancel</Button></DialogClose>
            <Button type="submit" onClick={handleSubmitGroup} disabled={processing}>
                {processing ? (isEditingGroup ? 'Saving...' : 'Creating...') : (isEditingGroup ? 'Save Changes' : 'Create Group')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Groups;
