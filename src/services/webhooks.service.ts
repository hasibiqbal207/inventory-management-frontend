import { apiClient } from "@/lib/api-client";
import type { Webhook, CreatedWebhook, WebhookEvent } from "@/types/api";

export const webhooksService = {
    async list(): Promise<{ webhooks: Webhook[]; availableEvents: WebhookEvent[] }> {
        const response: any = await apiClient.get(`/webhooks`);
        return response.data;
    },

    async create(input: { url: string; events: WebhookEvent[]; description?: string }): Promise<CreatedWebhook> {
        const response: any = await apiClient.post(`/webhooks`, input);
        return response.data.webhook;
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/webhooks/${id}`);
    },
};
