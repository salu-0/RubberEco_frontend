import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StaffRecruitment from '../components/Recruitment/StaffRecruitment';
import Navbar from '../components/Navbar';
import { ArrowLeft, Home } from 'lucide-react';

const Careers = ({ darkMode = false }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Navbar transparent={false} />
      <StaffRecruitment darkMode={darkMode} />
    </div>
  );
};

export default Careers;
