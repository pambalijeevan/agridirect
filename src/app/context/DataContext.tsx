import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from './AuthContext';

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  quantity: number;
  price: number;
  location: string;
  image: string;
  images: string[];
  description: string;
  unit: string;
  listedAt: Date;
  isDemo?: boolean;
}

export interface DeliveryDetails {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  productId: string;
  product: Product;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  deliveryDetails: DeliveryDetails;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'order' | 'order-status';
  title: string;
  description: string;
  relatedId: string;
  createdAt: Date;
  read: boolean;
}

interface DataContextType {
  products: Product[];
  orders: Order[];
  messages: Message[];
  notifications: Notification[];
  users: User[];
  addProduct: (product: Omit<Product, 'id' | 'listedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  placeOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void;
  markConversationRead: (currentUserId: string, contactId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markNotificationsReadByType: (userId: string, type: Notification['type']) => void;
  updateUserStatus: (userId: string, active: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = 'agridirect_products';
const ORDERS_STORAGE_KEY = 'agridirect_orders';
const MESSAGES_STORAGE_KEY = 'agridirect_messages';
const NOTIFICATIONS_STORAGE_KEY = 'agridirect_notifications';
const USERS_STORAGE_KEY = 'agridirect_users';
const SESSION_STORAGE_KEY = 'agridirect_user';

const defaultUsers: User[] = [
  { id: '1', name: 'John Farmer', email: 'farmer@agridirect.com', phone: '+91 98765 43210', role: 'farmer', location: 'Punjab', active: true },
  { id: '2', name: 'Sarah Buyer', email: 'buyer@agridirect.com', phone: '+91 91234 56789', companyName: 'Sarah Agro Foods', role: 'buyer', location: 'Delhi', active: true },
  { id: '3', name: 'Admin User', email: 'admin@agridirect.com', phone: '+91 90000 00000', role: 'admin', location: 'Mumbai', active: true },
  { id: '4', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 98111 22334', role: 'farmer', location: 'Maharashtra', active: true },
  { id: '5', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98222 33445', role: 'farmer', location: 'Uttar Pradesh', active: true },
  { id: '6', name: 'Amit Singh', email: 'amit@example.com', phone: '+91 98333 44556', role: 'farmer', location: 'Uttar Pradesh', active: true },
  { id: '7', name: 'Lakshmi Devi', email: 'lakshmi@example.com', phone: '+91 98444 55667', role: 'farmer', location: 'Gujarat', active: true },
  { id: '8', name: 'Ramesh Foods', email: 'ramesh@foodscorp.com', phone: '+91 98555 66778', companyName: 'Ramesh Foods Pvt Ltd', role: 'buyer', location: 'Karnataka', active: true },
  { id: '9', name: 'Ananya Mills', email: 'ananya@mills.com', phone: '+91 98666 77889', companyName: 'Ananya Mills', role: 'buyer', location: 'Tamil Nadu', active: false },
];

const initialProducts: Product[] = [];

const initialOrders: Order[] = [];

const initialMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    senderName: 'Sarah Buyer',
    receiverId: '1',
    receiverName: 'John Farmer',
    message: 'Hi John, I am interested in your wheat. Can we discuss bulk pricing?',
    timestamp: new Date('2026-04-07T10:30:00'),
    isRead: false,
  },
  {
    id: '2',
    senderId: '1',
    senderName: 'John Farmer',
    receiverId: '2',
    receiverName: 'Sarah Buyer',
    message: 'Yes, for larger quantities I can offer a better rate and arrange quick dispatch.',
    timestamp: new Date('2026-04-07T11:15:00'),
    isRead: true,
  },
];

const initialNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'message',
    title: 'New message from Sarah Buyer',
    description: 'Hi John, I am interested in your wheat. Can we discuss bulk pricing?',
    relatedId: '1',
    createdAt: new Date('2026-04-07T10:30:00'),
    read: false,
  },
];

function loadStoredState<T>(key: string, fallback: T, reviver?: (value: T) => T): T {
  const stored = localStorage.getItem(key);
  if (!stored) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(stored) as T;
    return reviver ? reviver(parsed) : parsed;
  } catch {
    return fallback;
  }
}

function hydrateProducts(values: Product[]): Product[] {
  return values.map((product) => ({
    ...product,
    image: product.image || product.images?.[0] || '',
    images:
      product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [],
    listedAt: new Date(product.listedAt),
  }));
}

function hydrateOrders(values: Order[]): Order[] {
  return values.map((order) => ({
    ...order,
    createdAt: new Date(order.createdAt),
    product: {
      ...order.product,
      image: order.product.image || order.product.images?.[0] || '',
      images:
        order.product.images && order.product.images.length > 0
          ? order.product.images
          : order.product.image
            ? [order.product.image]
            : [],
      listedAt: new Date(order.product.listedAt),
    },
  }));
}

function hydrateMessages(values: Message[]): Message[] {
  return values.map((message) => ({
    ...message,
    timestamp: new Date(message.timestamp),
    isRead: Boolean(message.isRead),
  }));
}

function hydrateNotifications(values: Notification[]): Notification[] {
  return values.map((notification) => ({
    ...notification,
    createdAt: new Date(notification.createdAt),
  }));
}

function loadUsers(): User[] {
  const storedUsers = loadStoredState<User[]>(USERS_STORAGE_KEY, defaultUsers);
  return storedUsers.map((user) => {
    const matchingDefault = defaultUsers.find((entry) => entry.id === user.id);
    return matchingDefault ? { ...matchingDefault, ...user } : user;
  });
}

function nextId(values: Array<{ id: string }>) {
  return String(values.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1);
}

function getUserDisplayName(user?: User) {
  return user?.name ?? '';
}

function syncProductWithUsers(product: Product, users: User[]): Product {
  const farmer = users.find((entry) => entry.id === product.farmerId);
  const images = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];
  const syncedProduct = {
    ...product,
    image: images[0] || '',
    images,
  };
  return farmer ? { ...syncedProduct, farmerName: getUserDisplayName(farmer) } : syncedProduct;
}

function syncOrderWithUsers(order: Order, users: User[]): Order {
  const buyer = users.find((entry) => entry.id === order.buyerId);
  return {
    ...order,
    buyerName: buyer ? getUserDisplayName(buyer) : order.buyerName,
    product: syncProductWithUsers(order.product, users),
  };
}

function syncMessageWithUsers(message: Message, users: User[]): Message {
  const sender = users.find((entry) => entry.id === message.senderId);
  const receiver = users.find((entry) => entry.id === message.receiverId);
  return {
    ...message,
    senderName: sender ? getUserDisplayName(sender) : message.senderName,
    receiverName: receiver ? getUserDisplayName(receiver) : message.receiverName,
  };
}

function createNotification(
  notification: Omit<Notification, 'id' | 'createdAt' | 'read'>,
  existing: Notification[]
): Notification {
  return {
    ...notification,
    id: nextId(existing),
    createdAt: new Date(),
    read: false,
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    loadStoredState<Product[]>(PRODUCTS_STORAGE_KEY, initialProducts, hydrateProducts)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadStoredState<Order[]>(ORDERS_STORAGE_KEY, initialOrders, hydrateOrders)
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    loadStoredState<Message[]>(MESSAGES_STORAGE_KEY, initialMessages, hydrateMessages)
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadStoredState<Notification[]>(NOTIFICATIONS_STORAGE_KEY, initialNotifications, hydrateNotifications)
  );
  const [users, setUsers] = useState<User[]>(() => loadUsers());

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    setProducts((current) => current.map((product) => syncProductWithUsers(product, users)));
    setOrders((current) => current.map((order) => syncOrderWithUsers(order, users)));
    setMessages((current) => current.map((message) => syncMessageWithUsers(message, users)));
  }, [users]);

  useEffect(() => {
    setProducts((current) => {
      const withoutDemoProducts = current.filter((product) => !product.isDemo);
      return withoutDemoProducts.map((product) => syncProductWithUsers(product, users));
    });
    setOrders((current) => current.filter((order) => !order.product.isDemo));
  }, []);

  useEffect(() => {
    const syncUsers = () => {
      setUsers(loadUsers());
    };

    const syncSessionUser = () => {
      const storedUser = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedUser) {
        return;
      }

      try {
        const sessionUser = JSON.parse(storedUser) as User;
        const freshUser = loadUsers().find((entry) => entry.id === sessionUser.id);
        if (freshUser) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(freshUser));
        }
      } catch {
        // Ignore invalid session payloads and let AuthContext recover.
      }
    };

    const handleUsersChanged = () => {
      syncUsers();
      syncSessionUser();
    };

    window.addEventListener('storage', handleUsersChanged);
    window.addEventListener('agridirect-users-changed', handleUsersChanged);
    return () => {
      window.removeEventListener('storage', handleUsersChanged);
      window.removeEventListener('agridirect-users-changed', handleUsersChanged);
    };
  }, []);

  const addProduct = (product: Omit<Product, 'id' | 'listedAt'>) => {
    const images = product.images.length > 0 ? product.images : product.image ? [product.image] : [];
    setProducts((current) => [
      {
        ...product,
        image: images[0] || '',
        images,
        id: nextId(current),
        listedAt: new Date(),
      },
      ...current,
    ]);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    const normalizedUpdate = {
      ...updatedProduct,
      images:
        updatedProduct.images && updatedProduct.images.length > 0
          ? updatedProduct.images
          : updatedProduct.image
            ? [updatedProduct.image]
            : updatedProduct.images,
      image:
        updatedProduct.images && updatedProduct.images.length > 0
          ? updatedProduct.images[0]
          : updatedProduct.image,
    };

    setProducts((current) =>
      current.map((product) => {
        if (product.id !== id) {
          return product;
        }

        const mergedImages =
          normalizedUpdate.images && normalizedUpdate.images.length > 0
            ? normalizedUpdate.images
            : product.images && product.images.length > 0
              ? product.images
              : product.image
                ? [product.image]
                : [];

        return {
          ...product,
          ...normalizedUpdate,
          images: mergedImages,
          image: mergedImages[0] || '',
        };
      })
    );
    setOrders((current) =>
      current.map((order) =>
        order.productId === id
          ? {
              ...order,
              product: {
                ...order.product,
                ...normalizedUpdate,
                images:
                  normalizedUpdate.images && normalizedUpdate.images.length > 0
                    ? normalizedUpdate.images
                    : order.product.images && order.product.images.length > 0
                      ? order.product.images
                      : order.product.image
                        ? [order.product.image]
                        : [],
                image:
                  normalizedUpdate.images && normalizedUpdate.images.length > 0
                    ? normalizedUpdate.images[0]
                    : normalizedUpdate.image ?? order.product.image,
              },
              totalPrice: order.quantity * (updatedProduct.price ?? order.product.price),
            }
          : order
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((current) => current.filter((product) => product.id !== id));
  };

  const placeOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    let createdOrder: Order | null = null;

    setOrders((current) => {
      createdOrder = {
        ...order,
        id: nextId(current),
        createdAt: new Date(),
      };
      return [createdOrder, ...current];
    });

    if (!createdOrder) {
      return;
    }

    setNotifications((current) => [
      createNotification(
        {
          userId: createdOrder.product.farmerId,
          type: 'order',
          title: 'New order received',
          description: `${createdOrder.buyerName} requested ${createdOrder.quantity} ${createdOrder.product.unit} of ${createdOrder.product.cropName}.`,
          relatedId: createdOrder.id,
        },
        current
      ),
      ...current,
    ]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    let changedOrder: Order | undefined;
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) {
          return order;
        }
        changedOrder = { ...order, status };
        return changedOrder;
      })
    );

    if (!changedOrder) {
      return;
    }

    setNotifications((current) => [
      createNotification(
        {
          userId: changedOrder.buyerId,
          type: 'order-status',
          title: `Order ${status}`,
          description: `${changedOrder.product.farmerName} ${status} your order for ${changedOrder.product.cropName}.`,
          relatedId: changedOrder.id,
        },
        current
      ),
      ...current,
    ]);
  };

  const sendMessage = (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    let createdMessage: Message | null = null;

    setMessages((current) => {
      createdMessage = {
        ...message,
        id: nextId(current),
        timestamp: new Date(),
        isRead: false,
      };
      return [...current, createdMessage];
    });

    if (!createdMessage) {
      return;
    }

    setNotifications((current) => [
      createNotification(
        {
          userId: createdMessage.receiverId,
          type: 'message',
          title: `New message from ${createdMessage.senderName}`,
          description: createdMessage.message,
          relatedId: createdMessage.id,
        },
        current
      ),
      ...current,
    ]);
  };

  const markConversationRead = (currentUserId: string, contactId: string) => {
    const relatedMessageIds = messages
      .filter(
        (message) =>
          message.senderId === contactId &&
          message.receiverId === currentUserId &&
          !message.isRead
      )
      .map((message) => message.id);

    setMessages((current) =>
      current.map((message) =>
        message.senderId === contactId && message.receiverId === currentUserId
          ? { ...message, isRead: true }
          : message
      )
    );

    setNotifications((current) =>
      current.map((notification) =>
        notification.userId === currentUserId &&
        notification.type === 'message' &&
        relatedMessageIds.includes(notification.relatedId)
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
  };

  const markNotificationsReadByType = (userId: string, type: Notification['type']) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.userId === userId && notification.type === type ? { ...notification, read: true } : notification
      )
    );
  };

  const updateUserStatus = (userId: string, active: boolean) => {
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, active } : user)));
  };

  const value = useMemo(
    () => ({
      products,
      orders,
      messages,
      notifications,
      users,
      addProduct,
      updateProduct,
      deleteProduct,
      placeOrder,
      updateOrderStatus,
      sendMessage,
      markConversationRead,
      markNotificationRead,
      markNotificationsReadByType,
      updateUserStatus,
    }),
    [products, orders, messages, notifications, users]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
