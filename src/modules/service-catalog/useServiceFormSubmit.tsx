import type { Field } from "../ticket-fields";
import type { ServiceCatalogItem } from "./data-types/ServiceCatalogItem";

export function useServiceFormSubmit(
  serviceCatalogItem: ServiceCatalogItem | undefined,
  requestFields: Field[]
) {
  const submitServiceItemRequest = async () => {
    if (!serviceCatalogItem) {
      return;
    }
    console.log("requestFields", requestFields);
    const currentUserRequest = await fetch("/api/v2/users/me.json");
    const currentUser = await currentUserRequest.json();
    const response = await fetch("/api/v2/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": currentUser.user.authenticity_token,
      },
      body: JSON.stringify({
        request: {
          subject: "Request for: " + serviceCatalogItem.name,
          comment: {
            body: serviceCatalogItem.description,
          },
          ticket_form_id: serviceCatalogItem.form_id,
          custom_fields: requestFields.map((field) => {
            if (field.type !== "subject" && field.type !== "description") {
              return {
                id: field.id,
                value: field.value,
              };
            } else return;
          }),
        },
      }),
    });
    const data = await response.json();
    const redirectUrl = "/hc/requests/" + data.request.id;
    window.location.href = redirectUrl;
  };

  return { submitServiceItemRequest };
}
