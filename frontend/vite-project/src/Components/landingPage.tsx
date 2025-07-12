import React from 'react';
import LandingPageImage from '../../public/LandingPage.png';

interface LandingPageProps {
  showSignInPrompt?: boolean;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  description = "Experience the power of AI conversation",
  buttonText = "Get Started",
  buttonHref = "/sign-in",
  onButtonClick
}) => {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonHref) {
      window.location.href = buttonHref;
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Background image */}
      <img
        src={LandingPageImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30 pointer-events-none z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none z-10"></div>

      {/* Centered content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center">
        
    
        <button
          onClick={handleButtonClick}
          className="bg-gradient-to-r from-amber-300 to-amber-400  px-12 py-4 rounded-xl hover:amber-400 hover:to-amber-500 transition-all duration-300 shadow-xs animate-bounce  shadow-amber-300 hover:shadow-amber-500/25 transform border-2  hover:scale-103 text-md font-medium text-black"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;