import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, FileText, Camera, Check, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NeuralBackground } from '@/components/NeuralBackground';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Identity', icon: FileText },
  { id: 3, title: 'Verification', icon: Camera },
  { id: 4, title: 'Complete', icon: Check },
];

export default function KYC() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    postalCode: '',
    idType: 'passport',
    idNumber: '',
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast.success('KYC submitted successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <NeuralBackground />
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="glass-card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center mb-4 shadow-glow">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">KYC Verification</h1>
            <p className="text-muted-foreground mt-1">Complete your identity verification</p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.id
                      ? 'gradient-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded-full transition-all ${
                      currentStep > step.id ? 'gradient-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="United States"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold mb-4">Address & Identity</h2>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal">Postal Code</Label>
                    <Input
                      id="postal"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="10001"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="Passport or ID number"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-semibold mb-4">Document Upload</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Front of ID</p>
                    <p className="text-xs text-muted-foreground">Click to upload</p>
                  </div>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Back of ID</p>
                    <p className="text-xs text-muted-foreground">Click to upload</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Selfie with ID</p>
                  <p className="text-xs text-muted-foreground">Hold your ID next to your face</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center animate-fade-in py-8">
                <div className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center mb-4">
                  <Check className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Ready to Submit</h2>
                <p className="text-muted-foreground mb-6">
                  Your KYC verification will be reviewed within 24-48 hours.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            {currentStep < 4 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit KYC'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
