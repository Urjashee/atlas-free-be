import mysql, {Connection} from 'mysql2';
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import {ServiceHeadings} from "../entity/ServiceHeadings.entity";
import {ServiceDetailsOptions} from "../entity/ServiceDetailsOptions.entity";
import {AdvocateService} from "../entity/AdvocateService.entity";
import {RegistrationOption} from "../entity/RegistrationOption.entity";
import {Users} from "../entity/Users.entity";
import {UserRole} from "../entity/UserRole.entity";

dotenv.config();

type Role = {
    id: number;
    name: string;
};

const roles: Role[] = [
    {id: 1, name: 'admin'},
    {id: 2, name: 'organization'},
    {id: 3, name: 'service_manager'},
    {id: 4, name: 'advocate'},
    {id: 5, name: 'survivor'},
];

const service_headings: ServiceHeadings[] = [
    {id: 1, name: 'General Details'},
    {id: 2, name: 'Demographics / Users Served'},
    {id: 3, name: 'Eligibility'},
    {id: 4, name: 'Service Model'},
    {id: 5, name: 'Offerings / Intake'},
];

const users_data = [
    {
        id: 2,
        email: "urja@simpalm.com",
        is_active: true,
        is_status: true,
        is_profile: true,
        password: "Goblin123", // Use plain password initially; will hash later
        role: 1,
    },
];

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
    {id: 1, name: 'Advocacy/Case Management', type: "service_type",serviceHeading: heading_general_details },
    {id: 2, name: 'Educational/Vocational Service', type: "service_type",serviceHeading: heading_general_details},
    {id: 3, name: 'Housing, Long-Term (3+ months)', type: "service_type",serviceHeading: heading_general_details},
    {id: 4, name: 'Housing, Short-Term (24 hours up to 3 months)', type: "service_type",serviceHeading: heading_general_details},
    {id: 5, name: 'Legal Advocacy', type: "service_type",serviceHeading: heading_general_details},
    {id: 6, name: 'Mental Health Service', type: "service_type",serviceHeading: heading_general_details},
    {id: 7, name: 'Substance-Use Disorder Service', type: "service_type",serviceHeading: heading_general_details},
    {id: 8, name: 'Total beds', type: "slots_beds",serviceHeading: heading_general_details},
    {id: 9, name: 'Total slots', type: "slots_beds",serviceHeading: heading_general_details},
    {id: 10, name: 'All Genders (automatically selects all below)', type: "genders_served",serviceHeading: heading_demographics},
    {id: 11, name: 'Female', type: "genders_served",serviceHeading: heading_demographics},
    {id: 12, name: 'Male', type: "genders_served",serviceHeading: heading_demographics},
    {id: 13, name: 'Non-Binary', type: "genders_served",serviceHeading: heading_demographics},
    {id: 14, name: 'Transgender', type: "genders_served",serviceHeading: heading_demographics},
    {id: 15, name: 'Two-Spirit', type: "genders_served",serviceHeading: heading_demographics},
    {id: 16, name: 'Single Individuals', type: "served_to",serviceHeading: heading_demographics},
    {id: 17, name: 'Pregnant Individuals', type: "served_to",serviceHeading: heading_demographics},
    {id: 18, name: 'Parenting Individuals', type: "served_to",serviceHeading: heading_demographics},
    {id: 19, name: 'Married Couples', type: "served_to",serviceHeading: heading_demographics},
    {id: 20, name: 'Parenting Couples', type: "served_to",serviceHeading: heading_demographics},
    {id: 21, name: 'We accept US citizens', type: "citizenship",serviceHeading: heading_demographics},
    {id: 22, name: 'We accept documented foreign nationals', type: "citizenship",serviceHeading: heading_demographics},
    {id: 23, name: 'We accept undocumented foreign nationals', type: "citizenship",serviceHeading: heading_demographics},
    {id: 24, name: 'English-speaking', type: "language",serviceHeading: heading_demographics},
    {id: 25, name: 'Limited English-speaking ability', type: "language",serviceHeading: heading_demographics},
    {id: 26, name: 'No English-speaking ability', type: "language",serviceHeading: heading_demographics},
    {id: 27, name: 'Sex Trafficking', type: 'trafficking _status', serviceHeading: heading_eligibility},
    {id: 28, name: 'Labor Trafficking', type: 'trafficking _status', serviceHeading: heading_eligibility},
    {id: 29, name: 'Prostitution', type: 'trafficking _status', serviceHeading: heading_eligibility},
    {id: 30, name: 'Survival Sex', type: 'trafficking _status', serviceHeading: heading_eligibility},
    {id: 31, name: 'Other forms of commercial sex', type: 'trafficking _status', serviceHeading: heading_eligibility},
    {id: 32, name: 'have an abuser actively looking for them', type: 'legal', serviceHeading: heading_eligibility},
    {id: 33, name: 'have outstanding warrants or legal obligations', type: 'legal', serviceHeading: heading_eligibility},
    {id: 34, name: 'are involved in open or pending investigations or cases', type: 'legal', serviceHeading: heading_eligibility},
    {id: 35, name: 'are currently incarcerated', type: 'legal', serviceHeading: heading_eligibility},
    {id: 36, name: 'were recently incarcerated', type: 'legal', serviceHeading: heading_eligibility},
    {id: 37, name: 'will be on parole or probation', type: 'legal', serviceHeading: heading_eligibility},
    {id: 38, name: 'are part of a diversion program with court requirements', type: 'legal', serviceHeading: heading_eligibility},
    {id: 39, name: 'have a history of criminal charges', type: 'legal', serviceHeading: heading_eligibility},
    {id: 40, name: 'are registered sex offenders', type: 'legal', serviceHeading: heading_eligibility},
    {id: 41, name: 'are currently taking prescribed medication for mental illness', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 42, name: 'are currently taking prescribed medication for opioid treatment', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 43, name: 'experience episodes of psychosis', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 44, name: 'have a certified service animal', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 45, name: 'have an emotional support animal', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 46, name: 'have immediate health concerns', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 47, name: 'have physical disabilities', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 48, name: 'have reported self-injuring', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 49, name: 'have reported suicide ideation', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 50, name: 'have used illegal substances in the last 30 days', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 51, name: 'have used illegal substances in the last 7 days', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 52, name: 'use alcohol', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 53, name: 'use marijuana', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 54, name: 'use tobacco products', type: 'health_needs', serviceHeading: heading_eligibility},
    {id: 55, name: 'Not taking any medications', type: 'medications', serviceHeading: heading_eligibility},
    {id: 56, name: 'Stimulants (Adderall, Ritalin, Vyvanse, etc)', type: 'medications', serviceHeading: heading_eligibility},
    {id: 57, name: 'Mood Stabilizers (Lithium, Abilify, Saphris, Vraylar, etc)', type: 'medications', serviceHeading: heading_eligibility},
    {id: 58, name: 'Antipsychotic (Risperdal, Seroquel, Ziprasidone, etc)', type: 'medications', serviceHeading: heading_eligibility},
    {id: 59, name: 'Injectables (insulin, etc)', type: 'medications', serviceHeading: heading_eligibility},
    {id: 60, name: 'Anti-Anxiety (Xanax, Klonopin, Valium, Ativan, etc)', type: 'medications', serviceHeading: heading_eligibility},
    {id: 61, name: 'Anti-Depressants/SSRI’s (Prozac, Seroxat, Lustral, Cipramil, etc)', type: 'medications', serviceHeading: heading_eligibility},
    {id: 62, name: 'Methadone', type: 'medications', serviceHeading: heading_eligibility},
    {id: 63, name: 'Suboxone', type: 'medications', serviceHeading: heading_eligibility},
    {id: 64, name: 'Narcotics (Vicodin, OxyContin, Percocet)', type: 'medications', serviceHeading: heading_eligibility},
    {id: 65, name: 'Nerve Pain/Anticonvulsant (Gabapentin, Lyrica)', type: 'medications', serviceHeading: heading_eligibility},
    {id: 66, name: 'Medical Marijuana', type: 'medications', serviceHeading: heading_eligibility},
    {id: 67, name: 'Other', type: 'medications', serviceHeading: heading_eligibility},
    {id: 68, name: 'Anxiety', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 69, name: 'Bipolar', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 70, name: 'Borderline Personality Disorder', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 71, name: 'PTSD', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 72, name: 'Depression', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 73, name: 'Dissociative Identity Disorder', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 74, name: 'Schizophrenia', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 75, name: 'Self-injuring', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 76, name: 'Suicide ideation/Suicide Risk', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 77, name: 'Eating Disorder', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 78, name: 'None', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 79, name: 'Other (fill in option)', type: 'mental_health_diagnoses', serviceHeading: heading_eligibility},
    {id: 80, name: 'Wheelchair accessibility', type: 'physical_accommodations', serviceHeading: heading_eligibility},
    {id: 81, name: 'Ramp access', type: 'physical_accommodations', serviceHeading: heading_eligibility},
    {id: 82, name: 'Assistance with mobility (e.g., walking, getting to/from locations)', type: 'physical_accommodations', serviceHeading: heading_eligibility},
    {id: 83, name: 'Visual assistance (e.g., large print, screen reader support)', type: 'physical_accommodations', serviceHeading: heading_eligibility},
    {id: 84, name: 'Hearing assistance (e.g., sign language interpreter, hearing loop)', type: 'physical_accommodations', serviceHeading: heading_eligibility},
    {id: 85, name: 'Seating with support (e.g., back support, specific seating arrangement)', type: 'physical_accommodations', serviceHeading: heading_eligibility},
    {id: 86, name: 'Specialized equipment (e.g., adjustable tables, assistive technology)', type: 'physical_accommodations', serviceHeading: heading_eligibility},
    {id: 87, name: 'None', type: 'physical_accommodations', serviceHeading: heading_eligibility},
    {id: 88, name: 'Cigarettes', type: 'smoking_allowed', serviceHeading: heading_eligibility},
    {id: 89, name: 'Recreational Marijuana', type: 'smoking_allowed', serviceHeading: heading_eligibility},
    {id: 90, name: 'Vapes', type: 'smoking_allowed', serviceHeading: heading_eligibility},
    {id: 91, name: 'None', type: 'smoking_allowed', serviceHeading: heading_eligibility},
    {id: 92, name: 'Verified as a victim/survivor of human trafficking', type: 'entry_requirements', serviceHeading: heading_eligibility},
    {id: 93, name: 'Must be clean/sober for a certain number of days', type: 'entry_requirements', serviceHeading: heading_eligibility},
    {id: 94, name: 'Must have a clean Urine Analysis (U/A)', type: 'entry_requirements', serviceHeading: heading_eligibility},
    {id: 95, name: 'None of the above', type: 'entry_requirements', serviceHeading: heading_eligibility},
    {id: 96, name: 'Person-Centered/Individualized', type: 'service_model', serviceHeading: heading_service_model},
    {id: 97, name: 'Survivor-Informed', type: 'service_model', serviceHeading: heading_service_model},
    {id: 98, name: 'Program-Centered/curriculum-based', type: 'service_model', serviceHeading: heading_service_model},
    {id: 99, name: 'Faith-based', type: 'service_model', serviceHeading: heading_service_model},
    {id: 100, name: 'Trauma-Informed', type: 'service_model', serviceHeading: heading_service_model},
    {id: 101, name: 'Clean and sober', type: 'service_model', serviceHeading: heading_service_model},
    {id: 102, name: 'Evidence-Based', type: 'service_model', serviceHeading: heading_service_model},
    {id: 103, name: 'Harm Reduction', type: 'service_model', serviceHeading: heading_service_model},
    {id: 104, name: 'Strengths-Based', type: 'service_model', serviceHeading: heading_service_model},
    {id: 105, name: 'Recovery-Focused', type: 'service_model', serviceHeading: heading_service_model},
    {id: 106, name: 'Survivor-Led', type: 'service_model', serviceHeading: heading_service_model},
    {id: 107, name: 'None', type: 'faith_engagement', serviceHeading: heading_service_model},
    {id: 108, name: 'Voluntary', type: 'faith_engagement', serviceHeading: heading_service_model},
    {id: 109, name: 'Expected attendance, but not mandatory participation', type: 'faith_engagement', serviceHeading: heading_service_model},
    {id: 110, name: 'Mandatory participation', type: 'faith_engagement', serviceHeading: heading_service_model},
    {id: 111, name: 'High structure (very limited free time)', type: 'service_structure', serviceHeading: heading_service_model},
    {id: 112, name: 'Moderate structure (some free time)', type: 'service_structure', serviceHeading: heading_service_model},
    {id: 113, name: 'Low structure (majority free time)', type: 'service_structure', serviceHeading: heading_service_model},
    {id: 114, name: 'Independent housing (live alone)', type: 'sleeping_arrangement', serviceHeading: heading_service_model},
    {id: 115, name: 'Shared housing (private bedrooms)', type: 'sleeping_arrangement', serviceHeading: heading_service_model},
    {id: 116, name: 'Shared housing (shared bedrooms)', type: 'sleeping_arrangement', serviceHeading: heading_service_model},
    {id: 117, name: '24/7 staffing', type: 'staffing_level', serviceHeading: heading_service_model},
    {id: 118, name: 'Staff on-site sometimes', type: 'staffing_level', serviceHeading: heading_service_model},
    {id: 119, name: 'No staff on-site', type: 'staffing_level', serviceHeading: heading_service_model},
    {id: 120, name: 'Survivor(s) or Lived Experience Experts from the Commercial Sex Trade', type: 'team_diversity', serviceHeading: heading_service_model},
    {id: 121, name: 'Bilingual or Multilingual', type: 'team_diversity', serviceHeading: heading_service_model},
    {id: 122, name: 'Black, Indigenous, or People of Color', type: 'team_diversity', serviceHeading: heading_service_model},
    {id: 123, name: 'Gender and sexual minorities', type: 'team_diversity', serviceHeading: heading_service_model},
    {id: 124, name: 'People with disabilities', type: 'team_diversity', serviceHeading: heading_service_model},
    {id: 125, name: 'Religious minorities', type: 'team_diversity', serviceHeading: heading_service_model},
    {id: 126, name: 'Daily curfew (must be in by a certain time each night)', type: 'service_guidelines', serviceHeading: heading_service_model},
    {id: 127, name: 'Initial blackout period (no phone, no Internet, etc)', type: 'service_guidelines', serviceHeading: heading_service_model},
    {id: 128, name: 'No unapproved visitors', type: 'service_guidelines', serviceHeading: heading_service_model},
    {id: 129, name: 'None of the above', type: 'service_guidelines', serviceHeading: heading_service_model},
    {id: 130, name: 'Case Management', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 131, name: 'Education', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 132, name: 'Employment Placement', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 133, name: 'Employment Preparation', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 134, name: 'Equine/Animal Therapy', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 135, name: 'Financial Assistance', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 136, name: 'Food/Groceries', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 137, name: 'Goal-planning', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 138, name: 'Housing advocacy/navigation', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 139, name: 'Hygiene Supplies', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 140, name: 'Immigration Support', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 141, name: 'Information and Referral', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 142, name: 'Life Coaching', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 143, name: 'Life Skills', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 144, name: 'Medical Consultation', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 145, name: 'Medical Service', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 146, name: 'Mental Health Counseling/Trauma therapy (licensed)', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 147, name: 'Mentorship', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 148, name: 'Personal Advocacy', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 149, name: 'Personal ID & Documentation Support', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 150, name: 'Substance Use Services (licensed)', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 151, name: 'Support Groups', type: 'support_provided', serviceHeading: heading_offerings},
    {id: 152, name: 'Case Management', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 153, name: 'Education', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 154, name: 'Employment Placement', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 155, name: 'Employment Preparation', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 156, name: 'Equine/Animal Therapy', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 157, name: 'Financial Assistance', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 158, name: 'Food/Groceries', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 159, name: 'Housing advocacy/navigation', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 160, name: 'Immigration Support', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 161, name: 'Life Coaching', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 162, name: 'Life Skills', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 163, name: 'Medical Consultation', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 164, name: 'Medical Service', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 165, name: 'Mental Health Counseling/Trauma therapy (licensed)', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 166, name: 'Mentorship', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 167, name: 'Personal ID & Documentation Support', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 168, name: 'Substance Use Services (licensed)', type: 'support_offered', serviceHeading: heading_offerings},
    {id: 169, name: 'Support Groups', type: 'support_offered', serviceHeading: heading_offerings},
];
const advocate_service: AdvocateService[] = [
    {id: 1, name: 'Fluent', type: 'speaking_ability'},
    {id: 2, name: 'Limited', type: 'speaking_ability'},
    {id: 3, name: 'None', type: 'speaking_ability'},
    {id: 4, name: 'Asian (Far East, Southeast Asia, or the Indian subcontinent. India, China, the Philippine Islands, Japan, Korea, or Vietnam, Asian Indian, Chinese, Filipino, Korean, Japanese, Vietnamese, Other Asian, Pakistani, Cambodian, Hmong, Thai, Bengali, Mien, etc.)', type: 'race_ethinicity'},
    {id: 5, name: 'Native Hawaiian and Other Pacific Islander (Hawaii, Guam, Samoa, Pacific Islands, Native Hawaiian, Chamorro, Samoan, Other Pacific Islander, Pacific Islander, Palauan, Tahitian, Chuukese, Pohnpeian, Saipanese, Yapese, etc.)', type: 'race_ethinicity'},
    {id: 6, name: 'American Indian and Alaska Native (North and South America, race as "American Indian or Alaska Native", Navajo Nation, Blackfeet Tribe, Mayan, Aztec, Native Village of Barrow Inupiat, or Nome Eskimo Community.)', type: 'race_ethinicity'},
    {id: 7, name: 'Black or African American (Black racial groups of Africa. Such as African American, Jamaican, Haitian, Nigerian, Ethiopian, or Somali, Ghanaian, South African, Barbadian, Kenyan, Liberian, Bahamian, etc.)', type: 'race_ethinicity'},
    {id: 8, name: 'White (Europe, the Middle East, or North Africa, German, Irish, English, Italian, Lebanese, Egyptian, Polish, French, Iranian, Slavic, Cajun, Chaldean, etc.)', type: 'race_ethinicity'},
    {id: 9, name: 'prefer(s) not to say', type: 'race_ethinicity'},
    {id: 10, name: 'US Citizen', type: 'citizenship_status'},
    {id: 11, name: 'Documented foreign national', type: 'citizenship_status'},
    {id: 12, name: 'Undocumented foreign national', type: 'citizenship_status'},
    {id: 13, name: 'Emancipated', type: 'birthdate_status'},
    {id: 14, name: 'Ward of the State', type: 'birthdate_status'},
    {id: 15, name: 'About to age-out', type: 'birthdate_status'},
    {id: 16, name: 'Parent or guardian consent', type: 'birthdate_status'},
    {id: 17, name: 'Determination in Process', type: 'birthdate_status'},
];
const registration_option: RegistrationOption[] = [
    {id: 1, name: 'Victim Service Provider', type: 'primary_purpose'},
    {id: 2, name: 'Homelessness Service Provider', type: 'primary_purpose'},
    {id: 3, name: 'Sexual Assault Service Provider', type: 'primary_purpose'},
    {id: 4, name: 'Domestic Violence Service Provider', type: 'primary_purpose'},
    {id: 5, name: 'Runaway-Homeless Youth Provider', type: 'primary_purpose'},
    {id: 6, name: 'Mental-Health Provider', type: 'primary_purpose'},
    {id: 7, name: 'Substance Use Disorder Service Provider', type: 'primary_purpose'},
    {id: 8, name: 'Medical Service Provider', type: 'primary_purpose'},
    {id: 9, name: 'Educational or Vocational Training Provider', type: 'primary_purpose'},
    {id: 10, name: 'Legal Advocacy Provider', type: 'primary_purpose'},
    {id: 11, name: 'Information and Referral Provider', type: 'primary_purpose'},
    {id: 12, name: 'Other', type: 'primary_purpose'},
    {id: 13, name: 'Provide services for survivors of human trafficking', type: 'platform_purpose'},
    {id: 14, name: 'Seek services for survivors of human trafficking', type: 'platform_purpose'},
    {id: 15, name: 'Atlas Free Network', type: 'affiliations_licenses'},
    {id: 16, name: 'Evangelical Council for Financial Accountability (ECFA) Accredited', type: 'affiliations_licenses'},
    {id: 17, name: 'Better Business Bureau (BBB) Accredited', type: 'affiliations_licenses'},
    {id: 18, name: 'Office for Victims of Crime grantee', type: 'affiliations_licenses'},
    {id: 19, name: 'Office for Violence Against Women grantee', type: 'affiliations_licenses'},
    {id: 20, name: 'VOCA grantee', type: 'affiliations_licenses'},
    {id: 21, name: 'Licensed to provide residential care to minors', type: 'affiliations_licenses'},
    {id: 22, name: 'Other (should be able to add multiple others while we get more intel on possible affiliations)', type: 'affiliations_licenses'},
];

async function seedRoles() {
    await new Promise<void>((resolve, reject) => {
        connection.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
            if (err) {
                console.error('Error disabling foreign key checks:', err);
                reject(err);
                return;
            }
        })
        connection.query('TRUNCATE TABLE user_role', (err) => {
            if (err) {
                console.error('Error truncating user_role table:', err);
                reject(err);
                return;
            }
            console.log('user_role table truncated');
            resolve();
        });
        connection.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
            if (err) {
                console.error('Error disabling foreign key checks:', err);
                reject(err);
                return;
            }
        })
    });
    for (const data of roles) {
        const query = 'INSERT INTO user_role (id, name) VALUES (?, ?)';
        await new Promise<void>((resolve, reject) => {
            connection.query(query, [data.id, data.name], (err) => {
                if (err) {
                    console.error('Error inserting role data:', err);
                    reject(err);
                    return;
                }
                console.log('Data inserted:', data.id);
                resolve();
            });
        });
    }
}

async function seedUsers() {
    for (const user of users_data) {
        try {
            // Hash the password before inserting
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const query = `
                INSERT INTO users 
                (id, email, is_active, is_status, is_profile, password, role_id, emailVerifiedAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [
                user.id,
                user.email,
                user.is_active,
                user.is_status,
                user.is_profile,
                hashedPassword,
                user.role,
                new Date()
            ];

            await new Promise<void>((resolve, reject) => {
                connection.query(query, values, (err) => {
                    if (err) {
                        console.error('Error inserting user data:', err);
                        reject(err);
                        return;
                    }
                    console.log('User data inserted:', user.email);
                    resolve();
                });
            });
        } catch (error) {
            console.error('Error hashing password:', error);
        }
    }
}

async function seedAdvocateServices() {
    await new Promise<void>((resolve, reject) => {
        connection.query('TRUNCATE TABLE advocate_service', (err) => {
            if (err) {
                console.error('Error truncating advocate_service table:', err);
                reject(err);
                return;
            }
            console.log('advocate_service table truncated');
            resolve();
        });
    });
    for (const data of advocate_service) {
        const query = 'INSERT INTO advocate_service (id, name, type) VALUES (?, ?, ?)';
        await new Promise<void>((resolve, reject) => {
            connection.query(query, [data.id, data.name, data.type], (err) => {
                if (err) {
                    console.error('Error inserting Advocate service data:', err);
                    reject(err);
                    return;
                }
                console.log('Data inserted:', data.id);
                resolve();
            });
        });
    }
}

async function seedRegistrationOption() {
    await new Promise<void>((resolve, reject) => {
        connection.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
            if (err) {
                console.error('Error disabling foreign key checks:', err);
                reject(err);
                return;
            }
        })
        connection.query('TRUNCATE TABLE registration_option', (err) => {
            if (err) {
                console.error('Error truncating registration_option table:', err);
                reject(err);
                return;
            }
            console.log('registration_option table truncated');
            resolve();
        });
        connection.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
            if (err) {
                console.error('Error disabling foreign key checks:', err);
                reject(err);
                return;
            }
        })
    });
    for (const data of registration_option) {
        const query = 'INSERT INTO registration_option (id, name, type) VALUES (?, ?, ?)';
        await new Promise<void>((resolve, reject) => {
            connection.query(query, [data.id, data.name, data.type], (err) => {
                if (err) {
                    console.error('Error inserting Registration Option data:', err);
                    reject(err);
                    return;
                }
                console.log('Data inserted:', data.id);
                resolve();
            });
        });
    }
}

async function seedServiceTypes() {
    await new Promise<void>((resolve, reject) => {
        connection.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
            if (err) {
                console.error('Error disabling foreign key checks:', err);
                reject(err);
                return;
            }
        })
        connection.query('TRUNCATE TABLE service_headings', (err) => {
            if (err) {
                console.error('Error truncating service_headings table:', err);
                reject(err);
                return;
            }
            console.log('service_headings table truncated');
            resolve();
        });
        connection.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
            if (err) {
                console.error('Error disabling foreign key checks:', err);
                reject(err);
                return;
            }
        })
    });
    for (const data of service_headings) {
        const query = 'INSERT INTO service_headings (id, name) VALUES (?, ?)';
        await new Promise<void>((resolve, reject) => {
            connection.query(query, [data.id, data.name], (err) => {
                if (err) {
                    console.error('Error inserting Service heading:', err);
                    reject(err);
                    return;
                }
                console.log('Data inserted:', data.id);
                resolve();
            });
        });
    }
}

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
        const query = 'INSERT INTO service_details_options (id, name, type, serviceHeadingId) VALUES (?, ?, ?, ?)';
        await new Promise<void>((resolve, reject) => {
            connection.query(query, [data.id, data.name, data.type, data.serviceHeading.id], (err) => {
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

    seedRoles()
        .then(seedUsers)
        .then(seedServiceTypes)
        .then(seedGeneralDetails)
        .then(seedAdvocateServices)
        .then(seedRegistrationOption)
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
