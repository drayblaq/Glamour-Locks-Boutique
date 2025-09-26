import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Glamour Locks Boutique',
  description: 'Terms of service for Glamour Locks Boutique - the rules and regulations for using our website and services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Glamour Locks Boutique's website and services, you accept and agree 
              to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily download one copy of the materials on Glamour Locks 
              Boutique's website for personal, non-commercial transitory viewing only.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Product Information</h2>
            <p className="mb-4">
              We strive to provide accurate product descriptions and images. However, we do not warrant 
              that product descriptions or other content is accurate, complete, reliable, or error-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Pricing and Payment</h2>
            <p className="mb-4">
              All prices are subject to change without notice. Payment is processed securely through 
              Stripe. We reserve the right to refuse or cancel orders at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Shipping and Delivery</h2>
            <p className="mb-4">
              Shipping times are estimates and may vary. We are not responsible for delays caused by 
              shipping carriers or circumstances beyond our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Returns and Refunds</h2>
            <p className="mb-4">
              Returns are accepted within 30 days of purchase. Items must be in original condition. 
              Refunds will be processed within 5-10 business days after receiving returned items.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. User Accounts</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account and password. 
              You agree to accept responsibility for all activities under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Prohibited Uses</h2>
            <p className="mb-4">You may not use our website:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer</h2>
            <p className="mb-4">
              The information on this website is provided on an "as is" basis. To the fullest extent 
              permitted by law, Glamour Locks Boutique excludes all representations, warranties, 
              conditions and terms relating to our website and the use of this website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall Glamour Locks Boutique, nor its directors, employees, partners, agents, 
              suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, 
              or punitive damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="mb-4">
              These terms and conditions are governed by and construed in accordance with the laws 
              of [Your Country/State] and you irrevocably submit to the exclusive jurisdiction of 
              the courts in that state or location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to revise these terms at any time without notice. By using this 
              website, you are agreeing to be bound by the then current version of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p>Email: legal@glamourlocks.com</p>
              <p>Phone: [Your Phone Number]</p>
              <p>Address: [Your Business Address]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}



