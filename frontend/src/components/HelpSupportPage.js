import { useState, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar'; // Import the Navbar component

export default function HelpSupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    whatsapp: false
  });
  const [companyName, setCompanyName] = useState('');

  // Get company name from localStorage when component mounts
  useEffect(() => {
    const storedCompanyName = localStorage.getItem('companyName');
    if (storedCompanyName) {
      setCompanyName(storedCompanyName);
      // Pre-fill the company field if available
      setFormData(prev => ({
        ...prev,
        company: storedCompanyName
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare WhatsApp message
    const whatsappMessage = `Name: ${formData.name}%0A` +
                           `Email: ${formData.email}%0A` +
                           `Company: ${formData.company}%0A` +
                           `Message: ${formData.message}`;
    
    if (formData.whatsapp) {
      // Replace with your actual WhatsApp number in international format (remove +, spaces, or dashes)
      const whatsappNumber = '916383401693';
      window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
    } else {
      // Here you would typically send to your backend
      console.log('Form submitted:', formData);
      alert('Thank you for your message! We will contact you soon.');
    }
    
    // Reset form (but keep company name if logged in)
    setFormData({
      name: '',
      email: '',
      company: companyName || '', // Preserve company name if available
      message: '',
      whatsapp: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-2">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        
            <p className="mt-2 text-gray-600">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!!companyName} // Disable if company name is from login
              />
              {companyName && (
                <p className="mt-1 text-xs text-gray-500">
                  Company name is pre-filled from your login
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="whatsapp"
                name="whatsapp"
                type="checkbox"
                checked={formData.whatsapp}
                onChange={handleChange}
                                required
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="whatsapp" className="ml-2 block text-sm text-gray-900">
                Send via WhatsApp
              </label>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Submit
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Or contact us directly on WhatsApp: 
              <a 
                href="https://wa.me/916383401693" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-green-600 hover:text-green-800 font-medium"
              >
                +91 916383401693
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}