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

let routes = [];

try {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = localStorage.getItem('role');


  if (role === 'admin') {
    routes = [requestRoute];
  } else if (role === 'super_admin') {
    routes = [usersRoute,requestRoute,ZoneRoute,CityRoute,BatchRoute];
  }
} catch (e) {
  console.warn('Error parsing user from localStorage', e);
}

export default routes;
