
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-4 px-4 w-full">
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold text-center text-gym-800">
          Gyma <span className="text-primary">AI</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
