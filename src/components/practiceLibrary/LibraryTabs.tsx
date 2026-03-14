/**
 * Library Tabs Component
 *
 * Tab navigation for Services, Products, Packages, Concerns
 */

import type { ReactElement } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import InventoryIcon from '@mui/icons-material/Inventory';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import type { LibraryTab } from 'stores/practiceLibraryStore/types';

const TABS: { value: LibraryTab; label: string; icon: ReactElement }[] = [
  { value: 'services', label: 'Services', icon: <MedicalServicesIcon /> },
  { value: 'products', label: 'Products', icon: <InventoryIcon /> },
  { value: 'packages', label: 'Packages', icon: <CardGiftcardIcon /> },
  { value: 'concerns', label: 'Concerns', icon: <PsychologyIcon /> },
];

export function LibraryTabs() {
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);
  const services = usePracticeLibraryStore(practiceLibrarySelectors.selectServices);
  const products = usePracticeLibraryStore(practiceLibrarySelectors.selectProducts);
  const packages = usePracticeLibraryStore(practiceLibrarySelectors.selectPackages);
  const concerns = usePracticeLibraryStore(practiceLibrarySelectors.selectConcerns);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const getCounts = (tab: LibraryTab): number => {
    switch (tab) {
      case 'services':
        return services.total ?? services.items.length;
      case 'products':
        return products.total ?? products.items.length;
      case 'packages':
        return packages.total ?? packages.items.length;
      case 'concerns':
        return concerns.total ?? concerns.items.length;
      default:
        return 0;
    }
  };

  const handleChange = (_: React.SyntheticEvent, value: LibraryTab) => {
    actions.setActiveTab(value);
  };

  return (
    <Tabs
      value={activeTab}
      onChange={handleChange}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        '& .MuiTab-root': {
          minHeight: 56,
          textTransform: 'none',
        },
      }}
    >
      {TABS.map((tab) => {
        const count = getCounts(tab.value);
        return (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              <Badge
                badgeContent={count > 0 ? count : undefined}
                color="primary"
                sx={{ '& .MuiBadge-badge': { right: -12 } }}
              >
                {tab.label}
              </Badge>
            }
            icon={tab.icon}
            iconPosition="start"
          />
        );
      })}
    </Tabs>
  );
}
