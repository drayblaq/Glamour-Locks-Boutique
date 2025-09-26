"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create mailto link with form data
      const subject = encodeURIComponent(`Contact Form: ${formData.subject || 'General Inquiry'}`);
      const body = encodeURIComponent(`
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}

Subject: ${formData.subject || 'General Inquiry'}

Message:
${formData.message}

---
This message was sent through the Glamour Locks Boutique contact form.
      `);

      // Replace with your business email
      const businessEmail = 'owner@glamourlocksboutique.com';
      const mailtoLink = `mailto:${businessEmail}?subject=${subject}&body=${body}`;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get In Touch</h1>
            <p className="text-xl text-pink-100">
              We'd love to hear from you! Reach out with any questions about our hair care products or services.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4 text-center">Contact Us</h2>
          <p className="text-muted-foreground mb-6 text-center">We'd love to hear from you! Fill out the form below and our team will get back to you soon.</p>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-primary mb-1">Name</label>
              <input id="name" name="name" type="text" required className="w-full px-4 py-3 rounded-full border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-1">Email</label>
              <input id="email" name="email" type="email" required className="w-full px-4 py-3 rounded-full border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-primary mb-1">Message</label>
              <textarea id="message" name="message" rows={5} required className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:ring-2 focus:ring-pink-400 outline-none resize-none" />
            </div>
            <button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-3 text-lg font-semibold shadow-md transition-transform duration-200 hover:scale-105">Send Message</button>
          </form>
        </div>
        <div className="text-center text-muted-foreground text-sm">
          Or email us directly at <a href="mailto:info@glamourlocks.com" className="text-primary underline">info@glamourlocks.com</a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;