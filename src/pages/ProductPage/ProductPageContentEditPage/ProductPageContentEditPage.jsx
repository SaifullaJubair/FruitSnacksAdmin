import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { BASE_URL } from "../../../utils/baseURL";
import ProductPageContentForm from "../../../components/ProductPageContent/ProductPageContentForm";
import { LoaderOverlay } from "../../../components/common/loader/LoderOverley";

const ProductPageContentEditPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/product/dashboard/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setProduct(data?.data || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoaderOverlay />;
  if (!product?._id) {
    return (
      <div className="p-4 text-center text-gray-500">Product not found.</div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Page Content: {product.product_name}
          </h1>
          <p className="text-sm text-gray-500">
            Theme, hero, benefits, FAQ, nutrition, OG meta এবং variation weight এখান থেকে edit করো।
          </p>
        </div>
        <Link
          to="/product/product-list"
          className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          <FaArrowLeft /> Back to list
        </Link>
      </div>

      <ProductPageContentForm product={product} refetch={load} />
    </div>
  );
};

export default ProductPageContentEditPage;
