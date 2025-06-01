import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Timetable', to: '/timetable', icon: CalendarIcon },
  { name: 'Profile', to: '/profile', icon: UserIcon },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-sm min-h-screen">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className="mr-3 h-6 w-6 flex-shrink-0"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}