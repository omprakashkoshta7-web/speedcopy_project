import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const faqs = [
  {
    q: 'What file formats do you support?',
    a: 'We support PDF, JPG, PNG, SVG, AI, PSD, and DOCX files. For best results, we recommend uploading high-resolution PDF files.',
  },
  {
    q: 'Why is my file upload failing?',
    a: 'File uploads may fail if the file is too large (max 50MB), corrupted, or in an unsupported format. Try compressing your file or converting it to PDF.',
  },
  {
    q: 'How do I use the design editor?',
    a: 'Our design editor allows you to add text, images, and shapes to your designs. Click on any element to edit it, and use the toolbar to customize colors, fonts, and sizes.',
  },
  {
    q: 'Can I save my design and edit it later?',
    a: 'Yes, all your designs are automatically saved to your account. You can access them from the "My Designs" section and continue editing anytime.',
  },
  {
    q: 'What resolution should my images be?',
    a: 'For best print quality, we recommend images at 300 DPI or higher. Lower resolution images may appear pixelated when printed.',
  },
  {
    q: 'The editor is not loading. What should I do?',
    a: 'Try clearing your browser cache, disabling browser extensions, or using a different browser. If the issue persists, contact our technical support team.',
  },
];

const TechnicalSupportFAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [showContactForm, setShowContactForm] = React.useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowContactForm(false);
    setShowSuccessPopup(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  return (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <Navbar />
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1001, backgroundColor: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 320, border: '2px solid #16a34a' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: 24, height: 24, color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 4 }}>Message Sent!</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>Our support team will get back to you soon.</p>
            </div>
            <button onClick={() => setShowSuccessPopup(false)} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 20, color: '#9ca3af', padding: 0, lineHeight: 1 }}>×</button>
          </div>
        </div>
      )}
      
      {/* Contact Form Modal */}
      {showContactForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowContactForm(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: 32, maxWidth: 500, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontWeight: 700, fontSize: 24, color: '#111' }}>Contact Support</h2>
              <button onClick={() => setShowContactForm(false)} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 24, color: '#9ca3af' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14 }} placeholder="Your name" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14 }} placeholder="your@email.com" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Subject</label>
                <input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14 }} placeholder="How can we help?" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Message</label>
                <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 14, resize: 'vertical' }} placeholder="Describe your issue..." />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowContactForm(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: '#111', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Send Message</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Back button */}
        <button onClick={() => navigate('/help')} className="flex items-center gap-2 mb-6 text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Help Center
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 mb-6" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#f3f4f6' }}>
            <svg className="w-7 h-7" style={{ color: '#374151' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="font-bold text-gray-900 mb-2" style={{ fontSize: '32px' }}>Technical Support</h1>
          <p className="text-gray-600 leading-relaxed">Get help with design tools, file uploads, formatting, and technical issues.</p>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: '16px' }}>{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mt-6 text-center">
          <p className="text-white font-bold mb-2" style={{ fontSize: '18px' }}>Still have questions?</p>
          <p className="text-white/90 text-sm mb-4">Our support team is here to help you 24/7</p>
          <button onClick={() => setShowContactForm(true)} className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition">
            Contact Support
          </button>
        </div>

      </div>
    </div>
  );
};

export default TechnicalSupportFAQPage;
