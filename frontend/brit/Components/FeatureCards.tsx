"use client";

import React from "react";
import { BookOpen, BookMarked, CreditCard, GraduationCap } from "lucide-react";

const FeatureCards = () => {
  const features = [
    {
      icon: <BookOpen size={40} className="text-[#028a7e]" />,
      title: "Enjoy the best Book",
      desc: "Have a good time reading your favourite book from ReadMore",
      bg: "bg-[#D3F5EC]",
    },
    {
      icon: <BookMarked size={40} className="text-[#2E78BA]" />,
      title: "Best and affordable items",
      desc: "Get your best and affordable items ReadMore",
      bg: "bg-[#F4F6F5]",
    },
    {
      icon: <CreditCard size={40} className="text-[#7A66B5]" />,
      title: "Easy payment",
      desc: "Have a good time reading your favourite book from ReadMore",
      bg: "bg-[#F5E9F7]",
    },
    {
      icon: <GraduationCap size={40} className="text-[#2E6DDC]" />,
      title: "Excellence products",
      desc: "Get your best and affordable items ReadMore",
      bg: "bg-[#E8F0FF]",
    },
  ];

  return (
    <section className="relative -mt-6 md:-mt-10 px-4 md:px-12 lg:px-20 z-20">
      <div className="bg-white rounded-t-[2rem] shadow-sm py-6 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
          {features.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-start gap-3 p-5 rounded-xl ${item.bg}`}
            >
              {item.icon}
              <h3 className="font-bold text-gray-800 text-lg">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-snug">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;