import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import { Sprout, LogOut, User, Bell, MessageSquare, ShoppingCart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const navigate = useNavigate();
  const dashboardPath =
    user?.role === 'farmer' ? '/farmer' : user?.role === 'buyer' ? '/buyer' : '/admin';

  const navItems = [
    { label: 'Dashboard', to: dashboardPath },
    { label: 'Products', to: '/products' },
    { label: 'Orders', to: '/orders' },
    { label: 'Messages', to: '/messages' },
    ...(user?.role === 'admin' ? [{ label: 'Admin', to: '/admin' }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const myNotifications = notifications
    .filter((notification) => notification.userId === user?.id)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const unreadCount = myNotifications.filter((notification) => !notification.read).length;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to={dashboardPath} className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">AgriDirect</span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-800'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {myNotifications.length === 0 ? (
                  <div className="px-3 py-6 text-sm text-gray-500">No notifications yet.</div>
                ) : (
                  myNotifications.slice(0, 6).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="items-start gap-3 whitespace-normal py-3"
                      onClick={() => {
                        markNotificationRead(notification.id);
                        navigate(notification.type === 'message' ? '/messages' : '/orders');
                      }}
                    >
                      <div className="mt-0.5 rounded-full bg-gray-100 p-2">
                        {notification.type === 'message' ? (
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{notification.title}</p>
                          {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{notification.description}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="md:hidden pb-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {navItems.map((item) => (
              <NavLink
                key={`mobile-${item.to}`}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-800'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
