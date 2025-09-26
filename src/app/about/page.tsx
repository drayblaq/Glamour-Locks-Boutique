
import Image from 'next/image';
import { Users, Heart } from 'lucide-react';

export const metadata = {
  title: 'About Us - Glamour Locks Boutique',
  description: 'Learn about the story behind Glamour Locks Boutique, our mission, and our commitment to natural hair care.',
};

const LogoSVG = () => (
  <svg
    xmlns=""
    viewBox="0 0 64 64"
    className="mx-auto h-16 w-16 text-primary mb-4" 
  >
    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M20,20 Q24,12 32,18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M18,24 Q10,28 16,32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M44,44 Q40,52 32,46" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M46,40 Q54,36 50,32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <text 
      x="50%" 
      y="50%" 
      dominantBaseline="central" 
      textAnchor="middle" 
      fontSize="25" 
      fontFamily="Georgia, serif" 
      fontWeight="bold"
      fill="currentColor"
      stroke="none"
      dy=".1em"
    >
      gSL
    </text>
  </svg>
);


export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 overflow-x-hidden animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out">
      <header className="text-center mb-12 md:mb-16 animate-in fade-in slide-in-from-bottom-12 duration-700 ease-out">
        <LogoSVG />
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">About Glamour Locks Boutique</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Nurturing your hair, naturally. Our story, our passion, our promise.
        </p>
      </header>

      {/* Team/Founder Section */}
      <section className="flex flex-col md:flex-row items-center gap-8 mb-16 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out delay-100">
        <div className="flex-shrink-0">
          <Image
            src="/logo.jpg"
            alt="Founder of Glamour Locks Boutique working with natural ingredients"
            width={220}
            height={220}
            className="rounded-full shadow-xl object-cover aspect-square border-4 border-pink-200"
            data-ai-hint="woman nature"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-primary mb-2">Meet Our Founder</h3>
          <p className="text-md text-muted-foreground mb-2">Seyi Ibikunle-Awe, She started Glamour Locks Boutique with a simple mission: to create high-quality, natural hair care products that genuinely work.</p>
          <p className="text-md text-muted-foreground">With years of experience in the beauty industry, My goal is to share these gifts with you, through products that are not only effective but also a joy to use." - Seyi Ibikunle-Awe</p>
        </div>
      </section>

      {/* Values/Mission Section */}
      <section className="mb-16 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out delay-200">
        <h3 className="text-2xl font-bold text-primary mb-6 text-center">Our Values & Mission</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center animate-in fade-in duration-500">
            <span className="inline-block mb-4"><LogoSVG /></span>
            <h4 className="text-lg font-semibold text-primary mb-2">Natural Ingredients</h4>
            <p className="text-muted-foreground text-sm">We believe in the power of nature. Our products are made with carefully selected botanicals and oils.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center animate-in fade-in duration-500 delay-100">
            <span className="inline-block mb-4"><span className="inline-block bg-accent rounded-full p-2"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles text-accent"><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.42 1.42M6.34 17.66l-1.42 1.42m12.02 0l-1.42-1.42M6.34 6.34L4.92 4.92"/><circle cx="12" cy="12" r="5"/></svg></span></span>
            <h4 className="text-lg font-semibold text-primary mb-2">Visible Results</h4>
            <p className="text-muted-foreground text-sm">Our mission is to help you achieve healthy, beautiful hair you can be proud of.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center animate-in fade-in duration-500 delay-200">
            <span className="inline-block mb-4"><span className="inline-block bg-primary rounded-full p-2"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users text-white"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span></span>
            <h4 className="text-lg font-semibold text-primary mb-2">Community</h4>
            <p className="text-muted-foreground text-sm">We’re more than a brand—we’re a community. Join us and share your hair journey!</p>
          </div>
        </div>
      </section>

      <section className="mt-16 text-center animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out delay-300">
        <h1 className="text-3xl font-semibold text-primary mb-10">Join Our Journey</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          We invite you to explore our collection and experience the Glamour Locks Boutique difference. If you have any questions or just want to share your hair story, we'd love to hear from you!
        </p>
      </section>
    </div>
  );
}
