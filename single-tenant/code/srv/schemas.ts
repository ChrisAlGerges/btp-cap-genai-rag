import { z } from "zod";

// Set default working language of user 
// Can be stored/defined dynamically in a future release
export const WORKING_LANGUAGE = "Dutch";

// Custom Schema for Language Determination
export const MAIL_LANGUAGE_SCHEMA = z.object({
    languageNameDetermined: z
        .string()
        .describe("Determine the language in the email. Return a full name of the language."),
    languageMatch: z
        .boolean()
        .describe(
            "If the email body is written in " + WORKING_LANGUAGE + ", then return 'true', otherwise return 'false'"
        )
}).describe(`You are supporting a webshop selling meal boxes that receives emails from customers and vendors. 
             Your task is to determine the language of the email in order to trigger translation if needed.`);

// Custom Schema for Mail Insights extraction
export const MAIL_INSIGHTS_SCHEMA = z.object({
    category: z.string().describe(`Classify the email into one the following categories:
        - Order Assistance - if the email is asking for help in the process of ordering a meal box,
        - Cancellation or Change - if the email is referring to an existing meal order and asks for the order to be changed or canceled,
        - Unexpected Problem - if the email indicates an urgent problem with the delivery of meals or ingredients,
        - Feedback - if the email is related to a previous meal order and expresses any sort of constructive positive or negative feedback or complaint,
        - Procurement - if the email is related to the procurement of ingredients
        - Post-Order Complaint - if the email is describing any complaint regaring the meal boxes
        - Special Requests - if the email is requesting something outside the offerings of the webshop
        - General Inquiry - all other emails
        `),
    sender: z
        .string()
        .describe(
            'Extract the name of the customer or vendor from the mail body as the name of the sender. If not found, return "X"'
        ),
    sentiment: z
        .number()
        .transform((number) => Math.round(number))
        .describe(
            "Determine the sentiment of the mail on a scale from -1 (negative) via 0 (neutral) up to 1 (positive) as an integer. "
        ),
    urgency: z
        .number()
        .transform((number) => Math.round(number))
        .describe(
            "What level of urgency does the email express? Give your answer as an integer from 0 (lowest urgency) to 2 (high urgency)."
        ),
    summary: z.string().describe("Summarize the email, use maximum 10 words, in the language of the body."),
    keyFacts: z
        .array(
            z.object({
                fact: z
                    .string()
                    .optional()
                    .describe("fact (for the respective category) which should be unique, maximum 2 words"),
                category: z.string().optional().describe("category of the fact")
            })
        )
        .max(5)
        .describe(`Extract some relevant known facts out of the mail in a structured array, each fact needs a category classifying the fact.
            The categories of the facts can be one of the following:
            - Cuisine - what is the cuisine of the meal
            - people - for how many people can the meal be served
            - Difficulty - how difficult is it to cook the recipe at home
            - Calories - how many calories does the meal contain in total
            `),
    requestedServices: z.array(z.string())
        .describe(`Extract an array of the following services which are referred in the email, it can be multiple.
              - Meal-boxes - if the email is referring to ordering a meal box
              - Ingredients - if the email is referring to the procurement of ingredients
            `),
    suggestedActions: z.array(
        z.object({
            type: z.string().optional().describe("type of the action"),
            value: z.string().optional().describe("value of the action")
        })
    )
        .describe(`Based on the email and the services the email is asking for, which of the following action types and action values do you suggest.
            The following actions are structured like "type of action - value of action - description of action". 
            Only use the values provided in the following list while the result can contain multiple actions:
            - Meal Box - Meal Box Availability - check if requested meal box is available and offer results to sender
            - Meal Box - Meal Box Cancelation - cancel the previously ordered meal box
            - Meal Box - Meal Box Fix - check meal box order and provide information to sender
            - Ingredient - Ingredient Availability - check availability of ingredient stocks and provide results to sender
            - Ingredient - Ingredient Selection - respond to the quotation of the sender
            - Ingredient - Ingredient Receipt - check received ingredients and provide results to sender
            - General - General Fix - if any other action is required
        `)
}).describe(`You are supporting a webshop selling meal boxes which receives emails from customers ordering meals that they can cook by themselves.
    The webshop offers meals from multiple cuisines, such as Spanish, Frensh, Italian, Chinese, Japanese or Indian.
    The webshop also offers meals in many varieties, for instance vegetarian meals, taking into account all possible preferences and allergies.
    On top of that, the meals can vary in amount of calories, difficulty to cook or the number of people that the meal can be served.
    Besides customers, the webshop also receives emails from vendors delivering the necessary ingredients for those meals.
    The ingredients for the meals are packaged in exact amount for a specific dish, minimizing food waste and packaging waste.
    Your task is to extract relevant insights out of the emails. Extract the information out of the email subject and body and return a clean and valid JSON format.`);

// Custom Schema for Mail Insights Translation
export const MAIL_INSIGHTS_TRANSLATION_SCHEMA = z.object({
    subject: z.string(),
    body: z.string(),
    sender: z.string(),
    summary: z.string(),
    keyFacts: z.array(
        z.object({
            fact: z.string().optional(),
            category: z.string().optional().nullable()
        })
    ),
    requestedServices: z.array(z.string()),
    responseBody: z.string().transform((responseBody) => responseBody.replace(/\\\\n/g, "\n"))
}).describe(`You are supporting a webshop selling meal boxes which receives emails from customers and vendors requesting help or information. 
      Your task is to translate the values for this schema into ${WORKING_LANGUAGE}. Return a clean and valid JSON format`);

// Custom Schema for Mail Response Translation
export const MAIL_RESPONSE_TRANSLATION_SCHEMA = z.object({
    responseBody: z.string().transform((responseBody) => responseBody.replace(/\\\\n/g, "\n"))
}).describe(`You are supporting a webshop selling meal boxes which receives emails from customers and vendors requesting help or information. 
        Your task is to translate the values for this schema into the explicitly provided language or into 
        ${WORKING_LANGUAGE} if no other language is provided. Return a clean and valid JSON format`);

// Custom Schema for Mail Response Generation
export const MAIL_RESPONSE_SCHEMA = z
    .object({
        responseBody: z.string().transform((responseBody) => responseBody.replace(/\\\\n/g, "\n"))
            .describe(`Formulate a response to the mail acting as customer service or vendor service, include the additional information given in this text.
                Formulate the response in the same language as the original. The signature of the response will be "Your HappyMeals Team".`)
    })
    .describe(
        `You are working on an incoming mail addressing a webshop selling meal boxes. Formulate a response. Return a clean and valid JSON format.`
    );
