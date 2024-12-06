import { generateClient } from 'aws-amplify/data';

export type QChatSchema = {
  models: {
    QChatRequest: {
      primaryKey: 'id';
      fields: {
        customer: string;
        website: string;
        additional_sites?: string[];
        chatbotname?: string;
        chatbot_logo_url?: string;
        initial_text?: string;
        guardrails?: string;
        acceptTnC: boolean;
        docs?: string[];
        token?: string;
        bot_status?: "Active" | "Expired" | "Disabled";
        qchatform_status?: "Submitted" | "Completed" | "Error";
        regionQ?: string;
        expiry_datetime?: Date;
        requester_email?: string;
        applicationIdQ?: string;
        indexedPages?: string;
        config?: string;
        id: string;
      };
    };
  };
};
export type QChatClient = ReturnType<typeof generateClient<QChatSchema>>;

export interface APIResponse {
  applicationIdQ: string;
  token: string;
  publicURL?: string;
}

export interface QChatPayload {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  settings?: Record<string, unknown>;
}

export interface QChatRequestUpdateInput {
  id: string;
  qchatform_status: "Submitted" | "Completed" | "Error";
  applicationIdQ: string;
  token: string;
}