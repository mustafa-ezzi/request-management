import React, { useContext } from 'react';
import routes from '../../routes/sidebar';
import { NavLink, Route } from 'react-router-dom';
import * as Icons from '../../icons';
import SidebarSubmenu from './SidebarSubmenu';
import logoLight from '../../assets/img/mainLogo.png';
import logoDark from '../../assets/img/mainLogo-dark.png';
import { SidebarContext } from '../../context/SidebarContext';
import { useModal } from '../../context/ModalContext';

function Icon({ icon, ...props }) {
  const Icon = Icons[icon];
  return <Icon {...props} />;
}

function SidebarContent() {
  const { closeSidebar } = useContext(SidebarContext);
  const { clearModalState, modalState } = useModal();

  const featurePaths = [
    '/app/miqaat-menu/',
    '/app/miqaat-attendance/',
    '/app/counter-packing/',
    '/app/distribution/',
    '/app/leftover-degs/',
  ];

  const handleLinkClick = (path) => {
    const isNavigatingToFeaturePage = featurePaths.some(featurePath => path.includes(featurePath));
    const isNavigatingToTables = path.includes('/app/tables');

    if (!isNavigatingToFeaturePage && !isNavigatingToTables) {
      clearModalState();
    }

    closeSidebar();
  };

  return (
    <div className="py-4 text-gray-500 dark:text-gray-400">
      <div className="flex justify-center items-center">
       
      <img 
        src={logoLight} 
        alt="Rice Logo" 
        className="h-auto -ml-12 dark:hidden"  
        style={{ width: "3.5rem" }} 
      /> 

      <img 
        src={logoDark} 
        alt="Rice Logo" 
        className="h-auto -ml-12 hidden dark:block" 
        style={{ width: "3.5rem" }} 
      /> 
      
           </div>
      <ul className="">
        {routes.map((route) =>
          route.routes ? (
            <SidebarSubmenu
              route={route}
              key={route.name}
              onLinkClick={handleLinkClick}
            />
          ) : (
            <li className="relative px-6 py-3" key={route.name}>
              <NavLink
                exact
                to={route.path}
                className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                activeClassName="text-gray-800 dark:text-gray-100"
                onClick={() => handleLinkClick(route.path)}
              >
                <Route path={route.path} exact={route.exact}>
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-purple-600 rounded-tr-lg rounded-br-lg"
                    aria-hidden="true"
                  ></span>
                </Route>
                <Icon className="w-5 h-5" aria-hidden="true" icon={route.icon} />
                <span className="ml-4">{route.name}</span>
              </NavLink>
            </li>
          )
        )}
      </ul>
    </div>
  )
}

export default SidebarContent;