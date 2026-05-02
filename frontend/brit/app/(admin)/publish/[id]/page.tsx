"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { REST_API } from "../../../constant";
import { useAuth } from "@/app/context/AuthContext";

const categories = ["Educational", "Fiction", "Non-Fiction", "Professional & Technical", "Faith Based", "Lifestyle", "Journal & Notes"];

export default function PublishPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    author: "",
    category: "Educational",
    price: "",
    summary: "",
    // Additional Metadata
    pages: "",
    language: "English",
    publisher: "",
    publishedYear: "",
    dimensions: ""
  });

  useEffect(() => {
    const fetchBookData = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${REST_API}/publish-books/admin/books/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            author: data.author || "",
            category: data.category || "Educational",
            price: data.price || "",
            summary: data.summary || "",
            pages: data.pages || "",
            language: data.language || "English",
            publisher: data.publisher || "",
            publishedYear: data.publishedYear || "",
            dimensions: data.dimensions || ""
          });
        }
      } catch (error) { console.error(error); }
    };
    fetchBookData();
  }, [id, token]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${REST_API}/publish-books/admin/books/${id}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          pages: Number(formData.pages),
          publishedYear: Number(formData.publishedYear)
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to publish.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-[#035b77]">Publishing Portal</h1>
      <p className="text-gray-500 mb-8">Confirm storefront details to go live.</p>

      <form onSubmit={handlePublish} className="space-y-6 bg-white p-8 rounded-2xl border shadow-sm">
        {/* Core Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Display Author</label>
            <input required className="w-full p-3 border rounded-xl" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Price (USD)</label>
            <input required type="number" className="w-full p-3 border rounded-xl" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          </div>
        </div>

        {/* Technical Metadata (Based on second image) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t pt-6">
          <div>
            <label className="block text-sm font-bold mb-2">Pages</label>
            <input type="number" placeholder="e.g. 320" className="w-full p-3 border rounded-xl" value={formData.pages} onChange={(e) => setFormData({ ...formData, pages: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Language</label>
            <input placeholder="e.g. English" className="w-full p-3 border rounded-xl" value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Published Year</label>
            <input type="number" placeholder="e.g. 2023" className="w-full p-3 border rounded-xl" value={formData.publishedYear} onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-2">Publisher</label>
            <input placeholder="e.g. Global Press" className="w-full p-3 border rounded-xl" value={formData.publisher} onChange={(e) => setFormData({ ...formData, publisher: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Dimensions</label>
            <input placeholder="e.g. 6 x 9 in" className="w-full p-3 border rounded-xl" value={formData.dimensions} onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Category</label>
          <select className="w-full p-3 border rounded-xl bg-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Storefront Summary</label>
          <textarea required rows={4} className="w-full p-3 border rounded-xl" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#035b77] text-white py-4 rounded-xl font-bold shadow-lg">
          {loading ? "Publishing..." : "Confirm & Go Live "}
        </button>
      </form>
    </div>
  );
}

/*"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { REST_API } from "../../../constant";
import { useAuth } from "@/app/context/AuthContext";

const categories = ["Educational", "Fiction", "Non-Fiction", "Professional & Technical", "Faith Based", "Lifestyle", "Journal & Notes"];

export default function PublishPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    author: "",
    category: "Educational",
    price: "",
    summary: "",
  });

  useEffect(() => {
    const fetchBookData = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${REST_API}/publish-books/admin/books/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            author: data.author || "",
            category: data.category || "Educational",
            price: data.price || "",
            summary: data.summary || "", 
          });
        }
      } catch (error) { console.error(error); }
    };
    fetchBookData();
  }, [id, token]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${REST_API}/publish-books/admin/books/${id}/publish`, {
        method: "PATCH",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
        }),
      });

      if (res.ok) {
        // RETURNS TO DASHBOARD
        router.push("/dashboard"); 
      } else {
        alert("Failed to publish.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-[#035b77]">Publishing Portal</h1>
      <p className="text-gray-500 mb-8">Confirm storefront details to go live.</p>

      <form onSubmit={handlePublish} className="space-y-6 bg-white p-8 rounded-2xl border shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Display Author</label>
            <input required className="w-full p-3 border rounded-xl" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Price (USD)</label>
            <input required type="number" className="w-full p-3 border rounded-xl" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Category</label>
          <select className="w-full p-3 border rounded-xl bg-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Storefront Summary </label>
          <textarea required rows={4} className="w-full p-3 border rounded-xl" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[#035b77] text-white py-4 rounded-xl font-bold shadow-lg">
          {loading ? "Publishing..." : "Confirm & Go Live "}
        </button>
      </form>
    </div>
  );
}
  */