'use client';

import React, { useContext, useEffect, useState } from "react";
import { 
  FaFacebook, 
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaGithub,
  FaTelegram,
  FaGlobe,
  FaLinkedin,
  FaPinterest, 
  FaTwitter, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope,
  FaThreads,
  FaSoundcloud,
  FaSnapchat,
  FaTiktok,
  FaReddit,
  FaTumblr,
  FaVimeo,
  FaFlickr,
  FaBehance,
  FaDribbble,
  FaDiscord,
  FaSlack,
  FaSpotify,
  FaMedium,
  FaQuora,
  FaWeibo,
  FaWeChat,
  FaQQ,
  FaXing,
  FaMastodon,
  FaClubhouse,
  FaEllo,
  FaBlogger,
  FaTypeform,
  FaSurveyMonkey,
  FaMailchimp,
  FaKickstarter,
  FaPatreon,
  FaSubstack,

} from "react-icons/fa";
import * as FaIcons from "react-icons/fa";

import Image from 'next/image';
import Link from 'next/link';
import { config } from "@/config/config";
import { HeaderContext } from "../context/HeaderContext";



const Footer = () => {

  // Footer Logo, Menu, Social Links, Contact Info
  const { logo, contactInfo, socialLinks, footerMenus, apiStorageUrl } = useContext(HeaderContext);

  const apiUrl = config.apiUrl;

  

  return (
    <footer className="bg-gradient-to-r from-[#1a3453] to-[#001f41] text-white py-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: Logo, Text & Social Icons */}
        <div>
          {logo && (
            <Image src={`${apiStorageUrl}/${logo}`} alt="Logo" width={192} height={48} className="w-48" unoptimized />
          )}
          <p className="text-gray-400 mt-2">
          {contactInfo.slogan}
          </p>
          {socialLinks.map((link, index) => {
            const IconComponent = FaIcons[link.icon_class]; // ডাইনামিক কম্পোনেন্ট রেজোল্ভ করা হচ্ছে
            return (
              <div key={index} className="flex space-x-3 mt-4">
                <Link href={link.url} target="_blank" rel="noopener noreferrer" className="bg-green-500 p-2 rounded-full text-white hover:bg-green-600">
                  {IconComponent && <IconComponent size={20} />}
                </Link>
              </div>
            );
          })}


         
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          {footerMenus.map((menu, index) => (
            <ul key={index} className="text-gray-400 space-y-2">
              <li><Link href={menu.url} className="hover:text-white">{menu.name}</Link></li>
            </ul>
          ))}
        </div>

        {/* Column 3: Contact Us */}


        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <p className="flex items-center text-gray-400">
            <FaMapMarkerAlt className="text-green-500 mr-2" /> 
            {contactInfo.address}
          </p>
          <p className="flex items-center text-gray-400 mt-2">
            <FaPhone className="text-green-500 mr-2" /> 
            {contactInfo.phone}
          </p>
          <p className="flex items-center text-gray-400 mt-2">
            <FaEnvelope className="text-green-500 mr-2" /> 
            {contactInfo.email}
          </p>
        </div>

      </div>

      {/* Copyright Section */}
      <div className="border-t border-gray-600 mt-6 pt-4 text-center text-gray-300">
        © All Copyrights Reserved by <span className="font-semibold text-white"><a href="http://danialdigitalacademy.com">Danial Islam</a></span>
      </div>

    </footer>
  );
};

export default Footer;
