import React from 'react';
// import { Search } from './Search';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 shadow-lg">
      <nav className="container mx-auto flex items-center justify-between p-4 text-gray-200">
        <a href="/" className="text-2xl font-bold text-white hover:text-red-500 transition-colors">
          GamePass<span className="text-red-500">Key</span>
        </a>
        <div className="hidden md:flex items-center space-x-6">
          <a href="/" className="hover:text-red-400 transition-colors">Home</a>
          <a href="/categories" className="hover:text-red-400 transition-colors">Categories</a>
          <a href="/about" className="hover:text-red-400 transition-colors">About</a>
        </div>
        {/* <Search /> */}
      </nav>
    </header>
  );
};