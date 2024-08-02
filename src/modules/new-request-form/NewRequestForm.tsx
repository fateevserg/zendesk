import type { AnswerBot, Field, RequestForm } from "./data-types";
import { useState } from "react";
import { Input } from "./fields/Input";
import { TextArea } from "./fields/textarea/TextArea";
import { DropDown } from "./fields/DropDown";
import { Checkbox } from "./fields/Checkbox";
import { MultiSelect } from "./fields/MultiSelect";
import { TicketFormField } from "./ticket-form-field/TicketFormField";
import { ParentTicketField } from "./parent-ticket-field/ParentTicketField";
import { Anchor, Button } from "@zendeskgarden/react-buttons";
import styled from "styled-components";
import { Alert } from "@zendeskgarden/react-notifications";
import { useFormSubmit } from "./useFormSubmit";
import { usePrefilledTicketFields } from "./usePrefilledTicketFields";
import { Attachments } from "./fields/attachments/Attachments";
import { useEndUserConditions } from "./useEndUserConditions";
import { DatePicker } from "./fields/DatePicker";
import { CcField } from "./fields/cc-field/CcField";
import { CreditCard } from "./fields/CreditCard";
import { Tagger } from "./fields/Tagger";
import { SuggestedArticles } from "./suggested-articles/SuggestedArticles";
import { AnswerBotModal } from "./answer-bot-modal/AnswerBotModal";
import { useTranslation } from "react-i18next";
import { Paragraph } from "@zendeskgarden/react-typography";

export interface NewRequestFormProps {
  requestForm: RequestForm;
  wysiwyg: boolean;
  newRequestPath: string;
  parentId: string;
  parentIdPath: string;
  locale: string;
  baseLocale: string;
  hasAtMentions: boolean;
  userRole: string;
  brandId: number;
  answerBotModal: {
    answerBot: AnswerBot;
    hasRequestManagement: boolean;
    isSignedIn: boolean;
    helpCenterPath: string;
    requestsPath: string;
    requestPath: string;
  };
}

const StyledParagraph = styled(Paragraph)`
  margin: ${(props) => props.theme.space.md} 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.md};
`;

const Footer = styled.div`
  margin-top: ${(props) => props.theme.space.md};
`;

export function NewRequestForm({
  requestForm,
  wysiwyg,
  newRequestPath,
  parentId,
  parentIdPath,
  locale,
  baseLocale,
  hasAtMentions,
  userRole,
  brandId,
  answerBotModal,
}: NewRequestFormProps) {
  const {
    ticket_fields,
    action,
    http_method,
    accept_charset,
    errors,
    parent_id_field,
    ticket_form_field,
    email_field,
    cc_field,
    organization_field,
    due_date_field,
    end_user_conditions,
    attachments_field,
    inline_attachments_fields,
    description_mimetype_field,
  } = requestForm;
  const { answerBot } = answerBotModal;
  const {
    ticketFields: prefilledTicketFields,
    emailField,
    ccField,
    organizationField: prefilledOrganizationField,
    dueDateField: prefilledDueDateField,
  } = usePrefilledTicketFields({
    ticketFields: ticket_fields,
    emailField: email_field,
    ccField: cc_field,
    organizationField: organization_field,
    dueDateField: due_date_field,
  });

  const [ticketFields, setTicketFields] = useState(prefilledTicketFields);
  const [organizationField, setOrganizationField] = useState(
    prefilledOrganizationField
  );
  const [dueDateField, setDueDateField] = useState(prefilledDueDateField);
  const visibleFields = useEndUserConditions(ticketFields, end_user_conditions);
  const { formRefCallback, handleSubmit } = useFormSubmit(ticketFields);
  const { t } = useTranslation();

  function handleChange(field: Field, value: Field["value"]) {
    setTicketFields(
      ticketFields.map((ticketField) =>
        ticketField.name === field.name
          ? { ...ticketField, value }
          : ticketField
      )
    );
  }

  function handleOrganizationChange(value: string) {
    if (organizationField === null) {
      return;
    }

    setOrganizationField({ ...organizationField, value });
  }

  function handleDueDateChange(value: string) {
    if (dueDateField === null) {
      return;
    }

    setDueDateField({ ...dueDateField, value });
  }

  return (
    <>
      {parentId && (
        <StyledParagraph>
          <Anchor href={parentIdPath}>
            {t(
              "new-request-form.parent-request-link",
              "Follow-up to request {{parentId}}",
              {
                parentId: `\u202D#${parentId}\u202C`,
              }
            )}
          </Anchor>
        </StyledParagraph>
      )}
      <StyledParagraph aria-hidden="true">
        {t(
          "new-request-form.required-fields-info",
          "Fields marked with an asterisk (*) are required."
        )}
      </StyledParagraph>
      <Form
        ref={formRefCallback}
        action={action}
        method={http_method}
        acceptCharset={accept_charset}
        noValidate
        onSubmit={handleSubmit}
      >
        {errors && <Alert type="error">{errors}</Alert>}
        {parent_id_field && <ParentTicketField field={parent_id_field} />}
        {ticket_form_field.options.length > 0 && (
          <TicketFormField
            field={ticket_form_field}
            newRequestPath={newRequestPath}
          />
        )}
        {emailField && <Input key={emailField.name} field={emailField} />}
        {ccField && <CcField field={ccField} />}
        {organizationField && (
          <DropDown
            key={organizationField.name}
            field={organizationField}
            onChange={(value) => {
              handleOrganizationChange(value);
            }}
          />
        )}
        {visibleFields.map((field) => {
          switch (field.type) {
            case "subject":
              return (
                <>
                  <Input
                    key={field.name}
                    field={field}
                    onChange={(value) => handleChange(field, value)}
                    disabled
                  />
                  <SuggestedArticles
                    query={field.value as string | undefined}
                    locale={locale}
                  />
                </>
              );
            case "text":
            case "integer":
            case "decimal":
            case "regexp":
              return (
                <Input
                  key={field.name}
                  field={field}
                  onChange={(value) => handleChange(field, value)}
                />
              );
            case "partialcreditcard":
              return (
                <CreditCard
                  field={field}
                  onChange={(value) => handleChange(field, value)}
                />
              );
            case "description":
              return (
                <>
                  <TextArea
                    key={field.name}
                    field={field}
                    hasWysiwyg={wysiwyg}
                    baseLocale={baseLocale}
                    hasAtMentions={hasAtMentions}
                    userRole={userRole}
                    brandId={brandId}
                    onChange={(value) => handleChange(field, value)}
                  />
                  <input
                    type="hidden"
                    name={description_mimetype_field.name}
                    value={wysiwyg ? "text/html" : "text/plain"}
                  />
                </>
              );
            case "textarea":
              return (
                <TextArea
                  key={field.name}
                  field={field}
                  hasWysiwyg={false}
                  baseLocale={baseLocale}
                  hasAtMentions={hasAtMentions}
                  userRole={userRole}
                  brandId={brandId}
                  onChange={(value) => handleChange(field, value)}
                />
              );
            case "priority":
            case "basic_priority":
            case "tickettype":
              return (
                <>
                  <DropDown
                    key={field.name}
                    field={field}
                    onChange={(value) => handleChange(field, value)}
                  />
                  {field.value === "task" && (
                    <DatePicker
                      field={dueDateField}
                      locale={baseLocale}
                      valueFormat="dateTime"
                      onChange={(value) => {
                        handleDueDateChange(value);
                      }}
                    />
                  )}
                </>
              );
            case "checkbox":
              return (
                <Checkbox
                  field={field}
                  onChange={(value: boolean) => handleChange(field, value)}
                />
              );
            case "date":
              return (
                <DatePicker
                  field={field}
                  locale={baseLocale}
                  valueFormat="date"
                  onChange={(value) => handleChange(field, value)}
                />
              );
            case "multiselect":
              return <MultiSelect field={field} />;
            case "tagger":
              return (
                <Tagger
                  key={field.name}
                  field={field}
                  onChange={(value) => handleChange(field, value)}
                />
              );
            default:
              return <></>;
          }
        })}
        {attachments_field && <Attachments field={attachments_field} />}
        {inline_attachments_fields.map(({ type, name, value }, index) => (
          <input key={index} type={type} name={name} value={value} />
        ))}
        <Footer>
          {(ticket_form_field.options.length === 0 ||
            ticket_form_field.value) && (
            <Button isPrimary type="submit">
              {t("new-request-form.submit", "Submit")}
            </Button>
          )}
        </Footer>
      </Form>
      {answerBot.auth_token &&
        answerBot.interaction_access_token &&
        answerBot.articles.length > 0 &&
        answerBot.request_id && (
          <AnswerBotModal
            authToken={answerBot.auth_token}
            interactionAccessToken={answerBot.interaction_access_token}
            articles={answerBot.articles}
            requestId={answerBot.request_id}
            {...answerBotModal}
          />
        )}
    </>
  );
}
