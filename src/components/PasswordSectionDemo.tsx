import { useState } from 'react';
import { PasswordSection } from './PasswordSection';

export function PasswordSectionDemo() {
  const [updating, setUpdating] = useState(false);

  const handlePasswordUpdate = async (password: string) => {
    setUpdating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Password updated:', password);
    setUpdating(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-zinc-900 min-h-screen">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Password Section Demo</h1>
      <PasswordSection 
        onPasswordUpdate={handlePasswordUpdate}
        updating={updating}
      />
    </div>
  );
}