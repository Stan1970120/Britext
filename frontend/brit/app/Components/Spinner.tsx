"use client";

import React from "react";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div
        className="
          w-16 h-16
          rounded-full
          animate-spin
          border-4
          border-gray-200
          border-t-sky-400
          border-r-gray-300
          border-b-white
          border-l-gray-300
          shadow-md
        "
        style={{
          borderTopColor: "rgba(14, 165, 233, 0.8)", // sky
          borderRightColor: "rgba(156, 163, 175, 0.8)", // gray
          borderBottomColor: "rgba(255, 255, 255, 0.8)", // white
          borderLeftColor: "rgba(156, 163, 175, 0.8)", // gray
        }}
      ></div>
    </div>
  );
};

export default Spinner;
