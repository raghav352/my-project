import React from "react";

const ProductCard = ({ name, price, inStock }) => {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "16px",
      width: "200px",
      textAlign: "center",
      backgroundColor: "#fff",
      color:"black",
      margin: "10px"
    }}>
      <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>{name}</h3>
      <p>Price: ${price}</p>
      <p>Status: {inStock ? "In Stock" : "Out of Stock"}</p>
    </div>
  );
};

export default ProductCard;
