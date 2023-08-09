import { useRef, type FormEventHandler } from "react";

// NOTE: This is a temporary handling of the CSRF token
const fetchCsrfToken = async () => {
  const response = await fetch("/hc/api/internal/csrf_token.json");
  const { current_session } = await response.json();
  return current_session.csrf_token as string;
};

/**
 * This hook creates an event handler for form submits, fetching the CSRF token
 * from the backend and appending it to the form
 * @returns a Submit Event Handler function
 */
export function useSubmitHandler(): FormEventHandler<HTMLFormElement> {
  const isSubmitting = useRef(false);

  return async (e) => {
    e.preventDefault();

    /* We are performing an async call to fetch the CSRF token and for this reason
       the submit is not immediate, and the user can click the submit button multiple times.
       We don't want to disable the submit button for A11Y, so we use the isSubmitting ref 
       to stop subsequent submits after the first one. */
    if (isSubmitting.current === false) {
      isSubmitting.current = true;

      const form = e.target as HTMLFormElement;

      const token = await fetchCsrfToken();
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "authenticity_token";
      hiddenInput.value = token;
      form.appendChild(hiddenInput);

      form.submit();
    }
  };
}
