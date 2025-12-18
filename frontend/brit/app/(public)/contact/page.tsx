"use client";

import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

type SupportMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  phone: string;
  email: string;
};

const supportTeam: SupportMember[] = [
  {
    id: "1",
    name: "DAUDA BEGE",
    role: "Customer Support Lead",
    image: "/images/Bege.jpg",
    phone: "+2348012345678",
    email: "support1@yourapp.com",
  },
  {
    id: "2",
    name: "Michael Lee",
    role: "Technical Support",
    image: "/images/Bege.jpg",
    phone: "+2348098765432",
    email: "support2@yourapp.com",
  },
];

// Animation variants
const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  viewport: { once: true },
});

export default function SupportTeam() {
  return (
    <div className="w-full bg-white text-gray-900">

      {/* ================= HERO SECTION ================= */}
      <section className="w-full h-[50vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-b from-sky-100 to-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Our Support Team
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-700 max-w-2xl"
        >
          Meet our dedicated support professionals ready to assist you. Reach out via WhatsApp or email for any help you need.
        </motion.p>
      </section>

      {/* ================= SUPPORT TEAM ================= */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-10 justify-items-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {supportTeam.map((member, idx) => (
            <motion.div
              key={member.id}
              {...fadeInUp(idx * 0.2)}
              className="bg-white shadow-lg rounded-2xl p-6 text-center w-full max-w-sm hover:shadow-xl transition"
            >
              {/* Profile Image */}
              <div className="mx-auto mb-4">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
              </div>

              {/* Name & Role */}
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-gray-500 mb-4">{member.role}</p>

              {/* Contact Icons */}
              <div className="flex justify-center gap-6">
                <a
                  href={`https://wa.me/${member.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(
                    member.name
                  )},%20I%20need%20support%20from%20the%20team.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 transition"
                  aria-label={`WhatsApp ${member.name}`}
                >
                  <Phone className="w-6 h-6" />
                </a>

                <a
                  href={`mailto:${member.email}?subject=Support%20Request&body=Hello%20${encodeURIComponent(
                    member.name
                  )},%0D%0A%0D%0AI%20need%20assistance%20with...`}
                  className="text-blue-600 hover:text-blue-800 transition"
                  aria-label={`Email ${member.name}`}
                >
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
