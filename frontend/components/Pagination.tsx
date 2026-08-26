'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      aria-label="Pagination Navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '2.5rem',
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.55rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          backgroundColor: currentPage <= 1 ? '#f1f5f9' : '#ffffff',
          color: currentPage <= 1 ? '#94a3b8' : '#334155',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <span aria-hidden="true">&larr;</span> Previous
      </button>

      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '0.4rem 0.6rem',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  userSelect: 'none',
                }}
              >
                &hellip;
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              style={{
                minWidth: '2.4rem',
                height: '2.4rem',
                padding: '0 0.5rem',
                borderRadius: '8px',
                border: isActive ? '1px solid #10b981' : '1px solid #e2e8f0',
                backgroundColor: isActive ? '#10b981' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive
                  ? '0 2px 6px rgba(16, 185, 129, 0.25)'
                  : '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.55rem 1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          backgroundColor: currentPage >= totalPages ? '#f1f5f9' : '#ffffff',
          color: currentPage >= totalPages ? '#94a3b8' : '#334155',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        Next <span aria-hidden="true">&rarr;</span>
      </button>
    </nav>
  );
}
