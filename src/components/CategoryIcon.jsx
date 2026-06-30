import React from 'react';
import { 
  MdOutlineMonetizationOn, 
  MdOutlineLaptopMac,
  MdOutlineRestaurant, 
  MdOutlineDirectionsTransit, 
  MdOutlinePeopleAlt, 
  MdOutlineLocalMall, 
  MdOutlineMedicalServices, 
  MdOutlineSchool, 
  MdOutlineReceiptLong, 
  MdOutlineSportsEsports, 
  MdOutlineHomeWork, 
  MdOutlineAccountBalanceWallet, 
  MdOutlineMiscellaneousServices,
  MdOutlineArrowUpward,
  MdOutlineArrowDownward,
  MdOutlineSwapHoriz
} from 'react-icons/md';

const CategoryIcon = ({ icon, className, size = 20, ...props }) => {
  const iconMap = {
    salary: MdOutlineMonetizationOn,
    freelance: MdOutlineLaptopMac,
    food: MdOutlineRestaurant,
    travel: MdOutlineDirectionsTransit,
    family: MdOutlinePeopleAlt,
    shopping: MdOutlineLocalMall,
    medical: MdOutlineMedicalServices,
    education: MdOutlineSchool,
    bills: MdOutlineReceiptLong,
    entertainment: MdOutlineSportsEsports,
    house: MdOutlineHomeWork,
    savings: MdOutlineAccountBalanceWallet,
    others: MdOutlineMiscellaneousServices,
    
    // Type Icons
    income: MdOutlineArrowUpward,
    expense: MdOutlineArrowDownward,
    transfer: MdOutlineSwapHoriz
  };

  const IconComponent = iconMap[icon?.toLowerCase()] || MdOutlineMiscellaneousServices;
  return <IconComponent className={className} size={size} {...props} />;
};

export default CategoryIcon;
