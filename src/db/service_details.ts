import {ServiceDetailsOptions} from "../entity/ServiceDetailsOptions.entity";
import {ServiceHeadings} from "../entity/ServiceHeadings.entity";
import mysql, {Connection} from "mysql2";

const heading_general_details = new ServiceHeadings();
heading_general_details.id = 1;

const heading_demographics = new ServiceHeadings();
heading_demographics.id = 2;

const heading_eligibility = new ServiceHeadings();
heading_eligibility.id = 3;

const heading_service_model = new ServiceHeadings();
heading_service_model.id = 4;

const heading_offerings = new ServiceHeadings();
heading_offerings.id = 5;

const service_details_options: ServiceDetailsOptions[] = [
    {id: 1, name: 'Advocacy/Case Management', type: "service_type", serviceHeading: heading_general_details, icon: "https://atlas-free.s3.us-east-1.amazonaws.com/advocacy.svg"},
    {id: 2, name: 'Educational/Vocational Service', type: "service_type", serviceHeading: heading_general_details, icon: "https://atlas-free.s3.us-east-1.amazonaws.com/advocacy.svg"},
    {id: 3, name: 'Housing, Long-Term (3+ months)', type: "service_type", serviceHeading: heading_general_details, icon: "https://atlas-free.s3.us-east-1.amazonaws.com/advocacy.svg"},
    {
        id: 4,
        name: 'Housing, Short-Term (24 hours up to 3 months)',
        type: "service_type",
        serviceHeading: heading_general_details,
        icon: "https://atlas-free.s3.us-east-1.amazonaws.com/advocacy.svg"
    },
    {id: 5, name: 'Legal Advocacy', type: "service_type", serviceHeading: heading_general_details, icon: "https://atlas-free.s3.us-east-1.amazonaws.com/advocacy.svg"},
    {id: 6, name: 'Mental Health Service', type: "service_type", serviceHeading: heading_general_details, icon: "https://atlas-free.s3.us-east-1.amazonaws.com/advocacy.svg"},
    {id: 7, name: 'Substance-Use Disorder Service', type: "service_type", serviceHeading: heading_general_details, icon: "https://atlas-free.s3.us-east-1.amazonaws.com/advocacy.svg"},
    {id: 8, name: 'Total beds', type: "slots_beds", serviceHeading: heading_general_details, icon: ""},
    {id: 9, name: 'Total slots', type: "slots_beds", serviceHeading: heading_general_details, icon: ""},
    {
        id: 10,
        name: 'All Genders (automatically selects all below)',
        type: "genders_served",
        serviceHeading: heading_demographics,
        icon: ""
    },
    {id: 11, name: 'Female', type: "genders_served", serviceHeading: heading_demographics, icon: ""},
    {id: 12, name: 'Male', type: "genders_served", serviceHeading: heading_demographics, icon: ""},
    {id: 13, name: 'Non-Binary', type: "genders_served", serviceHeading: heading_demographics, icon: ""},
    {id: 14, name: 'Transgender', type: "genders_served", serviceHeading: heading_demographics, icon: ""},
    {id: 15, name: 'Two-Spirit', type: "genders_served", serviceHeading: heading_demographics, icon: ""},
    {id: 16, name: 'Single Individuals', type: "served_to", serviceHeading: heading_demographics, icon: ""},
    {id: 17, name: 'Pregnant Individuals', type: "served_to", serviceHeading: heading_demographics, icon: ""},
    {id: 18, name: 'Parenting Individuals', type: "served_to", serviceHeading: heading_demographics, icon: ""},
    {id: 19, name: 'Married Couples', type: "served_to", serviceHeading: heading_demographics, icon: ""},
    {id: 20, name: 'Parenting Couples', type: "served_to", serviceHeading: heading_demographics, icon: ""},
    {id: 21, name: 'We accept US citizens', type: "citizenship", serviceHeading: heading_demographics, icon: ""},
    {id: 22, name: 'We accept documented foreign nationals', type: "citizenship", serviceHeading: heading_demographics, icon: ""},
    {
        id: 23,
        name: 'We accept undocumented foreign nationals',
        type: "citizenship",
        serviceHeading: heading_demographics
        , icon: ""},
    {id: 24, name: 'English-speaking', type: "language", serviceHeading: heading_demographics, icon: ""},
    {id: 25, name: 'Limited English-speaking ability', type: "language", serviceHeading: heading_demographics, icon: ""},
    {id: 26, name: 'No English-speaking ability', type: "language", serviceHeading: heading_demographics, icon: ""},
    {id: 27, name: 'Sex Trafficking', type: 'trafficking_status', serviceHeading: heading_eligibility, icon: ""},
    {id: 28, name: 'Labor Trafficking', type: 'trafficking_status', serviceHeading: heading_eligibility, icon: ""},
    {id: 29, name: 'Prostitution', type: 'trafficking_status', serviceHeading: heading_eligibility, icon: ""},
    {id: 30, name: 'Survival Sex', type: 'trafficking_status', serviceHeading: heading_eligibility, icon: ""},
    {id: 31, name: 'Other forms of commercial sex', type: 'trafficking_status', serviceHeading: heading_eligibility, icon: ""},
    {id: 32, name: 'have an abuser actively looking for them', type: 'legal', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 33,
        name: 'have outstanding warrants or legal obligations',
        type: 'legal',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 34,
        name: 'are involved in open or pending investigations or cases',
        type: 'legal',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 35, name: 'are currently incarcerated', type: 'legal', serviceHeading: heading_eligibility, icon: ""},
    {id: 36, name: 'were recently incarcerated', type: 'legal', serviceHeading: heading_eligibility, icon: ""},
    {id: 37, name: 'will be on parole or probation', type: 'legal', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 38,
        name: 'are part of a diversion program with court requirements',
        type: 'legal',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 39, name: 'have a history of criminal charges', type: 'legal', serviceHeading: heading_eligibility, icon: ""},
    {id: 40, name: 'are registered sex offenders', type: 'legal', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 41,
        name: 'are currently taking prescribed medication for mental illness',
        type: 'health_needs',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 42,
        name: 'are currently taking prescribed medication for opioid treatment',
        type: 'health_needs',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 43, name: 'experience episodes of psychosis', type: 'health_needs', serviceHeading: heading_eligibility, icon: ""},
    {id: 44, name: 'have a certified service animal', type: 'health_needs', serviceHeading: heading_eligibility, icon: ""},
    {id: 45, name: 'have an emotional support animal', type: 'health_needs', serviceHeading: heading_eligibility, icon: ""},
    {id: 46, name: 'have immediate health concerns', type: 'health_needs', serviceHeading: heading_eligibility, icon: ""},
    {id: 47, name: 'have physical disabilities', type: 'health_needs', serviceHeading: heading_eligibility, icon: ""},
    {id: 48, name: 'have reported self-injuring', type: 'health_needs', serviceHeading: heading_eligibility, icon: ""},
    {id: 49, name: 'have reported suicide ideation', type: 'health_needs', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 50,
        name: 'have used illegal substances in the last 30 days',
        type: 'health_needs',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 51,
        name: 'have used illegal substances in the last 7 days',
        type: 'health_needs',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 52, name: 'use alcohol', type: 'health_needs', serviceHeading: heading_eligibility, icon: ""},
    {id: 53, name: 'use marijuana', type: 'health_needs', serviceHeading: heading_eligibility, icon: ""},
    {id: 54, name: 'use tobacco products', type: 'health_needs', serviceHeading: heading_eligibility, icon: ""},
    {id: 55, name: 'Not taking any medications', type: 'medications', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 56,
        name: 'Stimulants (Adderall, Ritalin, Vyvanse, etc)',
        type: 'medications',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 57,
        name: 'Mood Stabilizers (Lithium, Abilify, Saphris, Vraylar, etc)',
        type: 'medications',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 58,
        name: 'Antipsychotic (Risperdal, Seroquel, Ziprasidone, etc)',
        type: 'medications',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 59, name: 'Injectables (insulin, etc)', type: 'medications', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 60,
        name: 'Anti-Anxiety (Xanax, Klonopin, Valium, Ativan, etc)',
        type: 'medications',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 61,
        name: 'Anti-Depressants/SSRI’s (Prozac, Seroxat, Lustral, Cipramil, etc)',
        type: 'medications',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 62, name: 'Methadone', type: 'medications', serviceHeading: heading_eligibility, icon: ""},
    {id: 63, name: 'Suboxone', type: 'medications', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 64,
        name: 'Narcotics (Vicodin, OxyContin, Percocet)',
        type: 'medications',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 65,
        name: 'Nerve Pain/Anticonvulsant (Gabapentin, Lyrica)',
        type: 'medications',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 66, name: 'Medical Marijuana', type: 'medications', serviceHeading: heading_eligibility, icon: ""},
    {id: 67, name: 'Other', type: 'medications', serviceHeading: heading_eligibility, icon: ""},
    {id: 68, name: 'Anxiety', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility, icon: ""},
    {id: 69, name: 'Bipolar', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 70,
        name: 'Borderline Personality Disorder',
        type: 'mental_health_diagnoses',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 71, name: 'PTSD', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility, icon: ""},
    {id: 72, name: 'Depression', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 73,
        name: 'Dissociative Identity Disorder',
        type: 'mental_health_diagnoses',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 74, name: 'Schizophrenia', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility, icon: ""},
    {id: 75, name: 'Self-injuring', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 76,
        name: 'Suicide ideation/Suicide Risk',
        type: 'mental_health_diagnoses',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 77, name: 'Eating Disorder', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility, icon: ""},
    {id: 78, name: 'None', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility, icon: ""},
    {id: 79, name: 'Other (fill in option)', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility, icon: ""},
    {id: 80, name: 'Wheelchair accessibility', type: 'physical_accommodations', serviceHeading: heading_eligibility, icon: ""},
    {id: 81, name: 'Ramp access', type: 'physical_accommodations', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 82,
        name: 'Assistance with mobility (e.g., walking, getting to/from locations)',
        type: 'physical_accommodations',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 83,
        name: 'Visual assistance (e.g., large print, screen reader support)',
        type: 'physical_accommodations',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 84,
        name: 'Hearing assistance (e.g., sign language interpreter, hearing loop)',
        type: 'physical_accommodations',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 85,
        name: 'Seating with support (e.g., back support, specific seating arrangement)',
        type: 'physical_accommodations',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 86,
        name: 'Specialized equipment (e.g., adjustable tables, assistive technology)',
        type: 'physical_accommodations',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 87, name: 'Other', type: 'physical_accommodations', serviceHeading: heading_eligibility, icon: ""},
    {id: 88, name: 'Cigarettes', type: 'smoking_allowed', serviceHeading: heading_eligibility, icon: ""},
    {id: 89, name: 'Recreational Marijuana', type: 'smoking_allowed', serviceHeading: heading_eligibility, icon: ""},
    {id: 90, name: 'Vapes', type: 'smoking_allowed', serviceHeading: heading_eligibility, icon: ""},
    {id: 91, name: 'None', type: 'smoking_allowed', serviceHeading: heading_eligibility, icon: ""},
    {
        id: 92,
        name: 'Verified as a victim/survivor of human trafficking',
        type: 'entry_requirements',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 93,
        name: 'Must be clean/sober for a certain number of days',
        type: 'entry_requirements',
        serviceHeading: heading_eligibility
        , icon: ""},
    {
        id: 94,
        name: 'Must have a clean Urine Analysis (U/A)',
        type: 'entry_requirements',
        serviceHeading: heading_eligibility
        , icon: ""},
    {id: 95, name: 'None of the above', type: 'entry_requirements', serviceHeading: heading_eligibility, icon: ""},
    {id: 96, name: 'Person-Centered/Individualized', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 97, name: 'Survivor-Informed', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 98, name: 'Program-Centered/curriculum-based', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 99, name: 'Faith-based', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 100, name: 'Trauma-Informed', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 101, name: 'Clean and sober', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 102, name: 'Evidence-Based', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 103, name: 'Harm Reduction', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 104, name: 'Strengths-Based', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 105, name: 'Recovery-Focused', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 106, name: 'Survivor-Led', type: 'service_model', serviceHeading: heading_service_model, icon: ""},
    {id: 107, name: 'None', type: 'faith_engagement', serviceHeading: heading_service_model, icon: ""},
    {id: 108, name: 'Voluntary', type: 'faith_engagement', serviceHeading: heading_service_model, icon: ""},
    {
        id: 109,
        name: 'Expected attendance, but not mandatory participation',
        type: 'faith_engagement',
        serviceHeading: heading_service_model
        , icon: ""},
    {id: 110, name: 'Mandatory participation', type: 'faith_engagement', serviceHeading: heading_service_model, icon: ""},
    {
        id: 111,
        name: 'High structure (very limited free time)',
        type: 'service_structure',
        serviceHeading: heading_service_model
        , icon: ""},
    {
        id: 112,
        name: 'Moderate structure (some free time)',
        type: 'service_structure',
        serviceHeading: heading_service_model
        , icon: ""},
    {
        id: 113,
        name: 'Low structure (majority free time)',
        type: 'service_structure',
        serviceHeading: heading_service_model
        , icon: ""},
    {
        id: 114,
        name: 'Independent housing (live alone)',
        type: 'sleeping_arrangement',
        serviceHeading: heading_service_model
        , icon: ""},
    {
        id: 115,
        name: 'Shared housing (private bedrooms)',
        type: 'sleeping_arrangement',
        serviceHeading: heading_service_model
        , icon: ""},
    {
        id: 116,
        name: 'Shared housing (shared bedrooms)',
        type: 'sleeping_arrangement',
        serviceHeading: heading_service_model
        , icon: ""},
    {id: 117, name: '24/7 staffing', type: 'staffing_level', serviceHeading: heading_service_model, icon: ""},
    {id: 118, name: 'Staff on-site sometimes', type: 'staffing_level', serviceHeading: heading_service_model, icon: ""},
    {id: 119, name: 'No staff on-site', type: 'staffing_level', serviceHeading: heading_service_model, icon: ""},
    {
        id: 120,
        name: 'Survivor(s) or Lived Experience Experts from the Commercial Sex Trade',
        type: 'team_diversity',
        serviceHeading: heading_service_model
        , icon: ""},
    {id: 121, name: 'Bilingual or Multilingual', type: 'team_diversity', serviceHeading: heading_service_model, icon: ""},
    {
        id: 122,
        name: 'Black, Indigenous, or People of Color',
        type: 'team_diversity',
        serviceHeading: heading_service_model
        , icon: ""},
    {id: 123, name: 'Gender and sexual minorities', type: 'team_diversity', serviceHeading: heading_service_model, icon: ""},
    {id: 124, name: 'People with disabilities', type: 'team_diversity', serviceHeading: heading_service_model, icon: ""},
    {id: 125, name: 'Religious minorities', type: 'team_diversity', serviceHeading: heading_service_model, icon: ""},
    {
        id: 126,
        name: 'Daily curfew (must be in by a certain time each night)',
        type: 'service_guidelines',
        serviceHeading: heading_service_model
        , icon: ""},
    {
        id: 127,
        name: 'Initial blackout period (no phone, no Internet, etc)',
        type: 'service_guidelines',
        serviceHeading: heading_service_model
        , icon: ""},
    {id: 128, name: 'No unapproved visitors', type: 'service_guidelines', serviceHeading: heading_service_model, icon: ""},
    {id: 129, name: 'None of the above', type: 'service_guidelines', serviceHeading: heading_service_model, icon: ""},
    {id: 130, name: 'Case Management', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 131, name: 'Education', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 132, name: 'Employment Placement', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 133, name: 'Employment Preparation', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 134, name: 'Equine/Animal Therapy', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 135, name: 'Financial Assistance', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 136, name: 'Food/Groceries', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 137, name: 'Goal-planning', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 138, name: 'Housing advocacy/navigation', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 139, name: 'Hygiene Supplies', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 140, name: 'Immigration Support', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 141, name: 'Information and Referral', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 142, name: 'Life Coaching', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 143, name: 'Life Skills', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 144, name: 'Medical Consultation', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 145, name: 'Medical Service', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {
        id: 146,
        name: 'Mental Health Counseling/Trauma therapy (licensed)',
        type: 'support_provided',
        serviceHeading: heading_offerings
        , icon: ""},
    {id: 147, name: 'Mentorship', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 148, name: 'Personal Advocacy', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 149, name: 'Personal ID & Documentation Support', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 150, name: 'Substance Use Services (licensed)', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 151, name: 'Support Groups', type: 'support_provided', serviceHeading: heading_offerings, icon: ""},
    {id: 152, name: 'Case Management', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 153, name: 'Education', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 154, name: 'Employment Placement', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 155, name: 'Employment Preparation', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 156, name: 'Equine/Animal Therapy', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 157, name: 'Financial Assistance', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 158, name: 'Food/Groceries', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 159, name: 'Housing advocacy/navigation', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 160, name: 'Immigration Support', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 161, name: 'Life Coaching', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 162, name: 'Life Skills', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 163, name: 'Medical Consultation', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 164, name: 'Medical Service', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {
        id: 165,
        name: 'Mental Health Counseling/Trauma therapy (licensed)',
        type: 'support_offered',
        serviceHeading: heading_offerings
        , icon: ""},
    {id: 166, name: 'Mentorship', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 167, name: 'Personal ID & Documentation Support', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 168, name: 'Substance Use Services (licensed)', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
    {id: 169, name: 'Support Groups', type: 'support_offered', serviceHeading: heading_offerings, icon: ""},
];

async function seedGeneralDetails() {
    await new Promise<void>((resolve, reject) => {
        connection.query('TRUNCATE TABLE service_details_options', (err) => {
            if (err) {
                console.error('Error truncating service_details_options table:', err);
                reject(err);
                return;
            }
            console.log('service_details_options table truncated');
            resolve();
        });
    });
    for (const data of service_details_options) {
        const query = 'INSERT INTO service_details_options (id, name, type, serviceHeadingId, icon) VALUES (?, ?, ?, ?, ?)';
        await new Promise<void>((resolve, reject) => {
            connection.query(query, [data.id, data.name, data.type, data.serviceHeading.id, data.icon], (err) => {
                if (err) {
                    console.error('Error inserting Service details options:', err);
                    reject(err);
                    return;
                }
                console.log('Data inserted:', data.id);
                resolve();
            });
        });
    }
}

const connection: Connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');

    seedGeneralDetails()
        .finally(() => {
            connection.end((err) => {
                if (err) {
                    console.error('Error closing the connection:', err);
                    return;
                }
                console.log('MySQL connection closed.');
            });
        });
});
