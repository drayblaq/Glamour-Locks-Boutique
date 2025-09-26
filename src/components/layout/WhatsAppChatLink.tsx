"use client";

import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react'; 

const WhatsAppChatLink = () => {
  const whatsappNumber = "+2349161762423"; // Replace with actual WhatsApp number including country code
  const message = encodeURIComponent("Hello! I'd like to know more about Glamours Boutique products.");

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
      aria-label="Chat with us on WhatsApp"
    >
      <Button size="icon" className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 text-white shadow-lg" aria-label="Contact via WhatsApp">
        <Phone className="h-7 w-7" />
      </Button>
    </a>
  );
};

export default WhatsAppChatLink;
