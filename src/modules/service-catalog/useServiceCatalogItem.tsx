import { useEffect, useState } from "react";
import type { ServiceCatalogItem } from "./data-types/ServiceCatalogItem";

export function useServiceCatalogItem(
  serviceItemId: number
): ServiceCatalogItem | undefined {
  const [serviceCatalogItem, setServiceCatalogItem] = useState<
    ServiceCatalogItem | undefined
  >();

  useEffect(() => {
    const fetchServiceCatalogItem = async () => {
      try {
        const response = await fetch(
          `/api/v2/help_center/service_catalog/items/${serviceItemId}`
        );
        const data = await response.json();
        setServiceCatalogItem(data.service_catalog_item);
      } catch (error) {
        console.error("Error fetching service catalog item:", error);
      }
    };
    fetchServiceCatalogItem();
  }, [serviceItemId]);
  if (serviceCatalogItem) {
    return serviceCatalogItem;
  } else return undefined;
}
