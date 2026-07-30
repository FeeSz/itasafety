import { useContext } from "react";
import { QuoteCartContext } from "@/contexts/quote-cart-context";

export function useQuoteCart() {
  const context = useContext(QuoteCartContext);

  if (!context) {
    throw new Error("useQuoteCart must be used within QuoteCartProvider");
  }

  return context;
}
