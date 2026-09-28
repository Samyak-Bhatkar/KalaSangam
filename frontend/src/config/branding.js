// ShilpSetu Centralized Branding Configuration (Card 1)
// Toggle IS_STUDENT_PROTOTYPE_BRANDING to false for official MoSJE / NBCFDC scheme presentation mode

export const IS_STUDENT_PROTOTYPE_BRANDING = true;

export const BRANDING_CONFIG = {
  isStudentPrototype: IS_STUDENT_PROTOTYPE_BRANDING,
  badge: IS_STUDENT_PROTOTYPE_BRANDING ? 'AICTE MIC' : 'MoSJE',
  title: 'ShilpSetu',
  titleHindi: 'शिल्पसेतु',
  subHeader: IS_STUDENT_PROTOTYPE_BRANDING
    ? 'AI छात्र नवाचार • Heritage & Culture Prototype (PS 26197)'
    : 'AI बाज़ार संपर्क व स्मार्ट कैटलॉगिंग प्रणाली',
  subHeaderEn: IS_STUDENT_PROTOTYPE_BRANDING
    ? 'Student Innovation • Heritage & Culture Prototype (PS 26197)'
    : 'AI Craft Marketplace & Smart Cataloging Platform',
  footer: IS_STUDENT_PROTOTYPE_BRANDING
    ? 'AICTE / MIC छात्र नवाचार प्रोटोटाइप • Student Innovation (Non-Governmental)'
    : 'राष्ट्रीय पिछड़ा वर्ग वित्त एवं विकास निगम (NBCFDC) • भारत सरकार',
  footerEn: IS_STUDENT_PROTOTYPE_BRANDING
    ? 'AICTE / MIC Student Innovation Prototype (Academic Demonstration)'
    : 'National Backward Classes Finance & Development Corporation (NBCFDC)',
  organization: IS_STUDENT_PROTOTYPE_BRANDING
    ? 'Smart India Hackathon 2024 / PS 26197'
    : 'Ministry of Social Justice and Empowerment'
};

export default BRANDING_CONFIG;
