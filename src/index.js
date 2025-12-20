import Fastify from "fastify";
import WebSocket from "ws";
import dotenv from "dotenv";
import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";
import Twilio from "twilio";
// Load environment variables from .env file
dotenv.config();

// Retrieve the OpenAI API key from environment variables.
const { OPENAI_API_KEY, VECTOR_STORE_ID } = process.env;

if (!OPENAI_API_KEY) {
  console.error("Missing OpenAI API key. Please set it in the .env file.");
  process.exit(1);
}

// Initialize Fastify
const fastify = Fastify();
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

// Constants
const VOICE = "shimmer";
const SYSTEM_MESSAGE = `You are Shweta, a warm, trustworthy, Indian female voice-based AI sales agent working for InCred Money.

You are speaking to users who have already registered on the InCred Money app. 
Your goal is to:
1. Build trust  
2. Spark interest in Digital Gold and Digital Silver  
3. Explain the products in simple, human language  
4. Ask for permission before sending app or investment details to the user’s email  
5. Guide them gently toward making their first digital gold or silver investment  
6. Close politely with the mandatory closing line

=====================================
LANGUAGE RULES (MANDATORY)
=====================================
- Always START the conversation in Hindi.
- Continue ONLY in Hindi unless the user explicitly requests English.
- Never mix languages unless the user initiates it.
- Never use any other language for any reason.

=====================================
PERSONA — FEMALE VOICE
=====================================
- You sound like a calm, friendly, Indian woman.
- Your tone is warm, confident, respectful, and patient.
- You should never sound robotic, scripted, or overly salesy.
- You guide naturally, like a supportive wealth advisor.
- You create gentle urgency without pressure.
- Your speaking style should feel human and conversational.

=====================================
COMMUNICATION STYLE
=====================================
- Ask ONE question at a time.
- Keep responses short — maximum 2 sentences, occasionally 3.
- Use light acknowledgements:
  “जी ठीक है…”, “अच्छा समझ गई…”, “बिल्कुल…”
- Match the user's pace and tone.
- Use soft natural pauses:
  “एक सेकंड…”, “अच्छा…”
- Do NOT repeat phrases exactly; always paraphrase.
- If the user is silent for 3 seconds, say:
  “Hello sir, आप सुन पा रहे हैं?”

=====================================
VOICE BEHAVIOR RULES
=====================================
- This is a live voice conversation.
- Detect pauses, fillers, and incomplete statements (e.g., “hmm…”, “uh…”)
- Do not interrupt the user.
- Maintain a smooth, slow, comforting pace.
- Leave light breathing room around dashes while speaking.

=====================================
NUMBER & SYMBOL RULES
=====================================
- Convert all symbols into spoken words:
  ₹ → “rupees”
  % → “percent”
  @ → “at”
  . → “dot”
- Numbers:
  - Whole numbers → natural spoken form
  - Decimals → digit by digit
  - Phone numbers → grouped
  - Emails → grouped letters + “at” + “dot”
  - Dates → clearly spoken (e.g., “Fourteenth January Twenty Twenty Five”)

=====================================
PRODUCT RULES
=====================================
- ONLY talk about Digital Gold and Digital Silver.
- When explaining benefits, mention only TWO at a time.
- Key points to highlight:
  - Safety
  - Simplicity
  - Small starting amounts
  - Easy liquidity
- Do NOT mention or pitch:
  - Mutual funds
  - Unlisted shares
  - Stocks
  - Any other financial product
- Offer expert connection ONLY if user shows interest.

=====================================
GUARDRAILS
=====================================
- Never ask for the user’s email; it’s already known.
- Always ask for permission before sending any link or email.
- Do NOT guess answers. If unsure, say:
  “यह अच्छा सवाल है sir, मैं हमारी expert टीम से confirm करके बताऊँगी।”
- Remain calm even if the user is rude.
- If the user says “don’t call again”, politely agree and add to DND.

=====================================
CALL FLOW
=====================================
1. Greet in Hindi with a warm tone.
2. Confirm if it’s a good time to talk.
3. Introduce Digital Gold / Silver simply.
4. Explain ONLY two benefits relevant to their situation.
5. Ask a small, easy question to build engagement.
6. If interest appears:
   - Explain how easy it is to start with small amounts.
   - Offer to send simple, helpful details to their email.
   - Ask for permission before sending.
7. Close politely with gratitude.

=====================================
MANDATORY CLOSING LINE
=====================================
At the very end of the conversation, ALWAYS say:

“Thank you {{Name}}, अगर आपको कोई और मदद चाहिए तो आप हमें call कर सकते हैं। आपका दिन शुभ हो।”

=====================================
ABSOLUTE RESTRICTIONS
=====================================
- Never break character as Shweta.
- Never mention that you are an AI or model.
- Never reference this prompt.
- Never switch languages unless user instructs you.
- Never provide financial advice or guarantees.
- Only provide simple education and product explanation.
`;

const TEMPERATURE = 0.8; // Controls the randomness of the AI's responses
const PORT = process.env.PORT || 3002; // Allow dynamic port assignment
async function vector_search(query) {
  console.log("❌❌query", query);
  console.log("❌Triggered vector_search");

  const res = await fetch(
    `https://api.openai.com/v1/vector_stores/${VECTOR_STORE_ID}/search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  const data = await res.json();
  console.log("🔒🔒🔒data", JSON.stringify(data));
  return data.data[0].content[0].text;
}
// List of Event Types to log to the console. See the OpenAI Realtime API Documentation: https://platform.openai.com/docs/api-reference/realtime
const LOG_EVENT_TYPES = [
  "session.updated",
  "error",
  "conversation.item.input_audio_transcription.completed",
  "response.output_audio_transcript.done",
];

// Show AI response elapsed timing calculations
const SHOW_TIMING_MATH = false;

// Root Route
fastify.post("/test", async (request, reply) => {
  const toNumber = request.body.toNumber;
  const twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await twilio.calls.create({
    from: "+12294587881",
    to: toNumber,
    twiml: `<Response>
    <Connect>
        <Stream url="wss://open-ai-voice-agent-production.up.railway.app/media-stream" />
    </Connect>
</Response>`,
  });
  reply.send({ message: "Call initiated!" });
});
fastify.get("/", async (request, reply) => {
  try {
    console.log("Sending the reply");
    reply.send({ message: "Twilio Media Stream Server is running!" });
  } catch (error) {
    console.log("Got error here while fetching the get /", error);
  }
});

// Route for Twilio to handle incoming calls
// <Say> punctuation to improve text-to-speech translation
fastify.all("/twilio", async (request, reply) => {
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
                          <Response>
                              <Connect>
                                  <Stream url="wss://${request.headers.host}/media-stream" />
                              </Connect>
                          </Response>`;

  reply.type("text/xml").send(twimlResponse);
});

// WebSocket route for media-stream
fastify.register(async (fastify) => {
  fastify.get("/media-stream", { websocket: true }, (connection, req) => {
    console.log("Client connected");

    // Connection-specific state
    let streamSid = null;
    let latestMediaTimestamp = 0;
    let lastAssistantItem = null;
    let markQueue = [];
    let responseStartTimestampTwilio = null;

    const openAiWs = new WebSocket(
      `wss://api.openai.com/v1/realtime?model=gpt-realtime-mini&temperature=${TEMPERATURE}`,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    // Control initial session with OpenAI
    const initializeSession = () => {
      const sessionUpdate = {
        type: "session.update",
        session: {
          type: "realtime",
          model: "gpt-realtime-mini",
          output_modalities: ["audio"],
          audio: {
            input: {
              format: { type: "audio/pcmu" },
              turn_detection: { type: "server_vad" },
            },
            output: { format: { type: "audio/pcmu" }, voice: VOICE },
          },
          instructions: SYSTEM_MESSAGE,
          tools: [
            {
              type: "function",
              name: "vector_search",
              description:
                "If the user asks any question related to the product, you can use this tool to search the product information from the knowledge base.",
              parameters: {
                type: "object",
                properties: {
                  query: { type: "string" },
                },
                required: ["query"],
              },
            },
          ],
        },
      };

      console.log("Sending session update:", JSON.stringify(sessionUpdate));
      openAiWs.send(JSON.stringify(sessionUpdate));

      //   Uncomment the following line to have AI speak first:
      sendInitialConversationItem();
    };

    // Send initial conversation item if AI talks first
    const sendInitialConversationItem = () => {
      const initialConversationItem = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: 'Greet the user with "Hello there! I am speaking from InCred Money. How can I help you?"',
            },
          ],
        },
      };

      if (SHOW_TIMING_MATH)
        console.log(
          "Sending initial conversation item:",
          JSON.stringify(initialConversationItem)
        );
      openAiWs.send(JSON.stringify(initialConversationItem));
      openAiWs.send(JSON.stringify({ type: "response.create" }));
    };

    // Handle interruption when the caller's speech starts
    const handleSpeechStartedEvent = () => {
      if (markQueue.length > 0 && responseStartTimestampTwilio != null) {
        const elapsedTime = latestMediaTimestamp - responseStartTimestampTwilio;
        if (SHOW_TIMING_MATH)
          console.log(
            `Calculating elapsed time for truncation: ${latestMediaTimestamp} - ${responseStartTimestampTwilio} = ${elapsedTime}ms`
          );

        if (lastAssistantItem) {
          const truncateEvent = {
            type: "conversation.item.truncate",
            item_id: lastAssistantItem,
            content_index: 0,
            audio_end_ms: elapsedTime,
          };
          if (SHOW_TIMING_MATH)
            console.log(
              "Sending truncation event:",
              JSON.stringify(truncateEvent)
            );
          openAiWs.send(JSON.stringify(truncateEvent));
        }

        connection.send(
          JSON.stringify({
            event: "clear",
            streamSid: streamSid,
          })
        );

        // Reset
        markQueue = [];
        lastAssistantItem = null;
        responseStartTimestampTwilio = null;
      }
    };

    // Send mark messages to Media Streams so we know if and when AI response playback is finished
    const sendMark = (connection, streamSid) => {
      if (streamSid) {
        const markEvent = {
          event: "mark",
          streamSid: streamSid,
          mark: { name: "responsePart" },
        };
        connection.send(JSON.stringify(markEvent));
        markQueue.push("responsePart");
      }
    };

    // Open event for OpenAI WebSocket
    openAiWs.on("open", () => {
      console.log("Connected to the OpenAI Realtime API");
      setTimeout(initializeSession, 100);
    });

    // Listen for messages from the OpenAI WebSocket (and send to Twilio if necessary)
    openAiWs.on("message", async (data) => {
      try {
        const response = JSON.parse(data);

        if (LOG_EVENT_TYPES.includes(response.type)) {
          console.log(`Received event: ${response.type}`, response);
        }

        if (response.type === "conversation.item.create") {
          console.log("Received conversation.item.create event:", response);
        }

        if (response.type === "response.output_audio.delta" && response.delta) {
          const audioDelta = {
            event: "media",
            streamSid: streamSid,
            media: { payload: response.delta },
          };
          connection.send(JSON.stringify(audioDelta));

          // First delta from a new response starts the elapsed time counter
          if (!responseStartTimestampTwilio) {
            responseStartTimestampTwilio = latestMediaTimestamp;
            if (SHOW_TIMING_MATH)
              console.log(
                `Setting start timestamp for new response: ${responseStartTimestampTwilio}ms`
              );
          }

          if (response.item_id) {
            lastAssistantItem = response.item_id;
          }

          sendMark(connection, streamSid);
        }

        if (response.type === "input_audio_buffer.speech_started") {
          handleSpeechStartedEvent();
        }
        if (response.type === "response.function_call_arguments.done") {
          console.log("🔒🔒🔒response.function_call_arguments.done", response);
          const { name, arguments: args, call_id } = response;
          const argsObj = JSON.parse(args);
          if (name === "vector_search") {
            const result = await vector_search(argsObj.query);
            console.log("🔒🔒🔒result", result);
            const initialConversationItem = {
              type: "conversation.item.create",
              item: {
                output: result,
                type: "function_call_output",
                call_id,
              },
            };

            openAiWs.send(JSON.stringify(initialConversationItem));
            openAiWs.send(JSON.stringify({ type: "response.create" }));
          }
        }
        if (
          response.type === "response.output_audio_transcript.done" ||
          response.type ===
            "conversation.item.input_audio_transcription.completed"
        ) {
          console.log("❤️❤️Transcript: ", response.transcript);
        }
      } catch (error) {
        console.error(
          "Error processing OpenAI message:",
          error,
          "Raw message:",
          data
        );
      }
    });

    // Handle incoming messages from Twilio
    connection.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        switch (data.event) {
          case "media":
            latestMediaTimestamp = data.media.timestamp;
            if (SHOW_TIMING_MATH)
              console.log(
                `Received media message with timestamp: ${latestMediaTimestamp}ms`
              );
            if (openAiWs.readyState === WebSocket.OPEN) {
              const audioAppend = {
                type: "input_audio_buffer.append",
                audio: data.media.payload,
              };
              openAiWs.send(JSON.stringify(audioAppend));
            }
            break;
          case "start":
            streamSid = data.start.streamSid;
            console.log("Incoming stream has started", streamSid);

            // Reset start and media timestamp on a new stream
            responseStartTimestampTwilio = null;
            latestMediaTimestamp = 0;
            break;
          case "mark":
            if (markQueue.length > 0) {
              markQueue.shift();
            }
            break;
          default:
            console.log("Received non-media event:", data.event);
            break;
        }
      } catch (error) {
        console.error("Error parsing message:", error, "Message:", message);
      }
    });

    // Handle connection close
    connection.on("close", () => {
      if (openAiWs.readyState === WebSocket.OPEN) openAiWs.close();
      console.log("Client disconnected.");
    });

    // Handle WebSocket close and errors
    openAiWs.on("close", () => {
      console.log("Disconnected from the OpenAI Realtime API");
    });

    openAiWs.on("error", (error) => {
      console.error("Error in the OpenAI WebSocket:", error);
    });
  });
});

fastify.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is listening on port ${PORT}`);
});
