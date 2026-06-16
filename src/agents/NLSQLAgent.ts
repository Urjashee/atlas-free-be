import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";
import { SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import AppDataSource from "../../ormconfig";
import { AnalyticsService } from "../services/Analytics.service";
import { Constants } from "../helper/Constants.helper";

const SCHEMA_DESCRIPTION = `
## Core User Tables
- users: id, first_name, last_name, email, role_id (FK→user_role.id; 1=admin,2=organization,3=service_manager,4=advocate,5=survivor), organization_id (FK→organization.id), is_active, is_status, created_at, updated_at
- user_role: id, name
- organization: id, name, street, address, state_id (FK→state.id), city, zipcode, disclose_address, year, website, tax_exemption, ein, primary_purpose (comma-separated ints), is_active (1=active,0=inactive), under_review, platform_purpose, created_at, updated_at
- state: id, name

## Service Tables
- service_details: id, organization_id, name, service_type, total_available_slots, slots_available, slots_beds, is_submitted, genders_served, served_to, citizenship_requirement, language_requirement, trafficking_status, legal, health_needs, medications, mental_health_diagnoses, physical_accommodations, entry_requirement, service_model, faith_engagement, service_structure, sleeping_arrangement, staffing_level, teams_diversity, service_guidelines, created_at, updated_at  [array columns store comma-separated ints]
- service_setting: id, service_id (FK→service_details.id), available_slots, contact_email, contact_phone, created_at, updated_at
- service_headings: id, name
- service_details_options: id, name, type, icon, serviceHeadingId (FK→service_headings.id)
- email_reminder: id, service_id (FK→service_details.id), email, day_of_week, time, time_zone, created_at, updated_at

## Service Request / Client Tables
- assigned_services: id, status (1=Pending,2=Waitlisted,3=Accepted,4=Placed,5=Cancelled,6=Unable_to_Serve), case_no, organization_id, user_id, client_service_id, service_id, created_at, updated_at
- client_service: id, organization_id, user_id, client_id, english_speaking_ability, preferred_language, gender, race, citizenship_status, client_experienced, pregnant, pregnant_months, children_accompany, children_to_accompany, ages_of_children, criteria, medications, mental_health_diagnoses, physical_accommodation, nicotine_products, created_at, updated_at

## Support Tables
- affiliations: id, organization_id, affiliation_id (FK→registration_option.id), affiliation_file, file_size, is_active, created_at, updated_at
- registration_option: id, name, type
- advocate_service: id, name, type
- device_token: id, userId, device_token, device_type, token
- password_reset: id, email, token, type, active, user_id, createdAt, updatedAt
- report_user: id, reason, type (survivor|advocate), organization_id, reported_user_id, reported_client_id, reported_by_id, created_at, updated_at
- report_service: id, reason, organization_id, user_id, service_id, created_at, updated_at
`;

const FORBIDDEN_KEYWORDS = [
    /\bINSERT\b/,
    /\bUPDATE\b/,
    /\bDELETE\b/,
    /\bDROP\b/,
    /\bCREATE\b/,
    /\bALTER\b/,
    /\bTRUNCATE\b/,
    /\bREPLACE\b/,
    /\bGRANT\b/,
    /\bREVOKE\b/,
    /\bLOAD\b/,
    /\bCALL\b/,
    /\bEXEC\b/,
    /\bINTO\s+OUTFILE\b/,
    /\bINTO\s+DUMPFILE\b/,
];

const getSchemaToolDef = tool(
    async ({ table_name }: { table_name?: string }) => {
        if (table_name) {
            const lines = SCHEMA_DESCRIPTION.split("\n").filter(
                (line) => line.toLowerCase().includes(table_name.toLowerCase())
            );
            return lines.length > 0 ? lines.join("\n") : `No schema found for table: ${table_name}`;
        }
        return SCHEMA_DESCRIPTION;
    },
    {
        name: "get_schema",
        description:
            "Returns the database table schema so you know column names before writing SQL. Optionally filter by table_name to get a specific table.",
        schema: z.object({
            table_name: z.string().optional().describe("Optional table name to filter schema output"),
        }),
    }
);

const executeSqlToolDef = tool(
    async ({ sql, limit }: { sql: string; limit?: number }) => {
        const normalized = sql.trim().toUpperCase();

        const ALLOWED_STARTERS = ["SELECT", "WITH", "EXPLAIN"];
        const startsOk = ALLOWED_STARTERS.some((s) => normalized.startsWith(s));
        if (!startsOk) {
            return "ERROR: Only SELECT, WITH (CTEs), and EXPLAIN queries are permitted. No data mutations allowed.";
        }

        const containsForbidden = FORBIDDEN_KEYWORDS.some((re) => re.test(normalized));
        if (containsForbidden) {
            return "ERROR: Query contains a forbidden keyword. Only read-only SELECT statements are allowed.";
        }

        const effectiveLimit = Math.min(limit ?? 100, 200);
        const hasLimit = /\bLIMIT\b/i.test(sql);
        const finalSql = hasLimit
            ? sql.trimEnd().replace(/;$/, "")
            : `${sql.trimEnd().replace(/;$/, "")} LIMIT ${effectiveLimit}`;

        try {
            const rows = await AppDataSource.query(finalSql);
            return JSON.stringify({ query_executed: finalSql, rows, count: rows.length });
        } catch (err: any) {
            return `SQL ERROR: ${err.message}`;
        }
    },
    {
        name: "execute_sql",
        description:
            "Executes a READ-ONLY SQL SELECT query against the MySQL database. Only SELECT, WITH (CTEs), and EXPLAIN are permitted — no INSERT, UPDATE, DELETE, DROP, or any write operation. Always use explicit column names. Results are capped at 200 rows.",
        schema: z.object({
            sql: z.string().describe("The SQL SELECT query to execute. No semicolons needed."),
            limit: z.number().optional().describe("Max rows to return (default 100, capped at 200)."),
        }),
    }
);

const getAnalyticsToolDef = tool(
    async ({
        method,
        from_date,
        to_date,
        role_type,
        status,
    }: {
        method: string;
        from_date?: string;
        to_date?: string;
        role_type?: number;
        status?: number;
    }) => {
        const svc = new AnalyticsService();
        try {
            let result: any;
            switch (method) {
                case "getOrganizationCount":
                    result = await svc.getOrganizationCount(from_date, to_date);
                    break;
                case "getServiceCount":
                    result = await svc.getServiceCount(from_date, to_date);
                    break;
                case "getUserCount":
                    if (role_type === undefined) return "ERROR: getUserCount requires role_type (4=Advocate, 5=Survivor)";
                    result = await svc.getUserCount(role_type, from_date, to_date);
                    break;
                case "getServiceRequestCount":
                    result = await svc.getServiceRequestCount(status, from_date, to_date);
                    break;
                case "getServiceRequestDemo":
                    result = await svc.getServiceRequestDemo(from_date, to_date);
                    break;
                case "getEnglishSpeakingAbilityDistribution":
                    result = await svc.getEnglishSpeakingAbilityDistribution(from_date, to_date);
                    break;
                case "getGenderDistribution":
                    result = await svc.getGenderDistribution(from_date, to_date);
                    break;
                case "getCitizenshipStatusDistribution":
                    result = await svc.getCitizenshipStatusDistribution(from_date, to_date);
                    break;
                case "getClientExperienceDistribution":
                    result = await svc.getClientExperienceDistribution(from_date, to_date);
                    break;
                case "getPregnancyDistribution":
                    result = await svc.getPregnancyDistribution(from_date, to_date);
                    break;
                case "getBirthdateDistribution":
                    result = await svc.getBirthdateDistribution(from_date, to_date);
                    break;
                case "getChildrenAccompanyDistribution":
                    result = await svc.getChildrenAccompanyDistribution(from_date, to_date);
                    break;
                case "getCriteriaDistribution":
                    result = await svc.getCriteriaDistribution(from_date, to_date);
                    break;
                case "getRaceDistribution":
                    result = await svc.getRaceDistribution(from_date, to_date);
                    break;
                case "getMedicationDistribution":
                    result = await svc.getMedicationDistribution(from_date, to_date);
                    break;
                case "getPhysicalAccommodationDistribution":
                    result = await svc.getPhysicalAccommodationDistribution(from_date, to_date);
                    break;
                case "getMentalHealthDistribution":
                    result = await svc.getMentalHealthDistribution(from_date, to_date);
                    break;
                case "getNicotineProductsDistribution":
                    result = await svc.getNicotineProductsDistribution(from_date, to_date);
                    break;
                case "getServicesByStatus":
                    result = await svc.getServicesByStatus(from_date, to_date);
                    break;
                case "getServicesByServiceType":
                    result = await svc.getServicesByServiceType(from_date, to_date);
                    break;
                case "getServicesByServiceModel":
                    result = await svc.getServicesByServiceModel(from_date, to_date);
                    break;
                case "getServicesBySlotsBeds":
                    result = await svc.getServicesBySlotsBeds(from_date, to_date);
                    break;
                case "getServicesByGenderServed":
                    result = await svc.getServicesByGenderServed(from_date, to_date);
                    break;
                case "getServicesByServedTo":
                    result = await svc.getServicesByServedTo(from_date, to_date);
                    break;
                case "getServicesByCitizenshipRequirements":
                    result = await svc.getServicesByCitizenshipRequirements(from_date, to_date);
                    break;
                case "getServicesByLanguageRequirements":
                    result = await svc.getServicesByLanguageRequirements(from_date, to_date);
                    break;
                case "getServicesByTraffickingStatus":
                    result = await svc.getServicesByTraffickingStatus(from_date, to_date);
                    break;
                case "getServicesByLegal":
                    result = await svc.getServicesByLegal(from_date, to_date);
                    break;
                case "getServicesByHealthNeeds":
                    result = await svc.getServicesByHealthNeeds(from_date, to_date);
                    break;
                case "getServicesByMedications":
                    result = await svc.getServicesByMedications(from_date, to_date);
                    break;
                case "getServicesByMentalHealth":
                    result = await svc.getServicesByMentalHealth(from_date, to_date);
                    break;
                case "getServicesByPhysicalAccommodations":
                    result = await svc.getServicesByPhysicalAccommodations(from_date, to_date);
                    break;
                case "getServicesByEntryRequirements":
                    result = await svc.getServicesByEntryRequirements(from_date, to_date);
                    break;
                case "getServicesByFaithEngagement":
                    result = await svc.getServicesByFaithEngagement(from_date, to_date);
                    break;
                case "getServicesByServiceStructure":
                    result = await svc.getServicesByServiceStructure(from_date, to_date);
                    break;
                case "getServicesBySleepingArrangement":
                    result = await svc.getServicesBySleepingArrangement(from_date, to_date);
                    break;
                case "getServicesByStaffingLevel":
                    result = await svc.getServicesByStaffingLevel(from_date, to_date);
                    break;
                case "getServicesByTeamDiversity":
                    result = await svc.getServicesByTeamDiversity(from_date, to_date);
                    break;
                case "getServicesByServiceGuidelines":
                    result = await svc.getServicesByServiceGuidelines(from_date, to_date);
                    break;
                default:
                    return `ERROR: Unknown analytics method "${method}". Use get_schema or execute_sql for custom queries.`;
            }
            return JSON.stringify(result);
        } catch (err: any) {
            return `ANALYTICS ERROR: ${err.message}`;
        }
    },
    {
        name: "get_analytics",
        description: `Calls a pre-built analytics method from AnalyticsService. PREFER this over raw SQL when the question maps to a known metric.

Available methods (all accept optional from_date and to_date in ISO format):
- getOrganizationCount — total active organizations
- getServiceCount — total services in active orgs
- getUserCount (requires role_type: 4=Advocate, 5=Survivor)
- getServiceRequestCount (optional status: 1=Pending,2=Waitlisted,3=Accepted,4=Placed,5=Cancelled,6=UnableToServe)
- getServiceRequestDemo — service request demographics
- getEnglishSpeakingAbilityDistribution
- getGenderDistribution
- getCitizenshipStatusDistribution
- getClientExperienceDistribution
- getPregnancyDistribution
- getBirthdateDistribution
- getChildrenAccompanyDistribution
- getCriteriaDistribution
- getRaceDistribution
- getMedicationDistribution
- getPhysicalAccommodationDistribution
- getMentalHealthDistribution
- getNicotineProductsDistribution
- getServicesByStatus
- getServicesByServiceType
- getServicesByServiceModel
- getServicesBySlotsBeds
- getServicesByGenderServed
- getServicesByServedTo
- getServicesByCitizenshipRequirements
- getServicesByLanguageRequirements
- getServicesByTraffickingStatus
- getServicesByLegal
- getServicesByHealthNeeds
- getServicesByMedications
- getServicesByMentalHealth
- getServicesByPhysicalAccommodations
- getServicesByEntryRequirements
- getServicesByFaithEngagement
- getServicesByServiceStructure
- getServicesBySleepingArrangement
- getServicesByStaffingLevel
- getServicesByTeamDiversity
- getServicesByServiceGuidelines`,
        schema: z.object({
            method: z.string().describe("The analytics method name to call"),
            from_date: z.string().optional().describe("Start date filter (ISO format, e.g. 2026-01-01)"),
            to_date: z.string().optional().describe("End date filter (ISO format, e.g. 2026-03-31)"),
            role_type: z.number().optional().describe("Required for getUserCount: 4=Advocate, 5=Survivor"),
            status: z.number().optional().describe("Optional for getServiceRequestCount: 1-6"),
        }),
    }
);

function buildSystemPrompt(): string {
    const today = new Date().toISOString().split("T")[0];
    return `Today's date is ${today}. Use this as your reference when interpreting relative date phrases like "last month", "this year", "last 6 months", "past quarter", etc. Always derive exact date ranges from this date before querying.

You are an expert data analyst for the Atlas Free platform — a human trafficking survivor services coordination system. You answer admin users' questions about platform data.

Strategy:
1. PREFERRED: Use get_analytics with a known method name when the question maps to a pre-built metric.
2. FALLBACK: Use get_schema to understand column names, then execute_sql with a safe SELECT.

Rules you must follow:
- ONLY use SELECT queries. Never INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, or any mutation.
- Always LIMIT results — avoid SELECT * on large tables.
- "Active organizations" means is_active = 1 in the organization table.
- Role IDs: Admin=1, OrgAdmin=2, ServiceManager=3, Advocate=4, Survivor=5.
- Service request status: 1=Pending, 2=Waitlisted, 3=Accepted, 4=Placed, 5=Cancelled, 6=Unable to Serve.
- Array columns (genders_served, medications, etc.) store comma-separated integers as plain strings.
- For date filtering, use the created_at column with BETWEEN.
- Return your final answer as a clear, concise natural language response. Include key numbers prominently.`;
}

const model = new ChatAnthropic({
    model: "claude-sonnet-4-6",
    temperature: 0,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    maxTokens: 4096,
});

export const nlSqlAgent = createReactAgent({
    llm: model,
    tools: [getSchemaToolDef, executeSqlToolDef, getAnalyticsToolDef],
    messageModifier: (messages) => [new SystemMessage(buildSystemPrompt()), ...messages],
});
