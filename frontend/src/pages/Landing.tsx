import { useState } from 'react';
import { ShoppingBag, ShieldCheck, Leaf, Globe, CheckCircle2, Star, Mail, MapPin, Phone, X, HelpCircle, FileText, Shield } from 'lucide-react';

interface LandingProps {
  setView: (view: string) => void;
}

const Landing = ({ setView }: LandingProps) => {
  // Modal tracking state
  const [modalType, setModalType] = useState<null | 'help' | 'privacy' | 'terms'>(null);

  // 🚀 Added state management for the visitor message submission form
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const closeModal = () => setModalType(null);

  // 🚀 Handles form input text changes dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🚀 Submits contact data directly to the messages database schema pipeline
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullname || !formData.email || !formData.message) {
      alert("Please fill in all layout blocks to submit your approach request.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/messages/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to dispatch user message payload.');
      }

      alert(data.message || "Message dispatched successfully!");
      
      // Clean form inputs on success stream
      setFormData({ fullname: '', email: '', message: '' });
    } catch (error: any) {
      console.error("Transmission error tracking landing form:", error);
      alert(error.message || "Something went wrong sending your message. Please check server connections.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-[#0f966c] flex items-center justify-center">
              <span className="text-white font-black text-xl italic">O</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">OrderClick</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-bold uppercase tracking-widest text-slate-500">
            <a href="#products" className="hover:text-[#0f966c] transition-colors">Products</a>
            <a href="#about" className="hover:text-[#0f966c] transition-colors">About</a>
            <a href="#how-it-works" className="hover:text-[#0f966c] transition-colors">Process</a>
            <a href="#contact" className="hover:text-[#0f966c] transition-colors">Contact</a>
          </div>
          <div className="space-x-4">
            <button onClick={() => setView('login')} className="px-6 py-2 font-bold text-slate-600 hover:text-[#0f966c]">Login</button>
            <button onClick={() => setView('register')} className="px-6 py-2 bg-[#0f966c] text-white rounded-full font-bold shadow-lg shadow-[#0f966c]/20 hover:scale-105 transition-all">Get Started</button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="max-w-7xl mx-auto px-8 pt-40 pb-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-[#0f966c] font-bold text-xs uppercase tracking-widest">
            <Globe size={14} /> Global Digital Solutions
          </div>
          <h1 className="text-6xl md:text-7xl font-black leading-[1.1] text-slate-800">
            Say goodbye to <span className="text-[#0f966c]">Paper Receipts.</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
            Organize your shopping life with digital receipts. Track spending, 
            manage warranties, and save the planet—all in one secure dashboard.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setView('orderNow')} className="bg-[#003d3d] text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-slate-800 transition-all shadow-xl shadow-[#003d3d]/20 flex items-center gap-3">
              <ShoppingBag size={20} /> Order Now
            </button>
            <button onClick={() => setView('register')} className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all">
              Learn More
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 relative">
          <img 
            src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=2070" 
            alt="Hero" 
            className="rounded-[3rem] shadow-2xl border-[12px] border-white object-cover aspect-square md:aspect-video lg:aspect-square"
          />
        </div>
      </header>

      {/* 3. Trending Collections / Categories Section */}
      <section id="products" className="py-24 bg-[#0a0f1c]">
        <div className="max-w-7xl mx-auto px-8 text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">
            Trending <span className="text-teal-400">Collections</span>
          </h2>
          <p className="text-slate-400">Explore our most requested categories this week.</p>
        </div>

        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
          {[
            { 
              name: 'Fragrance', 
              desc: 'Signature scents for every occasion.', 
              step: '01',
              img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800' 
            },
            { 
              name: 'Makeup', 
              desc: 'Professional tools for your best look.', 
              step: '02',
              img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800' 
            },
            { 
              name: 'Face Care', 
              desc: 'Advanced skincare for glowing results.', 
              step: '03',
              img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800' 
            },
            { 
              name: 'Home Nutrition', 
              desc: 'Fuel your body with premium supplements.', 
              step: '04',
              img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800' 
            },
            { 
              name: 'Men\'s Store', 
              desc: 'Grooming essentials built for men.', 
              step: '06',
              img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800' 
            }
          ].map((category, i) => (
            <div 
              key={i} 
              onClick={() => setView('orderNow')}
              className="relative group w-full max-w-[380px] aspect-[4/6] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <img 
                src={category.img} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <span className="absolute top-8 right-10 text-6xl font-black text-white/10 z-20">
                {category.step}
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-10 z-30">
                <h3 className="text-3xl font-black text-teal-400 mb-2">
                  {category.name}
                </h3>
                <p className="text-slate-200 text-sm mb-8 leading-relaxed opacity-90">
                  {category.desc}
                </p>
                <button className="w-full py-4 bg-[#0f966c] text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#0d8560] transition-colors shadow-lg shadow-[#0f966c]/20">
                  Explore Collection
                </button>
              </div>
              <div className="absolute inset-4 border border-white/10 rounded-[2rem] pointer-events-none group-hover:border-teal-500/30 transition-colors"></div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. About Section */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2070" className="rounded-[3rem] shadow-2xl" alt="About Us" />
          </div>
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-4xl font-black text-slate-800 leading-tight">We're on a mission to <span className="text-[#0f966c]">digitize the world.</span></h2>
            <p className="text-lg text-slate-500">OrderClick started with a simple idea: why are we still using paper in a digital age? We built a platform that bridges the gap between physical shopping and digital management.</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex gap-3">
                <ShieldCheck className="text-teal-600 shrink-0" />
                <span className="font-bold text-slate-700">Enterprise Security</span>
              </div>
              <div className="flex gap-3">
                <Leaf className="text-teal-600 shrink-0" />
                <span className="font-bold text-slate-700">100% Eco-Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 text-center mb-20">
          <h2 className="text-4xl font-black mb-4">Simple as <span className="text-[#21c08b]">1-2-3</span></h2>
          <p className="text-slate-400">Our seamless process designed for speed.</p>
        </div>
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: '01', title: 'Pick Items', desc: 'Browse our marketplace and add items to your cart.' },
            { step: '02', title: 'One-Click Pay', desc: 'Secure checkout with your preferred payment method.' },
            { step: '03', title: 'Instant Receipt', desc: 'Receive your digital receipt and tracking info immediately.' }
          ].map((item, i) => (
            <div key={i} className="relative p-10 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-colors">
              <span className="text-5xl font-black text-white/10 absolute top-6 right-8">{item.step}</span>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="bg-emerald-50 rounded-[4rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="fill-yellow-400 text-yellow-400" size={20} />)}
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-4">What our customers say</h2>
              <p className="text-slate-500">Trusted by over 10,000+ active shoppers across the Philippines.</p>
            </div>
            <div className="md:w-2/3 grid gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100">
                <p className="text-lg text-slate-600 italic mb-6">"Finally! No more losing receipts in my wallet. The dashboard is so clean and easy to use. Highly recommended for busy people!"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200"></div>
                  <div>
                    <p className="font-black text-slate-800">Yuki Yern</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Verified Customer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Contact Section */}
      <section id="contact" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-slate-800">Get in <span className="text-[#0f966c]">Touch</span></h2>
            <p className="text-slate-500">Have questions about our digital products? Our team is here to help 24/7.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm"><Phone size={18} /></div>
                <span className="font-bold">+63 912 345 6789</span>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm"><Mail size={18} /></div>
                <span className="font-bold">support@orderclick.com</span>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm"><MapPin size={18} /></div>
                <span className="font-bold">Cebu City, Philippines</span>
              </div>
            </div>
          </div>
          
          {/* 🚀 FORM UPDATED: Tied onSubmit handler and value inputs to backend state hook loops */}
          <form onSubmit={handleFormSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 space-y-4 border border-slate-100">
            <input 
              type="text" 
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              placeholder="Full Name" 
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" 
              disabled={submitting}
            />
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address" 
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20" 
              disabled={submitting}
            />
            <textarea 
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Your Message" 
              rows={4} 
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20"
              disabled={submitting}
            ></textarea>
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#0f966c] text-white font-black rounded-2xl shadow-lg shadow-[#0f966c]/20 hover:bg-[#0d8560] transition-all disabled:opacity-50"
            >
              {submitting ? 'Sending Transmission...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* 8. Footer Section with Modal Button Triggers */}
      <footer className="bg-slate-900 py-16 text-slate-400">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
              <div className="h-8 w-8 rounded-lg bg-[#0f966c] flex items-center justify-center">
                <span className="font-black italic">O</span>
              </div>
              <span className="text-xl font-bold tracking-tight">OrderClick</span>
            </div>
            <p className="text-sm leading-relaxed">The future of digital receipt management and smart shopping in the Philippines.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><button onClick={() => setView('orderNow')} className="hover:text-white transition-colors">Marketplace</button></li>
              <li><button onClick={() => setView('login')} className="hover:text-white transition-colors">Dashboard</button></li>
              <li><button onClick={() => setView('register')} className="hover:text-white transition-colors">Eco-Program</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Support</h4>
            <ul className="space-y-4 text-sm flex flex-col items-start">
              <li><button onClick={() => setModalType('help')} className="hover:text-white cursor-pointer transition-colors text-left">Help Center</button></li>
              <li><button onClick={() => setModalType('privacy')} className="hover:text-white cursor-pointer transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => setModalType('terms')} className="hover:text-white cursor-pointer transition-colors text-left">Terms of Service</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Newsletter</h4>
            <p className="text-xs mb-4">Get the latest eco-shopping tips.</p>
            <div className="flex gap-2">
              <input type="text" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#0f966c] w-full" placeholder="Email" />
              <button className="bg-[#0f966c] text-white p-2 rounded-lg"><CheckCircle2 size={18} /></button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pt-8 text-center text-xs font-bold uppercase tracking-widest">
          © 2026 OrderClick Inc. All Rights Reserved.
        </div>
      </footer>

      {/* DYNAMIC MODAL SYSTEM */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-2xl rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0f966c]/10 flex items-center justify-center text-[#0f966c]">
                  {modalType === 'help' && <HelpCircle size={20} />}
                  {modalType === 'privacy' && <Shield size={20} />}
                  {modalType === 'terms' && <FileText size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">
                    {modalType === 'help' && 'Help Center & Knowledge Hub'}
                    {modalType === 'privacy' && 'Privacy Statement'}
                    {modalType === 'terms' && 'Terms of Service agreements'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">OrderClick Secure Portal v2.0</p>
                </div>
              </div>
              <button 
                onClick={closeModal} 
                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 hover:shadow-sm transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body content */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-600 leading-relaxed text-sm">
              {modalType === 'help' && (
                <>
                  <div>
                    <h4 className="font-black text-slate-800 text-base mb-2">1. How do I track my custom order requests?</h4>
                    <p>Once you fill out an order requested summary and specify a transaction route, your order request moves to the <strong>Orders & Receipts Panel</strong> as <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-xs">PENDING</span>. Administrators verify GCash Reference numbers directly prior to dispatching PDFs.</p>
                  </div>
                  <hr className="border-slate-100" />
                  <div>
                    <h4 className="font-black text-slate-800 text-base mb-2">2. What payment verification modes exist?</h4>
                    <p>We support both physical over-the-counter <strong>Cash collection at the Coop main office</strong>, alongside instant digital <strong>GCash reference attachments</strong>. Secure payment tracking ensures swift digital updates.</p>
                  </div>
                  <hr className="border-slate-100" />
                  <div>
                    <h4 className="font-black text-slate-800 text-base mb-2">3. Getting in touch with support channels</h4>
                    <p>For instant technical assistance regarding transaction slips, you can contextually visit our corporate site branch located in Cebu City or ping <strong>support@orderclick.com</strong> directly.</p>
                  </div>
                </>
              )}

              {modalType === 'privacy' && (
                <>
                  <p className="italic text-slate-400">Last updated: May 24, 2026</p>
                  <div>
                    <h4 className="font-black text-slate-800 text-base mb-2">Information We Collect</h4>
                    <p>We securely log essential full names, phone contact strings, active email configurations, and specified transaction locations solely to route individual purchase directories correctly into your platform account.</p>
                  </div>
                  <hr className="border-slate-100" />
                  <div>
                    <h4 className="font-black text-slate-800 text-base mb-2">GCash & Data Security Encryption</h4>
                    <p>Reference numbers uploaded to verify balances are stored in sandboxed environment states. Financial parameters remain secure and visible uniquely inside the protected administrator terminal dashboards.</p>
                  </div>
                  <hr className="border-slate-100" />
                  <div>
                    <h4 className="font-black text-slate-800 text-base mb-2">Third-Party Policy</h4>
                    <p>OrderClick operates independently inside the Philippines. We strictly maintain a policy against trading your personal directory details to outside marketing organizations.</p>
                  </div>
                </>
              )}

              {modalType === 'terms' && (
                <>
                  <p className="italic text-slate-400">Effective Date: May 2026</p>
                  <div>
                    <h4 className="font-black text-slate-800 text-base mb-2">1. User Account Registration Requirements</h4>
                    <p>Users must submit real information inside checkout directories. Utilizing mock reference structures or fabricated tracking logs will result in standard account blacklists from our secure portal layers.</p>
                  </div>
                  <hr className="border-slate-100" />
                  <div>
                    <h4 className="font-black text-slate-800 text-base mb-2">2. Digital Receipt Disclaimers</h4>
                    <p>Generated automated system PDFs act as functional eco-friendly receipts representing confirmed transaction instances. Any tax deductions or physical returns remain subject to local office guidelines.</p>
                  </div>
                  <hr className="border-slate-100" />
                  <div>
                    <h4 className="font-black text-slate-800 text-base mb-2">3. Termination Policy</h4>
                    <p>We preserve full authoritative control to safely lock or close active client sessions if unauthorized behaviors, malicious scripting exploits, or payment spoofing are registered in our event pipelines.</p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={closeModal}
                className="px-6 py-2.5 bg-[#0f966c] hover:bg-[#0d8560] text-white font-bold rounded-xl transition-all shadow-md shadow-[#0f966c]/10 text-xs uppercase tracking-wider"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;