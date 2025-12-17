// // import { RealtimeAgent } from "@openai/agents/realtime";

// // export const agent = new RealtimeAgent({
// //   name: "OpenAIVoiceAgent",
// //   instructions: `
// //     You are a polite and friendly phone assistant.
// //     Speak clearly and concisely.
// //     If the user says goodbye, politely end the call.
// //   `,
// // });




// import "dotenv/config";
// import Fastify, { FastifyReply, FastifyRequest } from "fastify";
// import fastifyFormBody from "@fastify/formbody";
// import fastifyWs from "@fastify/websocket";
// import { RealtimeSession } from "@openai/agents/realtime";
// import { TwilioRealtimeTransportLayer } from "@openai/agents-extensions";

// // import { agent } from "./agent.ts";

// const fastify = Fastify();

// const { OPENAI_API_KEY } = process.env;
// if (!OPENAI_API_KEY) {
//   console.error("Missing OPEN_API_KEY environment variable");
//   process.exit(1);
// }

// fastify.all("/twilio", async (request, reply) => {
//   console.log("Got a request from Twilio", request.headers.host);
//   reply.type("text/xml").send(`
//       <Response>
//         <Connect>
//           <Stream url="wss://${request.headers.host}/media" />
//         </Connect>
//       </Response>
//     `);
// });
// fastify.get("/health", (req, reply) => {
//   reply.send("ok");
// });
// fastify.register(async(fastify) => {
//   fastify.get("/media", { websocket: true }, async (connection) => {
//     console.log("Got a request from Twilio media");
//     console.log("📞 Twilio connected");

//     try {
//       const transport = new TwilioRealtimeTransportLayer({
//         twilioWebSocket: connection,
//       });

//       transport.on("*", (event) => {
//         if (event.type === "twilio_message") {
//           console.log("Twilio message:", event.data);
//         }
//       });
//       const session = new RealtimeSession(agent, {
//         transport: transport,
//         model: "gpt-realtime",
//         config: {
//           audio: {
//             output: {
//               voice: "verse",
//             },
//           },
//         },
//       });

//       await session.connect({
//         apiKey: OPENAI_API_KEY,
//       });

//       session.on("response_started", () => {
//         console.log("Agent speaking");
//       });

//       session.on("response_completed", () => {
//         console.log("Agent finished speaking");
//       });

//       connection.on("close", () => {
//         console.log("Twilio disconnected");
//         session.close();
//       });
//     } catch (error) {
//       console.error("Error in WebSocket connection:", error);
//     }
//   });
// });
// const start = async () => {
//   await fastify.register(fastifyWs);
//   await fastify.register(fastifyFormBody);
//   fastify.listen({ port: 3002, host: "0.0.0.0" }, (err, address) => {
//     if (err) {
//       fastify.log.error(err);
//       process.exit(1);
//     }
//     console.log("Server listening on", address);
//   });
// };
// start();