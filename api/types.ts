/** Response shapes of the DummyJSON API (https://dummyjson.com/docs), limited to the fields the tests use. */

export interface AuthSession {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
}

export interface ProductPage<T = Product> {
  products: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface NewProduct {
  title: string;
  price: number;
  category?: string;
}

export interface DeletedProduct extends Product {
  isDeleted: boolean;
  deletedOn: string;
}

export interface CartLine {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Cart {
  id: number;
  userId: number;
  products: CartLine[];
  total: number;
  totalProducts: number;
  totalQuantity: number;
}

export interface CartPage {
  carts: Cart[];
  total: number;
}

export interface ErrorBody {
  message: string;
}
