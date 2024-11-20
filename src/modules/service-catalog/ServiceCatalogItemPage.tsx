import styled from "styled-components";
import { useItemFormFields } from "./components/useItemFormFields";
import { ItemRequestForm } from "./components/service-catalog-item/ItemRequestForm";
import type { Organization } from "../ticket-fields";
import { useServiceCatalogItem } from "./useServiceCatalogItem";
import { useServiceFormSubmit } from "./useServiceFormSubmit";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${(props) => props.theme.space.xxl};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

export interface ServiceCatalogItemPageProps {
  serviceCatalogItemId: number;
  baseLocale: string;
  hasAtMentions: boolean;
  userRole: string;
  userId: number;
  brandId: number;
  organizations: Array<Organization>;
  wysiwyg: boolean;
}

export function ServiceCatalogItemPage({
  serviceCatalogItemId,
  baseLocale,
  hasAtMentions,
  userRole,
  organizations,
  userId,
  brandId,
}: ServiceCatalogItemPageProps) {
  const serviceCatalogItem = useServiceCatalogItem(serviceCatalogItemId);
  const { requestFields, handleChange } = useItemFormFields(
    serviceCatalogItem,
    baseLocale
  );
  const { submitServiceItemRequest } = useServiceFormSubmit(
    serviceCatalogItem,
    requestFields
  );

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitServiceItemRequest();
    } catch (error) {
      console.error("Error submitting service item request:", error);
    }
  };

  const defaultOrganizationId =
    organizations.length > 0 && organizations[0]?.id
      ? organizations[0]?.id?.toString()
      : null;

  return (
    <Container>
      {serviceCatalogItem && (
        <ItemRequestForm
          requestFields={requestFields}
          serviceCatalogItem={serviceCatalogItem}
          baseLocale={baseLocale}
          hasAtMentions={hasAtMentions}
          userRole={userRole}
          userId={userId}
          brandId={brandId}
          defaultOrganizationId={defaultOrganizationId}
          handleChange={handleChange}
          onSubmit={handleRequestSubmit}
        />
      )}
    </Container>
  );
}
