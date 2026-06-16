import { HumanMessage } from "@langchain/core/messages";
import { nlSqlAgent } from "../agents/NLSQLAgent";

export interface NLQueryResult {
    answer: string;
    sql_executed: string[];
}

export class NLSQLAgentService {
    async runQuery(question: string, context?: "analytics" | "general"): Promise<NLQueryResult> {
        const contextHint =
            context === "analytics"
                ? "\n[Context: The user is viewing the analytics dashboard. Prefer the get_analytics tool for known metrics before falling back to raw SQL.]"
                : "";

        const finalQuestion = question + contextHint;

        const result = await nlSqlAgent.invoke({
            messages: [new HumanMessage(finalQuestion)],
        });

        const messages = result.messages;
        const lastMessage = messages[messages.length - 1];
        const answer =
            typeof lastMessage.content === "string"
                ? lastMessage.content
                : JSON.stringify(lastMessage.content);

        // Extract SQL queries that were actually executed by parsing execute_sql tool messages
        const sqlExecuted: string[] = [];
        for (const msg of messages) {
            if ((msg as any)._getType?.() === "tool" && (msg as any).name === "execute_sql") {
                try {
                    const parsed = JSON.parse(msg.content as string);
                    if (parsed.query_executed) {
                        sqlExecuted.push(parsed.query_executed);
                    }
                } catch {
                    // tool returned an error string, not JSON — skip
                }
            }
        }

        return { answer, sql_executed: sqlExecuted };
    }
}
