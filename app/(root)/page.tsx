import ProductList from "@/components/ui/shared/product/product-list";
export default function Home() {
  return (
    <div className="space-y-8">
      <h1>Latest Products</h1>
      <ProductList />
    </div>
  );
}
