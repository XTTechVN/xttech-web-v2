/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Thành phần dùng chung cho components
import { Button, Heading, Avatar, XTLogo } from '@/components';
import { getFileUrl } from '@/utils';
import useAuthStore from '@/stores/useAuthStore';

const NAV_LINKS = [
  { href: '/#about', label: 'Về chúng tôi', key: 'about' },
  { href: '/pricing', label: 'Giá', key: 'pricing' },
  { href: '/#contact', label: 'Liên hệ', key: 'contact' },
];

export const Header = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Theo dõi vị trí cuộn trên trang chủ '/' để tự động cập nhật active giữa 'about' và 'contact'
  useEffect(() => {
    if (pathname !== '/') return;

    const handleScroll = () => {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.7) {
          setCurrentHash('#contact');
          return;
        }
      }
      if (window.scrollY < 400 || !window.location.hash || window.location.hash === '#about') {
        setCurrentHash('#about');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const activeKey = pathname?.startsWith('/pricing')
    ? 'pricing'
    : pathname === '/'
    ? currentHash === '#contact'
      ? 'contact'
      : 'about'
    : '';

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: (typeof NAV_LINKS)[number],
  ) => {
    if (link.key === 'pricing') {
      return;
    }

    if (pathname === '/') {
      const targetEl = document.getElementById(link.key);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${link.key}`);
        setCurrentHash(`#${link.key}`);
      }
    } else {
      setCurrentHash(`#${link.key}`);
    }
  };

  // Đóng menu khi resize lên desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="w-full border-b border-gray-200 bg-white backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              window.history.pushState(null, '', '/');
              setCurrentHash('#about');
            }
          }}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <XTLogo className="w-8 h-8 drop-shadow-[0_2px_5px_rgba(4,88,99,0.35)]" />
          <Heading size="h1" className="text-primary tracking-tight">
            XTTECH
          </Heading>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = activeKey === link.key;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`text-sm font-semibold transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Auth + Hamburger */}
        <div className="flex items-center gap-3">
          {mounted ? (
            isAuthenticated && user ? (
              <Link href="/app/dashboard" className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-full pr-4 transition-colors">
                <Avatar
                  src={getFileUrl(user.avatar) || undefined}
                  name={user.fullName || user.username}
                  size="sm"
                />
                <span className="text-sm font-semibold text-gray-700 hidden sm:inline">{user.fullName || user.username}</span>
              </Link>
            ) : (
              <Link href="/signin">
                <Button size="sm" className="rounded-full px-5 bg-primary hover:bg-primary/90 shadow-sm text-white">
                  Đăng Nhập
                </Button>
              </Link>
            )
          ) : (
            <div className="w-[105px] h-8 bg-gray-200 animate-pulse rounded-full"></div>
          )}

          {/* Hamburger Button - mobile only */}
          <button
            className="md:hidden flex flex-col items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors gap-[5px] p-1.5"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span
              className={`block w-5 h-[2px] bg-gray-700 rounded-full transition-all duration-300 ${
                mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`block w-5 h-[2px] bg-gray-700 rounded-full transition-all duration-300 ${
                mobileMenuOpen ? 'opacity-0 scale-x-0' : ''
              }`}
            />
            <span
              className={`block w-5 h-[2px] bg-gray-700 rounded-full transition-all duration-300 ${
                mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-60 border-t border-gray-200' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col px-4 py-3 bg-white/95 backdrop-blur-md gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = activeKey === link.key;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleLinkClick(e, link);
                }}
                className={`text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
