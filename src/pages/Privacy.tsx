
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeftIcon size={16} />
              <span>Back to App</span>
            </Button>
          </Link>
        </div>
        
        <div className="glass-panel p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
          
          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">Information We Collect</h2>
              <p>
                GYMA App collects minimal information required to improve your workout experience. 
                This includes anonymous usage statistics, device information, and workout patterns.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">How We Use Your Information</h2>
              <p>
                We use collected information to improve the app's functionality, optimize workout recommendations, 
                and enhance the overall user experience. Your workout data is stored locally on your device 
                unless you choose to create an account and sync your data.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">Data Storage</h2>
              <p>
                For users who create accounts, we store workout data securely in our database. 
                This data is not shared with third parties for marketing purposes.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">Analytics</h2>
              <p>
                We use anonymized analytics to understand how users interact with the app. 
                This helps us make data-driven decisions about feature development and improvements.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">Your Rights</h2>
              <p>
                You can request access to your data, correction of inaccurate data, or deletion of your account 
                and associated data at any time. Contact us at gyma@azynctra.com for assistance. We do not ever sell any user data.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-2">Updates to Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page.
              </p>
            </section>
            
            <section className="pt-4">
              <p className="text-xs">
                Last updated: 11 March 2025
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
