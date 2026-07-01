```text
When a user fills out the survey for a client or survivor, we will use the answers to pre-filter the search results when searching for a service. These changes will apply to the flows for both the Survivor and the Org Admin/Advocate doing a service search. When the user gets to the service search screen, we will filter out (hide) any services that do not match based on the user's answers to the following survey questions.


NOTE:

    When I refer to the "Service", I am referring to the question filled out by a Service Manager when adding the details for a service
    When I refer to the "Survey", I am referring to the survey question filled out by either a Survivor or Advocate
    When I refer to "Result", I am referring the the intended outcome and conditions for the pre-filter
    The questions and answers for the Service and Survey mentioned below will be used to determine the conditions for the pre-filtering Result during the service search


1) Age/DOB

Service: "Demographics / Users Served" > "What is the minimum age you serve?" AND "What is the maximum age you serve?"

    Use the minimum and maximum age to determine the range. The minimum and maximum numbers will be included in the range (e.g. 1 >= X <= 10)

Survey: "Date of Birth"

    Use the DOB to calculate the user's age and use that number in the pre-filter

Result:

    If user's DOB is within the range of the Service, then user CAN see that service in the search results (e.g Min = 20, Max = 40, DOB/Age = 31)
    If user's age is outside of the range, then the user CANNOT see that service (e.g Min = 20, Max = 40, DOB/Age = 41)


2) Gender

Service: "Demographics / Users Served" > "Genders Served (select all that apply)"

    User chooses one or more of the answers

Survey: "Gender/Sex"

    User chooses one or more of the answers

Result:

    If the Survey answer matches at least one of the Service answers, then the user CAN see that service (e.g. Service and Survey both answer "Female").
    If the Survey answer does not contain a match with the Service answer, then the user CANNOT see that service (e.g. Service answers "Female" and "Male", but Survey answers only "Non-Binary")


3) Pregnancy

Service: "Demographics / Users Served" > "Who do you serve? (select all that apply)"

    Use the answer "Pregnant Individuals" to determine if the Service supports a pregnant person

Survey: "Are you pregnant?"

    Use the answer of "Yes" or "No" to determine if the user is pregnant

Result:

    If the Service selects the answer "Pregnant Individuals", AND the Survey answers "Yes" to being pregnant, then the user CAN see that service
    If the Service selects the answer "Pregnant Individuals", AND the Survey answers "No" to being pregnant, then the user still CAN see that service
    If the Service does NOT select the answer "Pregnant Individuals", AND the Survey answers "Yes" to being pregnant, then the user CANNOT see that service


4) Children

Service: "Demographics / Users Served" > "Who do you serve? (select all that apply)"

    Use the answers "Parenting Individuals" and "Parenting Couples" to determine if the Service accepts children

Survey: "Do you have children that must accompany you?"

    Use the answer "Yes" to determine if the user must have their children with them in the service

Result:

    If the Service selects EITHER "Parenting Individuals" OR "Parenting Couples", AND the Survey answers "Yes" to having children, then the user CAN see the service
    If the Service selects EITHER "Parenting Individuals" OR "Parenting Couples", AND the Survey answers "No" OR "Preferred" to having children, then the user still CAN see the service
    If the Service does NOT select EITHER "Parenting Individuals" OR "Parenting Couples", AND the Survey answers "Yes" to having children, then the user CANNOT see the service


5) Language

Service: "Demographics / Users Served" > "Does your service allow individuals with: (select all that apply)"

    Use the answers to determine if the Service can support non-English speaking individuals

Survey: "What is your english speaking ability?"

    Use the answer to determine the user's English speaking ability

Result:

    If the Service selects "English-speaking" AND the Survey answers "Fluent", then the user CAN see the service
    If the Service selects "Limited English-speaking ability" AND the Survey answers "Limited", then the user CAN see the service
    If the Service selects "No English-speaking ability" AND the Survey answers "None", then the user CAN see the service
    If the Service does NOT select an answer that matches with the Survey answer, then the user CANNOT see the service (e.g. Service answers "English-speaking" and "Limited English-speaking ability", but Survey answers "None")


6) Medications

Service: "Eligibility" > "This service may be available for those who are using the following medications:"

    Use the answers in this section to match with the Survey answers
    Ignore the answers "Not taking any medications" and "Other", these will not affect the pre-filter

Survey: "Medications"

    Use the answers in this section to match with the Service answers
    Ignore the answers "Not taking any medications" and "Other", these will not affect the pre-filter

Result:

    If at least one Service answer matches with at least one Survey answer, then the user CAN see the service (e.g. Service answers "Suboxone" and "Methadone", and Survey answers "Suboxone")
    If none of the Service answers match with any of the Survey answers, then the user CANNOT see the service (e.g. Service answers "Suboxone" and "Methadone", but Survey answers only "Narcotics")


5) Mental Health

Service: "Eligibility" > "This service may be available for those who have been diagnosed with:"

    Use the answers in this section to match with the Survey answers
    Ignore the answers "None" and "Other", these will not affect the pre-filter

Survey: "Mental Health Diagnoses"

    Use the answers in this section to match with the Service answers
    Ignore the answers "None" and "Other", these will not affect the pre-filter

Result:

    If at least one Service answer matches with at least one Survey answer, then the user CAN see the service (e.g. Service answers "Anxiety" and "Depression", and Survey answers "Depression")
    If none of the Service answers match with any of the Survey answers, then the user CANNOT see the service (e.g. Service answers "Anxiety" and "Depression", but Survey answers only "PTSD")


6) Physical Accommodations

Service: "Eligibility" > "This service can offer the following physical accommodations:"

    Use the answers in this section to match with the Survey answers
    Ignore the answers "None" and "Other", these will not affect the pre-filter

Survey: "Physical Accommodations"

    Use the answers in this section to match with the Service answers
    Ignore the answers "None" and "Other", these will not affect the pre-filter

Result:

    If at least one Service answer matches with at least one Survey answer, then the user CAN see the service (e.g. Service answers "Wheelchair accessibility" and "Ramp access", and Survey answers "Ramp access")
    If none of the Service answers match with any of the Survey answers, then the user CANNOT see the service (e.g. Service answers "Wheelchair accessibility" and "Ramp access", but Survey answers only "Service animal")

```