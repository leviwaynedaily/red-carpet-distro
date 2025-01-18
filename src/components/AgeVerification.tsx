import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AgeVerificationProps {
  onVerified: () => void;
}

export const AgeVerification = ({ onVerified }: AgeVerificationProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<'verification' | 'instructions'>('verification');
  const [storefrontPassword, setStorefrontPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>(null); // Add state for settings

  useEffect(() => {
    fetchStorefrontPassword();
    // Check if user is already verified
    const isVerified = localStorage.getItem('isAgeVerified') === 'true';
    if (isVerified) {
      onVerified();
    }
  }, [onVerified]);

  const fetchStorefrontPassword = async () => {
    try {
      console.log('Fetching storefront password...');
      const { data, error } = await supabase
        .from("site_settings")
        .select("storefront_password")
        .single();

      if (error) {
        console.error('Error fetching storefront password:', error);
        throw error;
      }
      
      console.log('Storefront password data:', data);
      if (data?.storefront_password) {
        setStorefrontPassword(data.storefront_password);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching storefront password:", error);
      toast({
        title: "Error",
        description: "Failed to load site settings. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChecked) {
      toast({
        title: "Age Verification Required",
        description: "Please confirm that you are 21 years or older.",
        variant: "destructive",
      });
      return;
    }
    if (!storefrontPassword) {
      toast({
        title: "Access Unavailable",
        description: "Site access is currently unavailable. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    if (password !== storefrontPassword) {
      toast({
        title: "Invalid Password",
        description: "Please enter the correct password to access the site.",
        variant: "destructive",
      });
      return;
    }
    if (step === 'verification') {
      setStep('instructions');
    } else {
      localStorage.setItem('isAgeVerified', 'true');
      onVerified();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-4 sm:p-8 max-w-md w-full mx-4 shadow-lg">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 sm:p-8 max-w-md w-full mx-4 shadow-lg animate-fade-up overflow-y-auto max-h-[90vh]">
        <img
          src="/lovable-uploads/3da74169-47b0-4693-aad7-82c3df307063.png"
          alt="Palmtree Smokes Logo"
          className="w-32 sm:w-48 mx-auto mb-4 sm:mb-6"
        />
        {step === 'verification' ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Verification Required</h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="age-verify"
                  checked={isChecked}
                  onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                />
                <label
                  htmlFor="age-verify"
                  className="text-xs sm:text-sm leading-tight sm:leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left"
                >
                  I confirm that I am 21 years of age or older and agree to the Terms of Service and Privacy Policy.
                </label>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs sm:text-sm font-medium">
                  Site Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter site password"
                  className="w-full text-sm"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Next
              </Button>
              <p className="text-[10px] sm:text-xs text-center text-gray-500 mt-4">
                This website contains age-restricted content. By entering, you accept our terms and confirm your legal age to
                view such content.
              </p>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-left">
              {settings?.welcome_instructions?.title || "Welcome to Palmtree Smokes"}
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-gray-600">
              <p className="text-left">
                {settings?.welcome_instructions?.subtitle || "Please take a moment to review our store guidelines:"}
              </p>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: settings?.welcome_instructions?.guidelines || "" 
                }} 
              />
              <form onSubmit={handleSubmit}>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6">
                  Enter Site
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
