/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import { Button, Heading, Avatar, XTLogo } from '@/components';
import { getFileUrl } from '@/utils';
import useAuthStore from '@/stores/useAuthStore';
import { FOOTER_LEGAL_LINKS, NAV_LINKS } from '../_constants/public-layout.constants';

export const Header = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') setCurrentHash(window.location.hash);
  }, []);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (pathname !== '/') return;
    const handleScroll = () => {
      const contactEl = document.getElementById('contact');
      if (contactEl && contactEl.getBoundingClientRect().top <= window.innerHeight * 0.7) {
        setCurrentHash('#contact');
        return;
      }
      if (window.scrollY < 400 || !window.location.hash || window.location.hash === '#about') {
        setCurrentHash('#about');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const isLegalRoute =
    pathname?.startsWith('/privacy-policy') ||
    pathname?.startsWith('/terms-of-service') ||
    pathname?.startsWith('/refund-policy');

  const activeKey = pathname?.startsWith('/pricing')
    ? 'pricing'
    : pathname?.startsWith('/news')
      ? 'news'
      : isLegalRoute
        ? 'legal'
        : pathname === '/'
          ? currentHash === '#contact'
            ? 'contact'
            : 'about'
          : '';

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: (typeof NAV_LINKS)[number]) => {
    if (link.key === 'pricing' || link.key === 'news' || link.key === 'legal') return;
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <XTLogo className="h-8 w-8 drop-shadow-[0_2px_5px_rgba(4,88,99,0.35)]" />
          <Heading size="h1" className="tracking-tight text-primary">
            XTTECH
          </Heading>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeKey === link.key;
            if (link.key === 'legal') {
              return (
                <div key={link.href} className="group relative py-2">
                  <Link
                    href={link.href}
                    className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors ${
                      isActive ? 'text-primary' : 'text-gray-600 hover:text-primary'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute top-full left-1/2 z-50 w-52 -translate-x-1/2 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    <div className="rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                      {FOOTER_LEGAL_LINKS.map((item) => {
                        const ItemIcon = item.icon;
                        const isSubActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              isSubActive
                                ? 'bg-primary/10 font-semibold text-primary'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                            }`}
                          >
                            <ItemIcon className="h-4 w-4 shrink-0 text-primary" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

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
              <Link href="/app/dashboard" className="flex items-center gap-2 rounded-full p-1.5 pr-4 transition-colors hover:bg-gray-100">
                <Avatar src={getFileUrl(user.avatar) || undefined} name={user.fullName || user.username} size="sm" />
                <span className="hidden text-sm font-semibold text-gray-700 sm:inline">{user.fullName || user.username}</span>
              </Link>
            ) : (
              <Link href="/signin">
                <Button size="sm" className="rounded-full bg-primary px-5 text-white shadow-sm hover:bg-primary/90">
                  Đăng Nhập
                </Button>
              </Link>
            )
          ) : (
            <div className="h-8 w-[105px] animate-pulse rounded-full bg-gray-200" />
          )}

          <button
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg p-1.5 transition-colors hover:bg-gray-100 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`block h-[2px] w-5 rounded-full bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block h-[2px] w-5 rounded-full bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? 'scale-x-0 opacity-0' : ''}`} />
            <span className={`block h-[2px] w-5 rounded-full bg-gray-700 transition-all duration-300 ${mobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'max-h-96 border-t border-gray-200' : 'max-h-0'}`}>
        <nav className="flex flex-col gap-1 bg-white/95 px-4 py-3 backdrop-blur-md">
          {NAV_LINKS.map((link) => {
            const isActive = activeKey === link.key;
            if (link.key === 'legal') {
              return (
                <div key={link.href} className="space-y-1 py-1">
                  <div className="px-3 py-1 text-xs font-bold tracking-wider text-slate-400 uppercase">Pháp lý & Chính sách</div>
                  {FOOTER_LEGAL_LINKS.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                          isSubActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
                        }`}
                      >
                        <SubIcon className="h-4 w-4 shrink-0 text-primary" />
                        <span>{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleLinkClick(e, link);
                }}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
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
