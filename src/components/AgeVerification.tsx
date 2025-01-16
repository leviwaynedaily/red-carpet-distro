import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface AgeVerificationProps {
  onVerified: () => void;
}

export const AgeVerification = ({ onVerified }: AgeVerificationProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<'verification' | 'instructions'>('verification');
  const { toast } = useToast();

  // TODO: Replace with actual password from backend
  const TEMP_PASSWORD = "palmtree2024";

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
    if (password !== TEMP_PASSWORD) {
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
      onVerified();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg animate-fade-up">
        <img
          src="/lovable-uploads/8755b838-c203-43ef-b4ec-77641be30fce.png"
          alt="Palmtree Smokes Logo"
          className="w-48 mx-auto mb-6"
        />
        {step === 'verification' ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Verification Required</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="age-verify"
                  checked={isChecked}
                  onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                />
                <label
                  htmlFor="age-verify"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm that I am 21 years of age or older and agree to the Terms of Service and Privacy Policy.
                </label>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Site Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter site password"
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Next
              </Button>
              <p className="text-xs text-center text-gray-500 mt-4">
                This website contains age-restricted content. By entering, you accept our terms and confirm your legal age to
                view such content.
              </p>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Welcome to Palmtree Smokes</h2>
            <div className="space-y-4 text-gray-600">
              <p>Please take a moment to review our store guidelines:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Browse our selection of premium products at your leisure</li>
                <li>For purchases or inquiries, text or call us directly</li>
                <li>Business Hours: Monday - Friday, 8:00 AM - 5:00 PM</li>
                <li>Same-day delivery available for orders placed before 3 PM</li>
                <li>Customer support available during business hours</li>
                <li>All prices include applicable taxes</li>
              </ul>
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