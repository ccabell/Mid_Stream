/**
 * Library Tabs Component
 *
 * Tab navigation for Services, Products, Packages, Concerns, Configuration
 */

import type { ReactElement } from 'react';
import { useMemo } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import InventoryIcon from '@mui/icons-material/Inventory';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SettingsIcon from '@mui/icons-material/Settings';
import { usePracticeLibraryStore, practiceLibrarySelectors } from 'stores/practiceLibraryStore';
import type { LibraryTab } from 'stores/practiceLibraryStore/types';

interface TabDefinition {
  value: LibraryTab;
  label: string;
  icon: ReactElement;
  practiceOnly?: boolean;
}

const ALL_TABS: TabDefinition[] = [
  { value: 'services', label: 'Services', icon: <MedicalServicesIcon /> },
  { value: 'products', label: 'Products', icon: <InventoryIcon /> },
  { value: 'packages', label: 'Packages', icon: <CardGiftcardIcon /> },
  { value: 'concerns', label: 'Concerns', icon: <PsychologyIcon /> },
  { value: 'configuration', label: 'Configuration', icon: <SettingsIcon />, practiceOnly: true },
];

export function LibraryTabs() {
  const activeTab = usePracticeLibraryStore(practiceLibrarySelectors.selectActiveTab);
  const isGlobalMode = usePracticeLibraryStore(practiceLibrarySelectors.selectIsGlobalLibraryMode);
  const services = usePracticeLibraryStore(practiceLibrarySelectors.selectServices);
  const products = usePracticeLibraryStore(practiceLibrarySelectors.selectProducts);
  const packages = usePracticeLibraryStore(practiceLibrarySelectors.selectPackages);
  const concerns = usePracticeLibraryStore(practiceLibrarySelectors.selectConcerns);
  const actions = usePracticeLibraryStore(practiceLibrarySelectors.selectActions);

  const visibleTabs = useMemo(() => {
    return ALL_TABS.filter((tab) => {
      if (tab.practiceOnly && isGlobalMode) return false;
      return true;
    });
  }, [isGlobalMode]);

  const getCounts = (tab: LibraryTab): number | null => {
    switch (tab) {
      case 'services':
        return services.total ?? services.items.length;
      case 'products':
        return products.total ?? products.items.length;
      case 'packages':
        return packages.total ?? packages.items.length;
      case 'concerns':
        return concerns.total ?? concerns.items.length;
      case 'configuration':
        return null;
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
      {visibleTabs.map((tab) => {
        const count = getCounts(tab.value);
        return (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              count !== null ? (
                <Badge
                  badgeContent={count > 0 ? count : undefined}
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { right: -12 } }}
                >
                  {tab.label}
                </Badge>
              ) : (
                tab.label
              )
            }
            icon={tab.icon}
            iconPosition="start"
          />
        );
      })}
    </Tabs>
  );
}
