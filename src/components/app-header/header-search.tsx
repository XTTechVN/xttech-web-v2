'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { rawSidebarSections, UserRole } from '@/config';
import { Input } from '@/components';

export interface HeaderSearchProps {
  userRole?: UserRole;
  setActive: (id: string) => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  href?: string;
  section?: string;
  icon?: React.ReactNode;
  parent?: string;
}

const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export function HeaderSearch({ userRole, setActive }: HeaderSearchProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const lowerQuery = removeAccents(query).toLowerCase();
    const results: SearchResultItem[] = [];

    rawSidebarSections.forEach((section) => {
      section.items.forEach((item) => {
        const hasAccess = !item.roles || (userRole && item.roles.includes(userRole));
        if (!hasAccess && userRole !== 'admin') return;

        const normalizedItemLabel = removeAccents(item.label).toLowerCase();
        if (normalizedItemLabel.includes(lowerQuery) && !item.subItems) {
          results.push({
            id: item.id,
            title: item.label,
            href: item.href,
            section: section.title,
            icon: item.icon,
          });
        }

        if (item.subItems) {
          item.subItems.forEach((sub) => {
            const hasSubAccess = !sub.roles || (userRole && sub.roles.includes(userRole));
            if (!hasSubAccess && userRole !== 'admin') return;

            const normalizedSubLabel = removeAccents(sub.label).toLowerCase();
            if (normalizedSubLabel.includes(lowerQuery)) {
              results.push({
                id: sub.id,
                title: sub.label,
                href: sub.href,
                section: section.title,
                parent: item.label,
              });
            }
          });
        }
      });
    });
    setSearchResults(results);
    setIsSearchOpen(true);
  };

  return (
    <div ref={searchRef} className="relative hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full max-w-md focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      <Search size={18} className="text-slate-400 mr-2 shrink-0" />
      <Input 
        type="text" 
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() => {
          if (searchQuery.trim()) setIsSearchOpen(true);
        }}
        placeholder="Tìm kiếm hệ thống..." 
        className="bg-transparent border-none shadow-none px-0 h-auto outline-none focus:ring-0 focus:border-transparent hover:border-transparent text-sm w-full text-slate-700 placeholder:text-slate-400"
      />
      
      {/* Search Results Dropdown */}
      {isSearchOpen && searchResults.length > 0 && (
        <div className="absolute top-[110%] left-0 right-0 bg-white rounded-lg shadow-xl border border-slate-200 max-h-[calc(100vh-100px)] overflow-y-auto z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-slate-500 px-3 py-2 uppercase tracking-wider">Kết quả tìm kiếm</div>
            {searchResults.map((result, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  if (result.href) {
                    router.push(result.href);
                    setIsSearchOpen(false);
                    setActive(result.id);
                    setSearchQuery('');
                  }
                }}
                className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer rounded-md transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{result.title}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {result.section} {result.parent ? ` > ${result.parent}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isSearchOpen && searchResults.length === 0 && searchQuery.trim() !== '' && (
        <div className="absolute top-[110%] left-0 right-0 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-4 text-center">
          <p className="text-sm text-slate-500">Không tìm thấy kết quả nào cho &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}
