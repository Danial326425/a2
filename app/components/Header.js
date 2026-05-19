"use client";

import { useState, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaHeadset,
  FaPhoneAlt,
  FaEnvelope,
  FaBars,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import { HeaderContext } from '../context/HeaderContext';
import { config } from "@/config/config";
import SearchResults from './SearchResults';

export default function Header() {
  const {
    categories,
    contactInfo,
    logo,
    headerMenus,
    error,
    apiStorageUrl,
    searchProducts,
    showResults,
    handleSearch,
    setShowResults,
  } = useContext(HeaderContext);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);

  const clearSearch = () => {
    setSearchText('');
    setShowResults(false);
  };

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-2 text-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="mb-2 md:mb-0 text-center md:text-left">
            Welcome to Our Online Store!
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <a
              href={`tel:${contactInfo.phone}`}
              className="flex items-center hover:text-green-100 transition-colors"
            >
              <FaPhoneAlt className="mr-1" /> {contactInfo.phone}
            </a>
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center hover:text-green-100 transition-colors"
            >
              <FaEnvelope className="mr-1" /> {contactInfo.email}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white shadow-sm">
        {/* Main Header */}
        <div className="py-3 px-4 border-b border-gray-200">
          <div className="container mx-auto">
            {/* Mobile Top Row */}
            <div className="flex md:hidden justify-between items-center mb-3">
              <button
                className="text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setCategoryOpen(!categoryOpen)}
              >
                <FaBars />
              </button>

              <Link href="/" className="mx-auto">
                <Image
                  src={`${apiStorageUrl}/${logo}`}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                  priority
                  sizes="40px"
                />
              </Link>

              <div className="flex items-center space-x-3">
                <button
                  className="text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setSearchOpen(!searchOpen)}
                >
                  <FaSearch />
                </button>
                <Link
                  href="/contact"
                  className="text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Contact"
                >
                  <FaHeadset />
                </Link>
              </div>
            </div>

            {/* Desktop Top Row */}
            <div className="hidden md:flex items-center justify-between">
              <Link href="/" className="mr-6">
                <Image
                  src={`${apiStorageUrl}/${logo}`}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="h-12 w-auto"
                  priority
                  sizes="48px"
                />
              </Link>

              {/* Search Bar */}
              <div className="flex-grow max-w-2xl mx-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch(searchText);
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full px-5 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                  />
                  {searchText && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-full px-4 bg-green-600 text-white rounded-r-full hover:bg-green-700 transition flex items-center"
                  >
                    <FaSearch />
                  </button>
                </form>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-4">
                <Link
                  href="/contact"
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="p-2 hover:bg-blue-50 rounded-full">
                    <FaHeadset className="text-lg" />
                  </div>
                  <span className="ml-2 hidden lg:inline-block">Support</span>
                </Link>
              </div>
            </div>

            {/* Mobile Search */}
            {searchOpen && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchText);
                }}
                className="mt-3 md:hidden flex"
              >
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition"
                >
                  <FaSearch />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-b border-gray-200 shadow-xs">
          <div className="container mx-auto px-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-between">
              <div className="relative">
                <button
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                >
                  <FaBars className="mr-2" />
                  <span>All Categories</span>
                </button>

                {categoryOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                    <ul className="py-2">
                      <li>
                        <Link
                          href="/shop"
                          className="block px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors flex items-center"
                          onClick={() => setCategoryOpen(false)}
                        >
                          <span className="truncate">All Products</span>
                        </Link>
                      </li>

                      {categories.map((category) => (
                        <li key={category.id}>
                          <Link
                            href={`/category/${category.id}`}
                            className="block px-5 py-2.5 hover:bg-gray-50 text-gray-800 transition-colors flex items-center"
                            onClick={() => setCategoryOpen(false)}
                          >
                            <span className="truncate">{category.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <nav className="flex-1 ml-6">
                <ul className="flex space-x-1">
                  {headerMenus.map((menu) => (
                    <li key={menu.id}>
                      <Link
                        href={menu.url}
                        className="inline-block px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                      >
                        {menu.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Mobile Category Drawer */}
            {categoryOpen && (
              <div className="md:hidden fixed inset-0 z-50">
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                  onClick={() => setCategoryOpen(false)}
                />

                <div className="absolute top-0 left-0 h-full w-4/5 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Categories
                    </h3>
                    <button
                      onClick={() => setCategoryOpen(false)}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                      aria-label="Close menu"
                    >
                      <FaTimes className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="overflow-y-auto h-[calc(100%-56px)]">
                    <Link
                      href="/shop"
                      className="block px-5 py-3.5 text-gray-800 hover:bg-blue-50 transition-colors border-b border-gray-100 flex items-center"
                      onClick={() => setCategoryOpen(false)}
                    >
                      <span className="font-medium">All Products</span>
                    </Link>

                    <ul>
                      {categories.map((category) => (
                        <li key={`mobile-cat-${category.id}`}>
                          <Link
                            href={`/category/${category.id}`}
                            className="block px-5 py-3.5 text-gray-700 hover:bg-blue-50 transition-colors border-b border-gray-100"
                            onClick={() => setCategoryOpen(false)}
                          >
                            <div className="flex items-center">
                              <span className="truncate">{category.name}</span>
                              {category.new && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="bg-white shadow-lg">
            <SearchResults products={searchProducts} />
          </div>
        )}

      </header>
    </>
  );
}

