import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="container mx-auto text-center p-6 text-gray-500">
        <p>&copy; {new Date().getFullYear()} Game Mechanics. All Rights Reserved.</p>
        <p className="text-sm">We have all of Games and Mods with no Hurdle</p>
      </div>
    </footer>
  );
};