import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import logo from '../assets/img/mainLogo.png';

const MiqaatHome = () => {
  const history = useHistory();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleCardClick = (type) => {
    history.push(`/app/tables?miqaat_type=${type}`);
  };

  const cardContainerClass = "relative overflow-hidden rounded-lg p-8 flex flex-col items-center cursor-pointer transition-all duration-300 border border-opacity-50 dark:border-opacity-20";
  const overlayClass = "absolute inset-0 opacity-0 transition-opacity duration-300";
  const cardContentClass = "flex flex-col items-center text-center relative z-10";
  const iconContainerClass = "w-20 h-20 rounded-lg flex items-center justify-center mb-6 shadow-lg transition-transform duration-300";
  const titleClass = "text-lg font-medium text-gray-800 dark:text-white";
  const underlineClass = "h-1 rounded-full mt-4 transition-all duration-300";
  
  const cardStyles = {
    general: {
      gradientBg: 'linear-gradient(to bottom right, #8b5cf6, #7c3aed)',
      borderColor: '#edebfe',
      shadowColor: 'rgba(139, 92, 246, 0.2)'
    },
    private: {
      gradientBg: 'linear-gradient(to bottom right, #3b82f6, #22d3ee)',
      borderColor: '#dbeafe',
      shadowColor: 'rgba(59, 130, 246, 0.2)'
    },
    ramadan: {
      gradientBg: 'linear-gradient(to bottom right, #6366f1, #3b82f6)',
      borderColor: '#e0e7ff',
      shadowColor: 'rgba(99, 102, 241, 0.2)'
    }
  };

  const renderCard = (type, icon, title) => {
    const styles = cardStyles[type];
    const cardType = type === 'general' ? 'general_miqaats' : type === 'private' ? 'private_events' : 'ramadan';
    
    return (
      <div
        className={`${cardContainerClass} ${hoveredCard === type ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
        onClick={() => handleCardClick(cardType)}
        onMouseEnter={() => setHoveredCard(type)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          borderColor: styles.borderColor
        }}
      >
        <div 
          className={overlayClass}
          style={{
            background: 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05))',
            opacity: hoveredCard === type ? 1 : 0
          }}
        />
        <div className={cardContentClass}>
          <div 
            className={iconContainerClass}
            style={{
              background: styles.gradientBg,
              boxShadow: `0 10px 15px -3px ${styles.shadowColor}`,
              transform: hoveredCard === type ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            {icon}
          </div>
          <h3 className={titleClass}>{title}</h3>
          <div 
            className={underlineClass}
            style={{
              background: styles.gradientBg,
              width: hoveredCard === type ? '6rem' : '3rem'
            }}
          />
        </div>
      </div>
    );
  };

  return (
           <div className="relative w-full px-4 py-6">
            {/* Watermark Logo */}
            <img
              src={logo}
              alt="Watermark"
              className="absolute opacity-10 pointer-events-none"
              style={{
                  top: "50%",
                  left: "50%",
                transform: "translate(-50%, -50%)",
                width: "40%",
                      opacity: 0.05,
                zIndex: 0,
              }}
            />
        
            {/* Content Overlay */}
            <div className="relative z-10">
    <div className="p-6 flex justify-center items-center min-h-screen" >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {/* General Card */}
        {renderCard('general', 
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>,
          'General Miqaat'
        )}

        {/* Private Card */}
        {renderCard('private', 
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>,
          'Private Event'
        )}

        {/* Ramadan Card */}
        {renderCard('ramadan', 
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
          </svg>,
          'Ramadan'
        )}
      </div>
    </div>
    </div>
    </div>
  );
};

export default MiqaatHome;