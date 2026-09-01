'use client';

import React, { useState, useEffect, useTransition } from 'react';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import OrderModal from '../../components/OrderModal';
import { getProduces, Produce, ProduceCategory } from '../../lib/api';

const CATEGORIES: { label: string; value: string; icon: string }[] = [
  { label: 'All Produce', value: 'ALL', icon: '🧺' },
  { label: 'Vegetables', value: 'VEGETABLES', icon: '🥦' },
  { label: 'Fruits', value: 'FRUITS', icon: '🍎' },
  { label: 'Grains', value: 'GRAINS', icon: '🌾' },
  { label: 'Tubers', value: 'TUBERS', icon: '🥔' },
  { label: 'Herbs & Greens', value: 'HERBS', icon: '🌿' },
  { label: 'Dairy', value: 'DAIRY', icon: '🥛' },
];

export default function RetailerCataloguePage() {
  const [produces, setProduces] = useState<Produce[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'quantity' | 'name'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected produce for quick order modal
  const [selectedProduce, setSelectedProduce] = useState<Produce | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [, startTransition] = useTransition();

  const loadProduces = async (
    page: number,
    cat: string,
    stat: string,
    searchQuery: string,
    sort: 'createdAt' | 'price' | 'quantity' | 'name',
    sortOrder: 'asc' | 'desc'
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await getProduces({
        page,
        limit: 8,
        category: cat,
        status: stat,
        search: searchQuery,
        sortBy: sort,
        order: sortOrder,
      });

      setProduces(res.produces.filter((produce) => produce.status !== 'OUT_OF_STOCK' && produce.status !== 'ARCHIVED' && produce.quantity > 0));
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
      setCurrentPage(res.pagination.page);
    } catch (err) {
      console.error('Failed to load produces:', err);
      setProduces([]);
      setTotalPages(1);
      setTotalCount(0);
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load the catalogue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProduces(currentPage, category, status, search, sortBy, order);
  }, [currentPage, category, status, sortBy, order]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProduces(1, category, status, search, sortBy, order);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleQuickOrder = (prod: Produce) => {
    setSelectedProduce(prod);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="main-content">
      {errorMessage && (
        <div
          role="alert"
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            color: '#b91c1c',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '0.85rem 1rem',
          }}
        >
          <span>Unable to load the catalogue: {errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss catalogue error"
            style={{ background: 'none', border: 0, color: '#b91c1c', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            &times;
          </button>
        </div>
      )}
      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '700px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: '1rem',
              textTransform: 'uppercase',
            }}
          >
            🚜 Direct Farm Sourcing
          </div>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}
          >
            Fresh Produce Wholesale Catalogue
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: '#d1fae5',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            Source verified, high-quality farm produce at transparent wholesale rates with direct farmer traceability and zero middleman markup.
          </p>

          {/* Quick Stats */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap',
              paddingTop: '0.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, display: 'block' }}>
                {totalCount}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#a7f3d0', textTransform: 'uppercase' }}>
                Produce Listings
              </span>
            </div>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, display: 'block' }}>100%</span>
              <span style={{ fontSize: '0.75rem', color: '#a7f3d0', textTransform: 'uppercase' }}>
                Quality Assured
              </span>
            </div>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, display: 'block' }}>24h</span>
              <span style={{ fontSize: '0.75rem', color: '#a7f3d0', textTransform: 'uppercase' }}>
                Direct Dispatch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '1.5rem',
        }}
      >
        {/* Search & Sort Row */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              flex: '1 1 320px',
              gap: '0.5rem',
            }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search tomatoes, onions, carrots, etc..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              >
                🔍
              </span>
            </div>
            <button
              type="submit"
              style={{
                padding: '0.65rem 1.25rem',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderRadius: '10px',
              }}
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  loadProduces(1, category, status, '', sortBy, order);
                }}
                style={{
                  padding: '0.65rem 0.9rem',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  borderRadius: '10px',
                }}
              >
                Reset
              </button>
            )}
          </form>

          {/* Sort & Availability Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status Selector */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              <option value="ALL">All Stock Status</option>
              <option value="AVAILABLE">Available Now</option>
              <option value="LOW_STOCK">Low Stock</option>
            </select>

            {/* Sort Selector */}
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sort, ord] = e.target.value.split('-') as [
                  'createdAt' | 'price' | 'quantity' | 'name',
                  'asc' | 'desc'
                ];
                setSortBy(sort);
                setOrder(ord);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              <option value="createdAt-desc">Newest Listings</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="quantity-desc">Stock: High to Low</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: isSelected ? '1px solid #10b981' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#10b981' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#475569',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 2px 4px rgba(16, 185, 129, 0.2)' : 'none',
                }}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid Results Section */}
      <section>
        {/* Results Count & Meta */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
            Showing <strong>{produces.length}</strong> of <strong>{totalCount}</strong> produce listings
          </p>
          {category !== 'ALL' && (
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              Filtered by: {category}
            </span>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="catalogue-grid">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  height: '380px',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1rem',
                  gap: '1rem',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              >
                <div style={{ backgroundColor: '#f1f5f9', height: '180px', borderRadius: '12px' }} />
                <div style={{ backgroundColor: '#f1f5f9', height: '24px', width: '70%', borderRadius: '6px' }} />
                <div style={{ backgroundColor: '#f1f5f9', height: '40px', borderRadius: '8px' }} />
                <div style={{ backgroundColor: '#f1f5f9', height: '30px', marginTop: 'auto', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        ) : produces.length === 0 ? (
          /* Empty State */
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '540px',
              margin: '2rem auto',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌾</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              No Produce Listings Found
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              We couldn&apos;t find any produce matching your current search criteria or category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory('ALL');
                setStatus('ALL');
                setSearch('');
                setCurrentPage(1);
                loadProduces(1, 'ALL', 'ALL', '', 'createdAt', 'desc');
              }}
              style={{
                padding: '0.7rem 1.5rem',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '10px',
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Product Grid */
      <div className="catalogue-grid"> 
     {produces.map((produce) => ( 
      <ProductCard key={produce.id} produce={produce} onOrderClick={handleQuickOrder} /> 
       ))} 
      </div>

        )}

        {/* Pagination Bar */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </section>

      {/* Order Modal */}
      <OrderModal
        produce={selectedProduce}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedProduce(null);
        }}
      />
    </div>
  );
}
