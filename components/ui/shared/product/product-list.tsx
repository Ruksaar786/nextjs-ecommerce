import React from "react";
import ProductCard from "./product-card";
import { getLatestProduct } from "@/lib/action/product.action";

const ProductList = async () => {
  let data = await getLatestProduct();
  return (
    <>
      <h2 className="h2-bold">Latest products</h2>
      {data.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((product: any) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p>No product found</p>
        </div>
      )}
    </>
  );
};
export default ProductList;
