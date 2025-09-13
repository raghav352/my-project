import React from "react";
import ProductCard from "./ProductCard";

const App = () => {
  const products = [
    { name: "Wireless Mouse", price: 25.99, inStock: true },
    { name: "Keyboard", price: 45.5, inStock: false },
    { name: "Monitor", price: 199.99, inStock: true },
  ];

  return (
    <div style={{
      border: "1px solid black",
      padding: "20px",
      margin: "20px"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Products List
      </h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {products.map((product, index) => (
          <ProductCard
            key={index}
            name={product.name}
            price={product.price}
            inStock={product.inStock}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
