import React from 'react';
import HeroSection from './HeroSection';
import CoreServices from './CoreServices';
import WhatWeCanHelp from './WhatWeCanHelp';
import WhyChooseUs from './WhyChooseUs';
import HowItWorks from './HowItWorks';
import OwnProperty from './OwnProperty';
import ExploreHomes from './ExploreHomes';
import Partnership from './Partnership';
import Footer from './Footer';
import Header from './Header';
const LandingPage = () => {
  return (
    <>
        <Header />
        <HeroSection />
        <CoreServices />
        <WhatWeCanHelp />
        <WhyChooseUs />
        <HowItWorks />
        <OwnProperty />
        <ExploreHomes />
        <Partnership />
        <Footer />
    </>
  )
}

export default LandingPage