import { createBrowserRouter } from "react-router";
import { Root } from "./layouts/Root";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { FarmerDashboard } from "./pages/FarmerDashboard";
import { BuyerDashboard } from "./pages/BuyerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Products } from "./pages/Products";
import { ProductDetails } from "./pages/ProductDetails";
import { Orders } from "./pages/Orders";
import { Messages } from "./pages/Messages";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "farmer", Component: FarmerDashboard },
      { path: "buyer", Component: BuyerDashboard },
      { path: "admin", Component: AdminDashboard },
      { path: "products", Component: Products },
      { path: "products/:id", Component: ProductDetails },
      { path: "orders", Component: Orders },
      { path: "messages", Component: Messages },
      { path: "*", Component: NotFound },
    ],
  },
]);
