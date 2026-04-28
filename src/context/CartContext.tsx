"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN!;
const API_VERSION = "2024-10";
const ENDPOINT = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;
const CART_STORAGE_KEY = "shopifyCartId";

export interface CartLine {
  id: string;
  variantId: string;
  name: string;
  variantTitle: string;
  price: number;
  currencyCode: string;
  quantity: number;
  image: string;
  options: { name: string; value: string }[];
}

interface CartState {
  id: string | null;
  lines: CartLine[];
  checkoutUrl: string | null;
  totalAmount: number;
  currencyCode: string;
}

interface CartContextType {
  cart: CartState;
  cartCount: number;
  isLoading: boolean;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
  updateQty: (lineId: string, quantity: number) => Promise<void>;
}

const EMPTY_CART: CartState = {
  id: null,
  lines: [],
  checkoutUrl: null,
  totalAmount: 0,
  currencyCode: "EUR",
};

const CartContext = createContext<CartContextType | undefined>(undefined);

async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

const CART_FRAGMENT = `
  id
  checkoutUrl
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            product {
              title
              featuredImage { url }
            }
            selectedOptions { name value }
          }
        }
      }
    }
  }
  cost {
    totalAmount { amount currencyCode }
  }
`;

function normalizeCart(raw: Record<string, any>): CartState {
  if (!raw) return EMPTY_CART;
  return {
    id: raw.id as string,
    checkoutUrl: raw.checkoutUrl as string,
    totalAmount: parseFloat(raw.cost?.totalAmount?.amount ?? "0"),
    currencyCode: (raw.cost?.totalAmount?.currencyCode as string) ?? "EUR",
    lines: ((raw.lines?.edges ?? []) as { node: Record<string, any> }[]).map(
      ({ node }) => {
        const m = node.merchandise as Record<string, any>;
        return {
          id: node.id as string,
          variantId: m.id as string,
          name: m.product.title as string,
          variantTitle:
            m.title === "Default Title" ? "" : (m.title as string),
          price: parseFloat(m.price.amount as string),
          currencyCode: m.price.currencyCode as string,
          quantity: node.quantity as number,
          image: (m.product.featuredImage?.url as string) ?? "",
          options: (m.selectedOptions ?? []) as {
            name: string;
            value: string;
          }[],
        };
      }
    ),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedId) return;
    storefrontFetch<{ cart: Record<string, any> | null }>(
      `query GetCart($id: ID!) { cart(id: $id) { ${CART_FRAGMENT} } }`,
      { id: savedId }
    )
      .then(({ cart: raw }) => {
        if (raw) {
          setCart(normalizeCart(raw));
        } else {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      })
      .catch(() => localStorage.removeItem(CART_STORAGE_KEY));
  }, []);

  const addToCart = useCallback(
    async (variantId: string, quantity: number) => {
      setIsLoading(true);
      try {
        const existingId = cart.id ?? localStorage.getItem(CART_STORAGE_KEY);
        if (existingId) {
          const data = await storefrontFetch<{
            cartLinesAdd: { cart: Record<string, any> };
          }>(
            `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
              cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart { ${CART_FRAGMENT} }
                userErrors { field message }
              }
            }`,
            { cartId: existingId, lines: [{ merchandiseId: variantId, quantity }] }
          );
          setCart(normalizeCart(data.cartLinesAdd.cart));
        } else {
          const data = await storefrontFetch<{
            cartCreate: { cart: Record<string, any> };
          }>(
            `mutation CartCreate($lines: [CartLineInput!]) {
              cartCreate(input: { lines: $lines }) {
                cart { ${CART_FRAGMENT} }
                userErrors { field message }
              }
            }`,
            { lines: [{ merchandiseId: variantId, quantity }] }
          );
          const newCart = normalizeCart(data.cartCreate.cart);
          if (newCart.id) localStorage.setItem(CART_STORAGE_KEY, newCart.id);
          setCart(newCart);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cart.id]
  );

  const removeFromCart = useCallback(
    async (lineId: string) => {
      if (!cart.id) return;
      setIsLoading(true);
      try {
        const data = await storefrontFetch<{
          cartLinesRemove: { cart: Record<string, any> };
        }>(
          `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
              cart { ${CART_FRAGMENT} }
              userErrors { field message }
            }
          }`,
          { cartId: cart.id, lineIds: [lineId] }
        );
        setCart(normalizeCart(data.cartLinesRemove.cart));
      } finally {
        setIsLoading(false);
      }
    },
    [cart.id]
  );

  const updateQty = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart.id) return;
      if (quantity <= 0) {
        await removeFromCart(lineId);
        return;
      }
      setIsLoading(true);
      try {
        const data = await storefrontFetch<{
          cartLinesUpdate: { cart: Record<string, any> };
        }>(
          `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
            cartLinesUpdate(cartId: $cartId, lines: $lines) {
              cart { ${CART_FRAGMENT} }
              userErrors { field message }
            }
          }`,
          { cartId: cart.id, lines: [{ id: lineId, quantity }] }
        );
        setCart(normalizeCart(data.cartLinesUpdate.cart));
      } finally {
        setIsLoading(false);
      }
    },
    [cart.id, removeFromCart]
  );

  const cartCount = cart.lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, isLoading, addToCart, removeFromCart, updateQty }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
