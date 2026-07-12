import { http } from "@/lib/api-client";
import type { Webhook, CreatedWebhook, WebhookEvent } from "@/types/api";

export const webhooksService = {
    async list(): Promise<{ webhooks: Webhook[]; availableEvents: WebhookEvent[] }> {
        const response = await http.get<{ data: { webhooks: Webhook[]; availableEvents: WebhookEvent[] } }>(`/webhooks`);
        return response.data;
    },

    async create(input: { url: string; events: WebhookEvent[]; description?: string }): Promise<CreatedWebhook> {
        const response = await http.post<{ data: { webhook: CreatedWebhook } }>(`/webhooks`, input);
        return response.data.webhook;
    },

    async delete(id: string): Promise<void> {
        await http.delete(`/webhooks/${id}`);
    },
};
