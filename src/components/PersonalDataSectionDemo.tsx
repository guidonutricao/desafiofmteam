import { useState } from 'react';
import { PersonalDataSection } from './PersonalDataSection';

// Demo component to test PersonalDataSection
export function PersonalDataSectionDemo() {
  const [profile, setProfile] = useState({
    nome: 'João Silva',
    foto_url: 'https://example.com/photo.jpg'
  });
  const [saving, setSaving] = useState(false);

  const handleProfileUpdate = async (data: { nome: string; foto_url?: string }) => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProfile(data);
    setSaving(false);
    
    console.log('Profile updated:', data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">PersonalDataSection Demo</h1>
      
      <PersonalDataSection
        profile={profile}
        userEmail="joao@example.com"
        onProfileUpdate={handleProfileUpdate}
        saving={saving}
      />
      
      <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-2">Current Profile Data:</h2>
        <pre className="text-zinc-300 text-sm">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>
    </div>
  );
}