import React, { useState } from 'react';
import ContactPhoto from '../assets/imgs/contact.png';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! (In a real app, this would call your backend)');
    // Reset form or integrate with API
  };

  return (
    <div className="min-h-screen bg-blue-50 pt-32">
      {/* Header - Reuse your existing header component if available */}


      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Get in touch with us</h1>
          <p className="mt-3 text-gray-600">We're here to help you find your dream home</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Illustration */}
          <div className="hidden md:block relative">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 h-full flex items-center justify-center">
              <div className="text-center">
                {/* <div className="w-48 h-48 mx-auto bg-blue-500 rounded-2xl relative flex items-center justify-center overflow-hidden"> */}
                  {/* Simple SVG illustration matching screenshot */}
                  <img src={ContactPhoto}/>
                {/* </div> */}
                <div className="mt-8 space-y-4 hidden">
                  <div className="flex items-center gap-4 justify-center">
                    <div className="bg-white p-3 rounded-xl shadow">✉️</div>
                    <div>
                      <div className="font-medium">info@jemsta.com</div>
                      <div className="text-sm text-gray-500">Send us an email</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-center">
                    <div className="bg-white p-3 rounded-xl shadow">📞</div>
                    <div>
                      <div className="font-medium">+234 123 456 7890</div>
                      <div className="text-sm text-gray-500">Call our support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className=''>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text" name="subject" value={formData.subject} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="message" value={formData.message} onChange={handleChange} rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="Type your message here"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-medium py-4 rounded-xl transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;