import { ProductStore } from "@/types";
import { createContext, ReactNode, useContext, useState } from "react";

type storeContextProps = {
  productsStore: ProductStore[];
  addToStore: (product: ProductStore) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (product: ProductStore) => void;
  calculateTotal: () => number;
};

const storeContext = createContext<storeContextProps | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [productsStore, setProductsStore] = useState<ProductStore[]>([]);
  const addToStore = (product: ProductStore) => {
  setProductsStore((prev) => {
    const existing = prev.find(
      (p) =>
        p.productId === product.productId &&
        p.color === product.color &&
        p.size === product.size &&
        p.storeId === product.storeId
    );

    // 👉 ya existe en el carrito
    if (existing) {
      const newQty = Math.min(
        existing.quantity + product.quantity,
        product.stock ?? Infinity // si decides guardar stock
      );

      return prev.map((p) =>
        p.id === existing.id
          ? { ...p, quantity: newQty }
          : p
      );
    }

    // 👉 no existe, se agrega
    return [...prev, product];
  });
};
  const deleteProduct = (id: string) => {
    setProductsStore((prev) => prev.filter((p) => p.id !== id));
  };
  const updateProduct = (product: ProductStore) => {
    setProductsStore((prev) =>
      prev.map((p) => (p.id === product.id ? product : p))
    );
  };
  const calculateTotal = () => {
    return productsStore.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  return (
    <storeContext.Provider
      value={{
        productsStore,
        addToStore,
        deleteProduct,
        updateProduct,
        calculateTotal,
      }}
    >
      {children}
    </storeContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(storeContext);
  if (!context)
    throw new Error("useInside debe usarse dentro de InsideProvider");
  return context;
};
