'use client';

import React, { useContext, useMemo } from "react";
import Image from 'next/image';
import Link from 'next/link';
import {
  FaMapMarkerAlt, FaPhone, FaEnvelope,
  FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaLinkedin,
  FaWhatsapp, FaTelegram, FaTiktok, FaPinterest, FaReddit,
  FaDiscord, FaSnapchat, FaSpotify, FaGithub, FaMedium, FaGlobe,
} from "react-icons/fa";
import { HeaderContext } from "../context/HeaderContext";

// Tree-shakeable curated icon map. Admin-stored `icon_class` strings are
// matched against this whitelist; unknown classes fall back to FaGlobe.
// Adding 'import * as FaIcons' previously pulled the entire react-icons/fa
// bundle (~150KB) into the client; this list keeps only what we actually use.
const SOCIAL_ICONS = {
  FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaLinkedin,
  FaWhatsapp, FaTelegram, FaTiktok, FaPinterest, FaReddit,
  FaDiscord, FaSnapchat, FaSpotify, FaGithub, FaMedium, FaGlobe,
};

const Footer = React.memo(function Footer() {
  const { logo, contactInfo, socialLinks, footerMenus, apiStorageUrl } = useContext(HeaderContext);

  const currentYear = new Date().getFullYear();
  const copyrightHtml = useMemo(
    () => contactInfo?.copyright_html?.trim() || `&copy; ${currentYear} All Rights Reserved.`,
    [contactInfo?.copyright_html, currentYear]
  );

  // Pre-resolve each social link's icon component once per socialLinks change
  const resolvedSocials = useMemo(
    () => (socialLinks || []).map((link) => ({
      ...link,
      Icon: SOCIAL_ICONS[link.icon_class] || FaGlobe,
    })),
    [socialLinks]
  );

  return (
    <footer className="bg-gradient-to-br from-[#0c2240] via-[#1a3453] to-[#001f41] text-white">
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Column 1: Logo + slogan + Social Icons (horizontal row) */}
        <div>
          {logo && (
            <Image
              src={`${apiStorageUrl}/${logo}`}
              alt="Logo"
              width={180}
              height={48}
              className="h-12 w-auto"
            />
          )}
          {contactInfo?.slogan && (
            <p className="text-gray-300 text-sm leading-relaxed mt-3 max-w-xs">
              {contactInfo.slogan}
            </p>
          )}

          {resolvedSocials.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Follow Us
              </p>
              <ul className="flex flex-wrap items-center gap-2.5">
                {resolvedSocials.map((link, idx) => {
                  const Icon = link.Icon;
                  return (
                    <li key={link.id ?? idx}>
                      <Link
                        href={link.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.name || link.platform || "Social"}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-green-500 text-white transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                      >
                        <Icon size={16} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-base font-semibold mb-4">Quick Links</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            {(footerMenus || []).map((menu) => (
              <li key={menu.id}>
                <Link
                  href={menu.url}
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-all"
                >
                  {menu.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact Us */}
        <div>
          <h3 className="text-base font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            {contactInfo?.address && (
              <li className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="text-green-400 mt-1 shrink-0" />
                <span className="leading-relaxed">{contactInfo.address}</span>
              </li>
            )}
            {contactInfo?.phone && (
              <li className="flex items-center gap-2.5">
                <FaPhone className="text-green-400 shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="hover:text-white transition-colors">
                  {contactInfo.phone}
                </a>
              </li>
            )}
            {contactInfo?.email && (
              <li className="flex items-center gap-2.5">
                <FaEnvelope className="text-green-400 shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-white transition-colors break-all">
                  {contactInfo.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div
          className="container mx-auto px-6 py-4 text-center text-sm text-gray-300 [&_a]:text-white [&_a]:font-semibold [&_a:hover]:text-green-300 [&_a]:transition-colors"
          dangerouslySetInnerHTML={{ __html: copyrightHtml }}
        />
      </div>
    </footer>
  );
});

export default Footer;
