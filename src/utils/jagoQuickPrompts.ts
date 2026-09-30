import type { JagoLanguage } from '@/i18n';
import type { PrototypeRole } from '@/utils/roleStore';

const studentPrompts: Record<JagoLanguage, string[]> = {
  en: [
    'What is my application status?',
    'What documents do I need?',
    'Which scholarship can I apply for?',
    'What should I do next?',
  ],
  ta: [
    'என் விண்ணப்ப நிலை என்ன?',
    'எந்த ஆவணங்கள் தேவையுள்ளன?',
    'எந்த உதவித்தொகைக்கு விண்ணப்பிக்கலாம்?',
    'அடுத்து என்ன செய்ய வேண்டும்?',
  ],
  hi: [
    'मेरी आवेदन स्थिति क्या है?',
    'मुझे कौन से दस्तावेज़ चाहिए?',
    'मैं किस छात्रवृत्ति के लिए आवेदन कर सकता हूँ?',
    'अगला कदम क्या है?',
  ],
};

const adminPrompts: Record<JagoLanguage, string[]> = {
  en: [
    'How many potential unreached students are there?',
    'How many records require review?',
    'Show scholarship coverage summary.',
    'How many applications are being processed?',
  ],
  ta: [
    'எத்தனை சாத்தியமான சென்றடையாத மாணவர்கள் உள்ளனர்?',
    'எத்தனை பதிவுகள் மதிப்பாய்வு தேவை?',
    'உதவித்தொகை கவரேஜ் சுருக்கத்தை காட்டுக.',
    'எத்தனை விண்ணப்பங்கள் செயலாக்கத்தில் உள்ளன?',
  ],
  hi: [
    'कितने संभावित अप्राप्य विद्यार्थी हैं?',
    'कितने रिकॉर्ड की समीक्षा आवश्यक है?',
    'छात्रवृत्ति कवरेज सारांश दिखाइए।',
    'कितने आवेदन प्रसंस्करण में हैं?',
  ],
};

export function getQuickPromptsForRole(role: PrototypeRole, language: JagoLanguage): string[] {
  const promptsByRole = role === 'admin' ? adminPrompts : studentPrompts;
  return promptsByRole[language] ?? promptsByRole.en;
}
