export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

// Mocked products until real Shopify API is integrated
export const artworks: Product[] = Array.from({ length: 20 }).map((_, i) => ({
  id: `artwork-${i + 1}`,
  title: [
    "Ethereal Silence", "Urban Geometry", "Fluid Dynamics", "Neon Genesis",
    "Brutalist Structure", "Organic Form", "Digital Abstraction", "Monochrome IV",
    "Ceramic Object", "Chrome Figure", "Void Study", "Prismatic Light",
    "Terra Cotta", "Glass Vessel", "Kinetic Mobile", "Marble Fragment",
    "Synthesized Landscape", "Glitch Pattern", "Bronze Cast", "Steel Frame"
  ][i],
  description: "A profound statement piece exploring form, texture, and materiality. This artwork commands attention while maintaining an understated elegance.",
  price: Math.floor(Math.random() * 5000) + 500,
  imageUrl: [
    "/ethereal-silence.png",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1580136608260-4eb11f4b24fe?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800"
  ][i % 5],
}));

export async function getProducts(): Promise<Product[]> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(artworks), 500);
  });
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(artworks.find(a => a.id === id)), 500);
  });
}
