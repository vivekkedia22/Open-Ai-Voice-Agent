// import Fastify from 'fastify';
// import WebSocket from 'ws';
// import dotenv from 'dotenv';
// import fastifyFormBody from '@fastify/formbody';
// import fastifyWs from '@fastify/websocket';
// import {  fileSearchTool } from '@openai/agents';
// // Load environment variables from .env file
// dotenv.config();

// // Retrieve the OpenAI API key from environment variables.
// const { OPENAI_API_KEY } = process.env;

// if (!OPENAI_API_KEY) {
//     console.error('Missing OpenAI API key. Please set it in the .env file.');
//     process.exit(1);
// }

// // Initialize Fastify
// const fastify = Fastify();
// fastify.register(fastifyFormBody);
// fastify.register(fastifyWs);

// // Constants
// const SYSTEM_MESSAGE = `You are विपिन, a male, Hindi-first AI voice sales agent calling on behalf of InCred Money.

// ROLE & PURPOSE:
// You are an expert in Digital Gold and Digital Silver investing.
// You are always aware of general market trends.
// You are calling leads who have already registered with InCred Money.
// Your goal is to spark interest in Digital Gold or Silver, explain clearly, handle objections smoothly, and — if the user agrees — send app download and investment details to their registered email.

// LANGUAGE RULES (STRICT):
// - Start every conversation in Hindi by default.
// - Use a natural Hindi-English mix (Hinglish).
// - Match the user’s language (Hindi, English, or Mix).
// - Switch fully to English ONLY if the user explicitly requests English.
// - English words must be spoken in English, Hindi words in Hindi.
// - Never switch languages without user request.

// PERSONA & TONE:
// You sound like a warm, trustworthy Indian wealth guide.
// Your voice is calm, friendly, confident, and helpful.
// You are never pushy or aggressive.
// You explain money using simple examples and everyday language.
// Every line should feel supportive and human — never scripted or robotic.
// You build gentle urgency naturally (example: “gold rate upar ja raha hai sir… chhota sa start best hota hai”).

// HUMAN CONVERSATION RULES:
// - Ask one question at a time.
// - Keep replies to a maximum of 2 sentences (rarely 3).
// - Use light acknowledgments: “Got it”, “Okay”, “Right”, “Samajh gaya”.
// - Mirror the user’s tone and emotion.
// - Add light natural pauses like “ek second…”, “achha…”.
// - Never repeat the same sentence — always reframe.
// - If silence > 3 seconds, ask: “Hello, are you there?”
// - If unsure, say you will confirm with an expert.
// - Use the customer’s name sparingly: once in greeting, once naturally, once in closing.

// VOICE & READING RULES:
// - Never read like a script.
// - Do not omit spaces around dashes when speaking.
// - Write and speak symbols as words:
//   rupees, percent, at, dot, etc.
// - Numbers:
//   - Full numbers: normalize (two thousand and twenty five)
//   - Decimals: digit by digit (nine point seven six)
//   - Phone numbers: read in grouped digits with pauses
// - Spell names and emails in groups of three letters.
// - Read dates clearly in spoken format.

// GUARDRAILS (MANDATORY):
// - Never ask for the user’s email — it is already available.
// - Ask before sending any link or email.
// - Never promise guaranteed or fixed returns.
// - Never pitch mutual funds or unlisted shares directly.
// - Suggest expert connection only if the user shows interest.
// - No personal, unverifiable, or false information.
// - Close politely every time.

// OPENING SCRIPT (MANDATORY):
// “नमस्ते {{Name}}, मैं विपिन बोल रहा हूँ InCred Money से।
// आपने हमारी website पर register किया था, उसी related आपको call किया है।”

// CONVERSATION FLOW (STRICT):

// STEP 1 — GREETING
// - Greet warmly
// - Give call context
// - Stop and let the user speak

// STEP 2 — SALES HOOK / PITCH
// - Introduce Digital Gold / Silver
// - Mention starting from ten rupees
// - Ask permission to explain further

// STEP 3 — HOW TO INVEST
// - Explain app flow simply
// - Mention SIP options (daily / weekly)
// - Spell app name clearly: I - N - C - R - E - D  M - O - N - E - Y
// - Ask permission to send app details on email

// STEP 4 — CTA / EMAIL
// - Send app link ONLY after user agrees
// - Do not ask for email
// - If user declines, respect and move to closure

// STEP 5 — CLOSURE (MANDATORY BEFORE END):
// “Thank you {{Name}}… agar koi aur help chahiye ho toh call kar sakte hain… aapka din shubh ho.”

// PRODUCT FACTS (USE WHEN RELEVANT):
// - Digital Gold is real 24K physical gold stored securely
// - Stored with government-approved, SEBI-regulated vault partners
// - Partner: Augmont
// - Insured, transparent, buy/sell anytime
// - Trusted by one lakh plus customers
// - Minimum investment: ten rupees
// - Maximum: approx two lakh rupees

// BENEFITS (MENTION MAX TWO ONLY IF ASKED):
// - Fractional investing
// - SIP micro-saving
// - No storage worries
// - High liquidity
// - Long-term tax efficiency (after three years)

// OBJECTION HANDLING:
// - Not interested → remind registration + small start + exit anytime
// - Risk concern → explain real gold backing & vault storage
// - Market crash → explain long-term store of value, no prediction
// - Busy → offer email + callback
// - Trust issues → SEBI compliance + regulated platform
// - ETF vs Digital Gold → digital gold = real gold, ETF = paper product

// ESCALATION:
// - If unsure → promise expert follow-up
// - If angry and asks not to call again → confirm DND politely

// AI DISCLOSURE:
// If asked:
// “Yes sir, main InCred Money ka AI agent hoon, aur main aapki madad kar sakta hoon digital gold aur silver investment mein.”
// `;
// const VOICE = 'shimmer';
// const TEMPERATURE = 0.8; // Controls the randomness of the AI's responses
// const PORT = process.env.PORT || 3002; // Allow dynamic port assignment

// // List of Event Types to log to the console. See the OpenAI Realtime API Documentation: https://platform.openai.com/docs/api-reference/realtime
// const LOG_EVENT_TYPES = [
//     'error',
//     'response.content.done',
//     'rate_limits.updated',
//     'response.done',
//     'input_audio_buffer.committed',
//     'input_audio_buffer.speech_stopped',
//     'input_audio_buffer.speech_started',
//     'session.created',
//     'session.updated'
// ];

// // Show AI response elapsed timing calculations
// const SHOW_TIMING_MATH = false;

// // Root Route
// fastify.get('/', async (request, reply) => {
//     reply.send({ message: 'Twilio Media Stream Server is running!' });
// });

// // Route for Twilio to handle incoming calls
// // <Say> punctuation to improve text-to-speech translation
// fastify.all('/twilio', async (request, reply) => {
//     const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
//                           <Response>

//                               <Connect>
//                                   <Stream url="wss://${request.headers.host}/media-stream" />
//                               </Connect>
//                           </Response>`;

//     reply.type('text/xml').send(twimlResponse);
// });

// // WebSocket route for media-stream
// fastify.register(async (fastify) => {
//     fastify.get('/media-stream', { websocket: true }, (connection, req) => {
//         console.log('Client connected');

//         // Connection-specific state
//         let streamSid = null;
//         let latestMediaTimestamp = 0;
//         let lastAssistantItem = null;
//         let markQueue = [];
//         let responseStartTimestampTwilio = null;

//         const session = new RealtimeSession(agent,{
//             transport: 'websocket',
//             model: "gpt-4o-mini-realtime",
//             output_modalities: ["audio"],
//             audio: {
//                 input: { format: { type: 'audio/pcmu' }, turn_detection: { type: "server_vad" } },
//                 output: { format: { type: 'audio/pcmu' }, voice: VOICE },
//             },
//             tools: [
//                 fileSearchTool('vs_6943f9b65ea48191a7ee69f20dc5cb4f')
//             ],
//             instructions: SYSTEM_MESSAGE,
//         },);
//         try {
//             await session.connect({
//               // To get this ephemeral key string, you can run the following command or implement the equivalent on the server side:
//               // curl -s -X POST https://api.openai.com/v1/realtime/client_secrets -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" -d '{"session": {"type": "realtime", "model": "gpt-realtime"}}' | jq .value
//               apiKey: OPENAI_API_KEY,
//             });
//             console.log('You are connected!');
//           } catch (e) {
//             console.error(e);
//           }
//         }
//         // Control initial session with OpenAI

//         // Send initial conversation item if AI talks first
//         const sendInitialConversationItem = () => {
//             const initialConversationItem = {
//                 type: 'conversation.item.create',
//                 item: {
//                     type: 'message',
//                     role: 'user',
//                     content: [
//                         {
//                             type: 'input_text',
//                             text: 'Greet the user with "Hello there! I am an AI voice assistant powered by Twilio and the OpenAI Realtime API. You can ask me for facts, jokes, or anything you can imagine. How can I help you?"'
//                         }
//                     ]
//                 }
//             };

//             if (SHOW_TIMING_MATH) console.log('Sending initial conversation item:', JSON.stringify(initialConversationItem));
//             openAiWs.send(JSON.stringify(initialConversationItem));
//             openAiWs.send(JSON.stringify({ type: 'response.create' }));
//         };

//         // Handle interruption when the caller's speech starts
//         const handleSpeechStartedEvent = () => {
//             if (markQueue.length > 0 && responseStartTimestampTwilio != null) {
//                 const elapsedTime = latestMediaTimestamp - responseStartTimestampTwilio;
//                 if (SHOW_TIMING_MATH) console.log(`Calculating elapsed time for truncation: ${latestMediaTimestamp} - ${responseStartTimestampTwilio} = ${elapsedTime}ms`);

//                 if (lastAssistantItem) {
//                     const truncateEvent = {
//                         type: 'conversation.item.truncate',
//                         item_id: lastAssistantItem,
//                         content_index: 0,
//                         audio_end_ms: elapsedTime
//                     };
//                     if (SHOW_TIMING_MATH) console.log('Sending truncation event:', JSON.stringify(truncateEvent));
//                     openAiWs.send(JSON.stringify(truncateEvent));
//                 }

//                 connection.send(JSON.stringify({
//                     event: 'clear',
//                     streamSid: streamSid
//                 }));

//                 // Reset
//                 markQueue = [];
//                 lastAssistantItem = null;
//                 responseStartTimestampTwilio = null;
//             }
//         };

//         // Send mark messages to Media Streams so we know if and when AI response playback is finished
//         const sendMark = (connection, streamSid) => {
//             if (streamSid) {
//                 const markEvent = {
//                     event: 'mark',
//                     streamSid: streamSid,
//                     mark: { name: 'responsePart' }
//                 };
//                 connection.send(JSON.stringify(markEvent));
//                 markQueue.push('responsePart');
//             }
//         };

//         // Open event for OpenAI WebSocket
//         openAiWs.on('open', () => {
//             console.log('Connected to the OpenAI Realtime API');
//             setTimeout(initializeSession, 100);
//         });

//         // Listen for messages from the OpenAI WebSocket (and send to Twilio if necessary)
//         openAiWs.on('message', (data) => {
//             try {
//                 const response = JSON.parse(data);

//                 if (LOG_EVENT_TYPES.includes(response.type)) {
//                     console.log(`Received event: ${response.type}`, response);
//                 }

//                 if (response.type === 'response.output_audio.delta' && response.delta) {
//                     const audioDelta = {
//                         event: 'media',
//                         streamSid: streamSid,
//                         media: { payload: response.delta }
//                     };
//                     connection.send(JSON.stringify(audioDelta));

//                     // First delta from a new response starts the elapsed time counter
//                     if (!responseStartTimestampTwilio) {
//                         responseStartTimestampTwilio = latestMediaTimestamp;
//                         if (SHOW_TIMING_MATH) console.log(`Setting start timestamp for new response: ${responseStartTimestampTwilio}ms`);
//                     }

//                     if (response.item_id) {
//                         lastAssistantItem = response.item_id;
//                     }

//                     sendMark(connection, streamSid);
//                 }

//                 if (response.type === 'input_audio_buffer.speech_started') {
//                     handleSpeechStartedEvent();
//                 }
//             } catch (error) {
//                 console.error('Error processing OpenAI message:', error, 'Raw message:', data);
//             }
//         });

//         // Handle incoming messages from Twilio
//         connection.on('message', (message) => {
//             try {
//                 const data = JSON.parse(message);

//                 switch (data.event) {
//                     case 'media':
//                         latestMediaTimestamp = data.media.timestamp;
//                         if (SHOW_TIMING_MATH) console.log(`Received media message with timestamp: ${latestMediaTimestamp}ms`);
//                         if (openAiWs.readyState === WebSocket.OPEN) {
//                             const audioAppend = {
//                                 type: 'input_audio_buffer.append',
//                                 audio: data.media.payload
//                             };
//                             openAiWs.send(JSON.stringify(audioAppend));
//                         }
//                         break;
//                     case 'start':
//                         streamSid = data.start.streamSid;
//                         console.log('Incoming stream has started', streamSid);

//                         // Reset start and media timestamp on a new stream
//                         responseStartTimestampTwilio = null;
//                         latestMediaTimestamp = 0;
//                         break;
//                     case 'mark':
//                         if (markQueue.length > 0) {
//                             markQueue.shift();
//                         }
//                         break;
//                     default:
//                         console.log('Received non-media event:', data.event);
//                         break;
//                 }
//             } catch (error) {
//                 console.error('Error parsing message:', error, 'Message:', message);
//             }
//         });

//         // Handle connection close
//         connection.on('close', () => {
//             if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
//             console.log('Client disconnected.');
//         });

//         // Handle WebSocket close and errors
//         openAiWs.on('close', () => {
//             console.log('Disconnected from the OpenAI Realtime API');
//         });

//         openAiWs.on('error', (error) => {
//             console.error('Error in the OpenAI WebSocket:', error);
//         });
//     });
// });

// fastify.listen({ port: PORT }, (err) => {
//     if (err) {
//         console.error(err);
//         process.exit(1);
//     }
//     console.log(`Server is listening on port ${PORT}`);
// });

// ------------------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------------------
// import Fastify from "fastify";
// import WebSocket from "ws";
// import dotenv from "dotenv";
// import fastifyWs from "@fastify/websocket";
// import fastifyFormBody from "@fastify/formbody";

// dotenv.config();

// /* ================== ENV ================== */
// const { OPENAI_API_KEY, VECTOR_STORE_ID, PORT = "3002" } = process.env;

// if (!OPENAI_API_KEY || !VECTOR_STORE_ID) {
//   throw new Error("Missing env vars");
// }

// /* ================== FASTIFY ================== */
// const fastify = Fastify();
// fastify.register(fastifyWs);
// fastify.register(fastifyFormBody);

// /* ================== CONSTANTS ================== */
// const VOICE = "shimmer";
// const TEMPERATURE = 0.8;

// /* ================== SYSTEM PROMPT ================== */
// const SYSTEM_MESSAGE = `
// You are विपिन, a Hindi-first AI voice sales agent calling on behalf of InCred Money.
// Follow all sales, language, and compliance rules strictly.
// Use retrieved knowledge when answering factual questions.
// `;

// /* ================== VECTOR SEARCH (OPENAI API) ================== */
// async function runVectorSearch(query) {
//   const res = await fetch(
//     `https://api.openai.com/v1/vector_stores/${VECTOR_STORE_ID}/search`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${OPENAI_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         query,
//         top_k: 5,
//       }),
//     }
//   );

//   if (!res.ok) {
//     throw new Error(await res.text());
//   }

//   const json = await res.json();

//   // Compress results for speech
//   const context = json.data
//     .map((r) => r.content?.map((c) => c.text).join(" "))
//     .join("\n");

//   return {
//     context,
//     source: "InCred Knowledge Base",
//   };
// }

// /* ================== ROOT ================== */
// fastify.get("/", async () => ({ ok: true }));

// /* ================== TWILIO WEBHOOK ================== */
// fastify.all("/twilio", async (req, reply) => {
//   reply.type("text/xml").send(`
//     <Response>
//       <Connect>
//         <Stream url="wss://${req.headers.host}/media-stream"/>
//       </Connect>
//     </Response>
//   `);
// });

// /* ================== MEDIA STREAM ================== */
// fastify.get("/media-stream", { websocket: true }, (conn, req) => {
//   let streamSid = null;
//   try {
//     const openaiWs = new WebSocket(
//       `wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime&temperature=${TEMPERATURE}`,
//       {
//         headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
//       }
//     );

//     /* ---------- INIT SESSION ---------- */
//     const initSession = () => {
//       openaiWs.send(
//         JSON.stringify({
//           type: "session.update",
//           session: {
//             type: "realtime",
//             instructions: SYSTEM_MESSAGE,
//             output_modalities: ["audio"],
//             audio: {
//               input: {
//                 format: { type: "audio/pcmu" },
//                 turn_detection: { type: "server_vad" },
//               },
//               output: {
//                 format: { type: "audio/pcmu" },
//                 voice: VOICE,
//               },
//             },
//             tools: [
//               {
//                 type: "function",
//                 name: "vector_search",
//                 description: "Search internal InCred knowledge base",
//                 parameters: {
//                   type: "object",
//                   properties: {
//                     query: { type: "string" },
//                   },
//                   required: ["query"],
//                 },
//               },
//             ],
//             tool_choice: "auto",
//           },
//         })
//       );
//     };

//     /* ---------- OPENAI EVENTS ---------- */
//     openaiWs.on("open", () => {
//       console.log("OpenAI Realtime connected");
//       setTimeout(initSession, 100);
//     });

//     openaiWs.on("message", async (raw) => {
//       const ev = JSON.parse(raw.toString());

//       /* 🔹 TOOL CALL */
//       if (ev.type === "response.function_call_arguments.done") {
//         const args = JSON.parse(ev.arguments);

//         if (ev.name === "vector_search") {
//           const result = await runVectorSearch(args.query);

//           openaiWs.send(
//             JSON.stringify({
//               type: "conversation.item.create",
//               item: {
//                 type: "message",
//                 role: "tool",
//                 name: "vector_search",
//                 content: [
//                   {
//                     type: "output_text",
//                     text: JSON.stringify(result),
//                   },
//                 ],
//               },
//             })
//           );
//         }
//       }

//       /* 🔹 AUDIO OUTPUT */
//       if (ev.type === "response.output_audio.delta") {
//         conn.send(
//           JSON.stringify({
//             event: "media",
//             streamSid,
//             media: { payload: ev.delta },
//           })
//         );
//       }
//     });

//     /* ---------- TWILIO EVENTS ---------- */
//     conn.on("message", (msg) => {
//       const data = JSON.parse(msg.toString());

//       if (data.event === "start") {
//         streamSid = data.start.streamSid;
//       }

//       if (data.event === "media") {
//         openaiWs.send(
//           JSON.stringify({
//             type: "input_audio_buffer.append",
//             audio: data.media.payload,
//           })
//         );
//       }
//     });

//     conn.on("close", () => {
//       if (openaiWs.readyState === WebSocket.OPEN) openaiWs.close();
//     });
//   } catch (error) {
//     console.error("Error in the OpenAI WebSocket:", error);
//   }
// });

// /* ================== START ================== */
// fastify.listen({ port: Number(PORT) }, () => {
//   console.log(`Server running on ${PORT}`);
// });
