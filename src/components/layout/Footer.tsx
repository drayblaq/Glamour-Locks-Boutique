'use client';

import Link from 'next/link';
import { Instagram, Facebook, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Glamour Locks Boutique</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Premium natural hair care products for healthy, beautiful hair.
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.instagram.com/glamourlocksboutique?igsh=cTJhMXpkdWk5OXVh" 
                    aria-label="Instagram" 
                    className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram className="h-5 w-5" />
        </Link>
              <Link href="#" aria-label="Facebook" 
                    className="text-muted-foreground hover:text-primary transition-colors">
            <Facebook className="h-5 w-5" />
        </Link>
              <Link href="#" aria-label="YouTube" 
                    className="text-muted-foreground hover:text-primary transition-colors">
            <Youtube className="h-5 w-5" />
        </Link>
              <Link href="#" aria-label="Twitter" 
                    className="text-muted-foreground hover:text-primary transition-colors">
            <Twitter className="h-5 w-5" />
        </Link>
    </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Glamour Locks Boutique. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

    