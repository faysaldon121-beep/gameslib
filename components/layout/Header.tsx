"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from "lucide-react";
import GamepadIcon from "../GamepadIcon";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0e27]/95 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
             <GamepadIcon/>
              <span className="text-lg font-bold text-white hidden sm:block">
                Games<span className="text-blue-500">lib</span>
              </span>
            </Link>
          </div>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Home
            </Link>
            
            <Link
              href="/games"
              className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              All Games
            </Link>

            <Link
              href="/top"
              className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Top
            </Link>

            <Link
              href="/trending"
              className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Trending
            </Link>

            {/* Genre Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setGenreOpen(true)}
              onMouseLeave={() => setGenreOpen(false)}
            >
              <button 
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                Genre
                <svg 
                  className={`w-3.5 h-3.5 transition-transform ${genreOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {genreOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#1a1f3a] border border-gray-700/50 rounded-lg shadow-2xl py-1.5">
                  {['Action', 'Adventure', 'RPG', 'Horror', 'Simulation', 'Strategy', 'Sports', 'Racing'].map((genre) => (
                    <Link
                      key={genre}
                      href={`/genre/${genre.toLowerCase()}`}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/collections"
              className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Collections
            </Link>

            {/* More Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button 
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                More
                <svg 
                  className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {moreOpen && (
                <div className="absolute top-full right-0 mt-1 w-44 bg-[#1a1f3a] border border-gray-700/50 rounded-lg shadow-2xl py-1.5">
                  <Link href="/request" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                    Request
                  </Link>
                  <Link href="/donate" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5">
                    Donate
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            {/* Search Button */}
         

            {/* Theme Toggle */}
            <button 
              className="hidden sm:block p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              aria-label="Toggle theme"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            {/* Desktop Auth Buttons */}
               <Link
      href="/search"
      className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-g-card transition-colors"
      aria-label="Search"
    >
      <Search className="w-5 h-5 text-g-muted hover:text-g-text" />
    </Link>
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link 
                href="/auth/login"
                className="px-3.5 py-1.5 text-sm font-medium text-gray-300 hover:text-white border border-gray-600/50 hover:border-gray-500 rounded-md transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/auth/register"
                className="px-3.5 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-lg shadow-blue-600/20"
              >
                Sign up
              </Link>
            </div>

            {/* Mobile User Icon */}
            <Link 
              href="/auth/login"
              className="sm:hidden p-2 text-gray-400 hover:text-white"
              aria-label="Account"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0f1229] border-t border-gray-800/50">
          <nav className="px-4 py-3 space-y-1">
            <Link href="/" className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">
              Home
            </Link>
            <Link href="/games" className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">
              All Games
            </Link>
            <Link href="/top" className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">
              Top
            </Link>
            <Link href="/trending" className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">
              Trending
            </Link>
            
            {/* Mobile Genre Accordion */}
            <div>
              <button 
                onClick={() => setGenreOpen(!genreOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
              >
                Genre
                <svg 
                  className={`w-4 h-4 transition-transform ${genreOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {genreOpen && (
                <div className="pl-4 mt-1 space-y-1">
                  {['Action', 'Adventure', 'RPG', 'Horror', 'Simulation'].map((genre) => (
                    <Link
                      key={genre}
                      href={`/genre/${genre.toLowerCase()}`}
                      className="block px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-md"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/collections" className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">
              Collections
            </Link>
            <Link href="/request" className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">
              Request
            </Link>
            <Link href="/donate" className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">
              Donate
            </Link>

            {/* Mobile Auth Buttons */}
            <div className="pt-3 mt-3 border-t border-gray-800/50 space-y-2">
              <Link 
                href="/auth/login"
                className="block w-full text-center px-4 py-2 text-sm font-medium text-white border border-gray-600/50 rounded-md"
              >
                Log in
              </Link>
              <Link 
                href="/auth/register"
                className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
              >
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
