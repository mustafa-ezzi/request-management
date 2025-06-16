import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            bottom: 0,
            left: 0,
            right: 0,
            color: '#9CA3AF',
            textAlign: 'center',
            padding: '0.75rem',
            fontSize: '0.875rem',
            zIndex: 0,
            // background: "linear-gradient(45deg, #000000, #300030, #4d0014, #200020)"
            background: "linear-gradient(ellipse at center, #DC143C 0%, #300040 50%, #000000 80%)"
            

        }}
            className=''>
            {/* © {currentYear}  */}
        </footer>
    );
};

export default Footer;