
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Close modal on successful signin
      onClose();
      
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Check your email for the confirmation link",
      });
      
      // Close modal on successful signup
      onClose();
      
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-background rounded-xl p-6 w-full max-w-md flex flex-col gap-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="flex bg-muted rounded-lg p-1 mb-2">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              mode === 'signin' ? 'bg-white shadow' : ''
            }`}
            onClick={() => setMode('signin')}
          >
            Log In
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              mode === 'signup' ? 'bg-white shadow' : ''
            }`}
            onClick={() => setMode('signup')}
          >
            Create Account
          </button>
        </div>
        
        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div className="flex items-center border rounded-lg px-3 py-2">
              <User className="w-5 h-5 text-muted-foreground mr-2" />
              <Input
                type="text"
                placeholder="Name"
                className="border-0 p-0 focus-visible:ring-0 text-base"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={mode === 'signup'}
              />
            </div>
          )}
          
          <div className="flex items-center border rounded-lg px-3 py-2">
            <Mail className="w-5 h-5 text-muted-foreground mr-2" />
            <Input
              type="email"
              placeholder="Email"
              className="border-0 p-0 focus-visible:ring-0 text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center border rounded-lg px-3 py-2">
            <Lock className="w-5 h-5 text-muted-foreground mr-2" />
            <Input
              type="password"
              placeholder="Password"
              className="border-0 p-0 focus-visible:ring-0 text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-6 mt-2 text-base"
            disabled={loading}
          >
            {loading 
              ? "Loading..." 
              : mode === 'signin' 
                ? "Sign In" 
                : "Create Account"
            }
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
