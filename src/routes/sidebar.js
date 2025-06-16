const requestRoute = {
  path: '/app/request',
  icon: 'HandShake',
  name: 'Request',
};

const ZoneRoute = {
  path: '/app/zones',
  icon: 'ZoneLocation',
  name: 'Zone',
};

const CityRoute = {
  path: '/app/city',
  icon: 'CardsIcon',
  name: 'City',
};

const BatchRoute = {
  path: '/app/batch',
  icon: 'User',
  name: 'Batch',
};

const usersRoute = {
  path: '/app/users',
  icon: 'User',
  name: 'Users',
};

// Export a function that returns routes based on current role
const getRoutes = () => {
  let routes = [];

  try {
    const role = localStorage.getItem('role');

    if (role === 'admin') {
      routes = [requestRoute];
    } else if (role === 'super_admin') {
      routes = [usersRoute, requestRoute, ZoneRoute, CityRoute, BatchRoute];
    }
  } catch (e) {
    console.warn('Error getting role from localStorage', e);
  }

  return routes;
};

export default getRoutes;