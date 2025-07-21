import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ArrowLeft, Trash2, Key, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Account() {
  const { user, signOut } = useAuth()
  const { profile, loading, updateProfile } = useProfile()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    display_name: profile?.display_name || '',
  })
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [emailForReset, setEmailForReset] = useState(user?.email || '')
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    
    try {
      await updateProfile(formData)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!emailForReset) {
      toast.error('Please enter your email address')
      return
    }

    setIsResettingPassword(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailForReset, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast.success('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      console.error('Error sending password reset:', error)
      toast.error('Failed to send password reset email')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Note: Supabase doesn't have a direct delete user method from client
      // In production, you'd typically have an edge function for this
      toast.info('Account deletion requested. Please contact support to complete this process.')
      
      // For now, just sign out the user
      await signOut()
      navigate('/')
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    }
  }

  // Update form data when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        display_name: profile.display_name || '',
      })
    }
  })

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and display preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="How you'd like to be addressed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed directly. Contact support if needed.
              </p>
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email_reset">Email for Password Reset</Label>
            <Input
              id="email_reset"
              type="email"
              value={emailForReset}
              onChange={(e) => setEmailForReset(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          
          <Button 
            onClick={handlePasswordReset} 
            disabled={isResettingPassword}
            variant="outline"
            className="w-full"
          >
            <Mail className="w-4 h-4 mr-2" />
            {isResettingPassword ? 'Sending...' : 'Send Password Reset Email'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will affect your account permanently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your subscription data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}