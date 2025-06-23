import React from "react";
import { MessageCircle, Zap, Users, MapPin, LayoutGrid, RefreshCw } from "lucide-react"; 
import Header from "./Header";
import Navbar from "./Navbar"; // Import the Navbar component

export default function AboutUs() {
  const services = [
    {
      title: "WA Bulk Messaging",
      description: "Send personalized WhatsApp messages to thousands of users instantly.",
      icon: <MessageCircle className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Auto Reply Bot",
      description: "Respond to incoming messages 24/7 with intelligent auto-replies.",
      icon: <Zap className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Contact Extractor",
      description: "Extract numbers from Google Maps, websites, or local files.",
      icon: <MapPin className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Group Messaging",
      description: "Manage and send messages to WhatsApp groups efficiently.",
      icon: <Users className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Campaign Tracking",
      description: "Track sent messages, delivery success, and customer engagement.",
      icon: <LayoutGrid className="w-6 h-6 text-green-600" />,
    },
    {
      title: "CRM Integration",
      description: "Integrate with your CRM to streamline support and marketing.",
      icon: <RefreshCw className="w-6 h-6 text-green-600" />,
    },
  ];

  return (
    <div>
    <Navbar/>
    <section className="bg-white px-6 py-12 md:px-20 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-green-700 mb-12">
          About
        </h1>

        {/* About Text */}
        <div className="space-y-6 text-lg leading-relaxed mb-16">
          <p>
            <strong>Life Changers Ind</strong> is a next-generation technology company that empowers businesses to transform communication using WhatsApp. Our smart, scalable tools enable faster, more meaningful customer engagement.
          </p>
          <p>
            Our flagship product, <strong>LC WA Bulk Messenger</strong>, helps you automate messaging, extract contact data, and manage campaigns effortlessly—all while staying compliant and user-friendly.
          </p>
          <p>
            Whether you're a startup or an enterprise, our tools simplify outreach and boost growth through seamless communication.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-2">Our Mission</h2>
              <p>
                To revolutionize business messaging by making automation and engagement easier, smarter, and more human.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-2">Our Vision</h2>
              <p>
                To become the global leader in WhatsApp-based communication tools for business automation and success.
              </p>
            </div>
          </div>

          {/* <div className="pt-10">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Why Choose Us?</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Clean, user-friendly interface</li>
              <li>Fast, reliable messaging engine</li>
              <li>Advanced scraping and contact extraction tools</li>
              <li>Campaign tracking and delivery analytics</li>
              <li>24/7 support with frequent feature updates</li>
            </ul>
          </div> */}
        </div>

        {/* Services Section */}
        <div>
          <h2 className="text-3xl font-bold text-green-700 text-center mb-10">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-green-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  {service.icon}
                  <h3 className="text-xl font-semibold text-green-800">{service.title}</h3>
                </div>
                <p className="text-gray-700">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
        </div>
  );
}
