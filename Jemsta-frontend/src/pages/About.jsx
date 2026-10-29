import LivingRoom from "../assets/imgs/livingroom.png";
import Modern from "../assets/imgs/modern.jpg";
import Team from "../assets/imgs/team.jpg";

import JemstaLogo from "../assets/imgs/jrem.jpg";
import Mortgage2MatchLogo from "../assets/imgs/m2m.gif";
import AnythingPropertyLogo from "../assets/imgs/AnythingPM.jpg";
import APLogo from "../assets/imgs/ask.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-blue-50 pt-32">
      {/* Header */}

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900">
            About Jemsta Estate Agency
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-4xl mx-auto leading-8">
            Jemsta Estate Agency is part of the Jemsta Group, providing
            professional property services across the UK. We specialise in
            letting, property sales, and property management, helping landlords,
            homeowners, tenants, buyers, and investors navigate the property
            market with confidence.
          </p>

          <p className="mt-5 text-lg text-gray-600 max-w-4xl mx-auto leading-8">
            Our approach is built around professionalism, transparency, and
            long-term relationships. From finding the right property and
            supporting successful transactions to ensuring properties are well
            managed and maintained, we aim to make every stage of the property
            journey simple, efficient, and dependable.
          </p>
        </div>

        <div className="mt-20 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              The Jemsta Group
            </h2>

            <p className="mt-5 text-lg text-gray-600 max-w-4xl mx-auto leading-8">
              Our services are supported by a wider group of specialist
              businesses, allowing us to provide a more connected property
              experience from investment and finance to legal support,
              maintenance, and management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Jemsta Real Estate & Management */}
            <a
              href="https://jemstarealestate.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-70 group-hover:scale-125 transition-transform duration-500" />

              {/* Logo */}
              <div className="relative flex items-center justify-center w-40 h-40 mb-6 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-blue-50 transition-colors duration-300">
                <img
                  src={JemstaLogo}
                  alt="Jemsta Real Estate & Management LTD logo"
                  className="max-w-[150px] max-h-[150px] object-contain"
                />
              </div>

              <div className="relative">
                <div className="w-10 h-1 bg-blue-600 rounded-full mb-5 group-hover:w-16 transition-all duration-300" />

                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Jemsta Real Estate & Management LTD
                </h3>

                <p className="text-gray-600 leading-7">
                  A property investment company providing opportunities for
                  Nigerians to invest in the UK real estate market, with a focus
                  on creating sustainable property investment opportunities.
                </p>

                <span className="inline-flex items-center gap-2 mt-5 font-medium text-blue-600">
                  Visit website
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </span>
              </div>
            </a>

            {/* Mortgage2Match */}
            <a
              href="https://www.mortgage2match.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full opacity-70 group-hover:scale-125 transition-transform duration-500" />

              {/* Logo */}
              <div className="relative flex items-center justify-center w-40 h-40 mb-6 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-indigo-50 transition-colors duration-300">
                <img
                  src={Mortgage2MatchLogo}
                  alt="Mortgage2Match logo"
                  className="max-w-[150px] max-h-[150px] object-contain"
                />
              </div>

              <div className="relative">
                <div className="w-10 h-1 bg-indigo-600 rounded-full mb-5 group-hover:w-16 transition-all duration-300" />

                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Mortgage2Match
                </h3>

                <p className="text-gray-600 leading-7">
                  Providing expert mortgage and financial advice, helping
                  clients understand their financing options and make informed
                  decisions when purchasing, refinancing, or investing in
                  property.
                </p>

                <span className="inline-flex items-center gap-2 mt-5 font-medium text-blue-600">
                  Visit website
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </span>
              </div>
            </a>

            {/* Anything Property Maintenance */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-70 group-hover:scale-125 transition-transform duration-500" />

              {/* Logo */}
              <div className="relative flex items-center justify-center w-40 h-40 mb-6 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-emerald-50 transition-colors duration-300">
                <img
                  src={AnythingPropertyLogo}
                  alt="Anything Property Maintenance logo"
                  className="max-w-[150px] max-h-[150px] object-contain"
                />
              </div>

              <div className="relative">
                <div className="w-10 h-1 bg-emerald-600 rounded-full mb-5 group-hover:w-16 transition-all duration-300" />

                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Anything Property Maintenance
                </h3>

                <p className="text-gray-600 leading-7">
                  Specialising in property maintenance, refurbishment,
                  renovation, and major development projects, helping ensure
                  properties remain functional, attractive, and well maintained.
                </p>
              </div>
            </div>

            {/* A & P */}
            <div className="group relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full opacity-70 group-hover:scale-125 transition-transform duration-500" />

              {/* Logo */}
              <div className="relative flex items-center justify-center w-40 h-40 mb-6 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-purple-50 transition-colors duration-300">
                <img
                  src={APLogo}
                  alt="A & P logo"
                  className="max-w-[150px] max-h-[150px] object-contain"
                />
              </div>

              <div className="relative">
                <div className="w-10 h-1 bg-purple-600 rounded-full mb-5 group-hover:w-16 transition-all duration-300" />

                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  ASK & Parners
                </h3>

                <p className="text-gray-600 leading-7">
                  Providing legal support across the Group, with a focus on
                  compliance, risk management, contractual integrity, dispute
                  resolution, and legal guidance throughout property
                  acquisition, development, and disposal.
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-16 border-primary" />

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900">
            What Makes Us Different
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-4xl mx-auto leading-8">
            At Jemsta UK, we believe that exceptional real estate services are
            built on trust, expertise, and innovation. Every interaction is
            guided by our commitment to integrity, client education, and
            delivering tailored solutions that make buying, selling, renting,
            and managing properties a seamless experience.
          </p>
        </div>

        <div className="space-y-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src={LivingRoom}
                alt="Mission"
                className="rounded-3xl shadow"
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold mb-6">
                Top-Notch Property Guidance
              </h2>
              <p className="text-lg text-gray-600 leading-8">
                Whether you're purchasing your first home, expanding your
                property portfolio, or preparing to sell, our experienced
                advisors are here to guide you through every stage of the
                journey. We take time to understand your goals, answer your
                questions, and provide trusted recommendations that help you
                make confident, informed decisions from start to finish.
              </p>
            </div>
          </div>

          {/* Similar sections for Vision and Core Values */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <img src={Modern} alt="Vision" className="rounded-3xl shadow" />
            </div>
            <div className="md:order-1">
              <h2 className="text-3xl font-semibold mb-6">
                Technology-Driven Service
              </h2>
              <p className="text-lg text-gray-600 leading-8">
                We combine local market expertise with modern technology to
                simplify every aspect of your property search. From discovering
                available homes to staying informed about market opportunities,
                our digital-first approach ensures you have the right
                information exactly when you need it, making the entire process
                faster, smoother, and more transparent.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img src={Team} alt="Values" className="rounded-3xl shadow" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold mb-6">
                Built on Trust & Lasting Relationships
              </h2>
              <p className="text-lg text-gray-600 leading-8 mb-6">
                Our success is measured by the confidence our clients place in
                us. Every service we provide is rooted in professionalism,
                transparency, and a genuine commitment to helping people achieve
                their property goals.
              </p>

              <ul className="space-y-4 text-lg text-gray-600">
                <li>✓ Integrity and transparency in every transaction.</li>
                <li>✓ Personalised guidance tailored to every client.</li>
                <li>
                  ✓ Trusted recommendations from experienced professionals.
                </li>
                <li>✓ Innovative solutions backed by modern technology.</li>
                <li>
                  ✓ Dedicated support before, during, and after every
                  transaction.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  );
};

export default About;