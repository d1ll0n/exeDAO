import React, { useState } from 'react';
import AppTopBarContent from 'exedao-ui/dist/AppTopBarContent';
import AppMainLayout from 'exedao-ui/dist/AppMainLayout';

import { MENU_ITEM_REDIRECTS } from './constants';

const Layout = ({ history, children }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const tabNames = ['DASHBOARD', 'PROPOSALS'];

  const handleTabIndices = (e) => {
    if (e.target.value === 0 && activeIndex !== 0) {
      setActiveIndex(0);
      history.push(MENU_ITEM_REDIRECTS[0]);
    } else if (e.target.value === 1 && activeIndex !== 1) {
      setActiveIndex(1);
      history.push(MENU_ITEM_REDIRECTS[1]);
    }
  };

  const topBarContent = (
    <AppTopBarContent
      tabNames={tabNames}
      handleChange={handleTabIndices}
      activeTabIndex={activeIndex}
    />
  );

  return (
    <>
      <AppMainLayout topBarContent={topBarContent}>{children}</AppMainLayout>
    </>
  );
};

export default Layout;
