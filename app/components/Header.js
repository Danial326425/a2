"use client";

import { useState, useContext, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaUser,
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
  const [loginOpen, setLoginOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  const clearSearch = () => {
    setSearchText('');
    setShowResults(false);
  };

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch(`${config.apiUrl}/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            localStorage.removeItem('authToken');
          }
        } catch {
          localStorage.removeItem('authToken');
        }
      }
    };
    checkLoggedInUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!phone.match(/^01[3-9]\d{8}$/)) {
      setLoginError('সঠিক মোবাইল নম্বর দিন (১১ ডিজিট, 01 দিয়ে শুরু)');
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}/userlogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('phone', phone);
        setLoginOpen(false);
        router.refresh();
      } else {
        setLoginError('লগইন সফল হয়নি');
      }
    } catch {
      setLoginError('লগইনে সমস্যা হয়েছে, পরে চেষ্টা করুন');
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch(`${config.apiUrl}/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore error
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('phone');
      setUser(null);
      setPhone('');
      setLoginOpen(false);
      router.refresh();
    }
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
                />
              </Link>

              <div className="flex items-center space-x-3">
                <button
                  className="text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setSearchOpen(!searchOpen)}
                >
                  <FaSearch />
                </button>
                <button
                  className="text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setLoginOpen(true)}
                >
                  <FaUser />
                </button>
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
                <button
                  className="flex items-center text-gray-700 hover:text-green-600 transition-colors group"
                  onClick={() => setLoginOpen(true)}
                >
                  <div className="relative p-2 group-hover:bg-green-50 rounded-full">
                    <FaUser className="text-lg" />
                  </div>
                  <span className="ml-2 hidden lg:inline-block">
                    {user ? user.name : 'Account'}
                  </span>
                </button>

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

        {/* Login Modal */}
        {loginOpen && <LoginModal user={user} phone={phone} setPhone={setPhone} loginError={loginError} handleLogin={handleLogin} handleLogout={handleLogout} onClose={() => { setLoginOpen(false); setLoginError(''); setPhone(''); }} />}
      </header>
    </>
  );
}

function LoginModal({ user, phone, setPhone, loginError, handleLogin, handleLogout, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold">
            {user ? 'My Account' : 'Login'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5">
          {!user ? (
            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="block text-gray-700 mb-2 font-medium">
                  মোবাইল নম্বর
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                {loginError && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {loginError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-md"
              >
                লগইন
              </button>
            </form>
          ) : (
            <div>
              <div className="flex items-start mb-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FaUser className="text-green-600 text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{user.name}</h4>
                  <p className="text-gray-600">{user.phone}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition font-medium border border-gray-200"
              >
                লগআউট
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}