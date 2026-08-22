'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu.');
      }

      setStatus({ type: 'success', message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.' });
      setFormData({ name: '', company: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Gönderim başarısız oldu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {status.type === 'success' && (
        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
          {status.message}
        </div>
      )}
      {status.type === 'error' && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
          {status.message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="form-group space-y-2">
          <label className="block text-sm font-bold text-text-main">Ad Soyad *</label>
          <input 
            type="text" 
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-border-color bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
            placeholder="Adınız Soyadınız" 
          />
        </div>
        <div className="form-group space-y-2">
          <label className="block text-sm font-bold text-text-main">Şirket</label>
          <input 
            type="text" 
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-border-color bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
            placeholder="Şirket Adı" 
          />
        </div>
      </div>

      <div className="form-group space-y-2">
        <label className="block text-sm font-bold text-text-main">E-Posta Adresi *</label>
        <input 
          type="email" 
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-border-color bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
          placeholder="ornek@sirket.com" 
        />
      </div>

      <div className="form-group space-y-2">
        <label className="block text-sm font-bold text-text-main">Konu</label>
        <input 
          type="text" 
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-border-color bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
          placeholder="Nasıl yardımcı olabiliriz?" 
        />
      </div>

      <div className="form-group space-y-2">
        <label className="block text-sm font-bold text-text-main">Mesaj *</label>
        <textarea 
          name="message"
          required
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-border-color bg-white outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all min-h-[120px] resize-y" 
          placeholder="Mesajınızı buraya yazın..."
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-accent text-white font-bold rounded-lg hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? 'Gönderiliyor...' : 'Mesaj Gönder'}
      </button>

    </form>
  );
}
