import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCartPlus, FaCubes, FaFilter } from "react-icons/fa";
import api from "../services/api";
import { useCart } from "../contexts/CartContext";
import AOS from "aos";
import "aos/dist/aos.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [sort, setSort] = useState("A-Z");
  const [category, setCategory] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { updateCartCount } = useCart();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    AOS.init({ duration: 300 });
    fetchProducts();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiUrl}/uploads/${url.replace("/uploads/", "")}`;
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.products);
      setFiltered(res.data.products);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔎 Bộ lọc LEGO
  useEffect(() => {
    let filteredData = [...products];

    if (category !== "Tất cả") {
      filteredData = filteredData.filter((p) => p.category === category);
    }

    if (priceRange !== "Tất cả") {
      if (priceRange === "<500k") filteredData = filteredData.filter((p) => p.price < 500000);
      else if (priceRange === "500k-1tr") filteredData = filteredData.filter((p) => p.price >= 500000 && p.price <= 1000000);
      else if (priceRange === ">1tr") filteredData = filteredData.filter((p) => p.price > 1000000);
    }

    if (sort === "A-Z") filteredData.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "Z-A") filteredData.sort((a, b) => b.name.localeCompare(a.name));

    setFiltered(filteredData);
  }, [sort, category, priceRange, products]);

  const handleClick = (product) => navigate(`/product/${product._id}`, { state: product });

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await api.post("/cart/add", { productId: product._id, quantity: 1 });
      updateCartCount();
      alert("🧱 Đã thêm sản phẩm vào giỏ!");
    } catch {
      alert("Không thể thêm sản phẩm!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-yellow-600 text-xl">
        Đang tải LEGO...
      </div>
    );

  return (
    <div className="bg-[#fff6da] min-h-screen px-6 py-10 font-sans">
      <h1
        className="text-4xl font-extrabold text-center text-[#e11d48] mb-10"
        data-aos="fade-down"
      >
        🧱 BỘ SƯU TẬP LEGO STORE
      </h1>

      {/* Bộ lọc LEGO */}
      <div
        className="bg-yellow-200 shadow-md rounded-xl p-4 flex flex-wrap justify-center gap-4 mb-10"
        data-aos="fade-up"
      >
        <div className="flex items-center gap-2">
          <FaFilter className="text-[#e11d48]" />
          <span className="font-bold text-[#6b3f24]">Sắp xếp:</span>
          <select
            className="p-2 rounded-lg border border-yellow-400"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option>A-Z</option>
            <option>Z-A</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <FaCubes className="text-[#e11d48]" />
          <span className="font-bold text-[#6b3f24]">Danh mục:</span>
          <select
            className="p-2 rounded-lg border border-yellow-400"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Tất cả</option>
            <option>Lego Architecture</option>
            <option>Lego City</option>
            <option>Lego Friends</option>
            <option>Lego Technic</option>
            <option>Lego Ninjago</option>
            <option>Lego DC Super Heroes</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-[#6b3f24]">Giá:</span>
          <select
            className="p-2 rounded-lg border border-yellow-400"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option>Tất cả</option>
            <option>&lt;500k</option>
            <option>500k-1tr</option>
            <option>&gt;1tr</option>
          </select>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filtered.map((product, i) => (
          <div
            key={product._id}
            onClick={() => handleClick(product)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-[0_6px_0_#e11d48] hover:-translate-y-2 transition-all p-4 cursor-pointer border-2 border-yellow-400"
            data-aos="zoom-in"
            data-aos-delay={i * 50}
          >
            <img
              src={getImageUrl(product.imageUrl?.[0])}
              alt={product.name}
              className="w-full h-56 object-contain bg-yellow-100 rounded-xl mb-4"
              onError={(e) => (e.target.src = "/no-image.png")}
            />
            <h2 className="text-lg font-bold text-[#6b3f24] mb-2 truncate">
              {product.name}
            </h2>
            <p className="text-[#e11d48] font-bold mb-3">
              {product.price.toLocaleString()}đ
            </p>
            <button
              onClick={(e) => handleAddToCart(e, product)}
              className="w-full py-2 rounded-lg bg-[#e11d48] text-white font-bold hover:bg-[#c00] transition"
            >
              <FaCartPlus className="inline mr-2" /> Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product;

