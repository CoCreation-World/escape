import { LLMArea, TiledLLMAreas } from "./models/llm-areas.model";

export const COMMON_LLM_AREAS = Object.keys(TiledLLMAreas).map((area) => ({
  name: area,
}));

export const subscribeToLLMAreas = () => {
  const LLM_AREAS: LLMArea[] = [
    { name: "angel", handler: handleAngelInteraction },
    ...COMMON_LLM_AREAS,
  ];

  LLM_AREAS.forEach(setupAreaListener);
};

const setupAreaListener = (area: LLMArea) => {
  WA.room.area.onEnter(area.name).subscribe(() => {
    area.handler ? area.handler(area) : handleCommonLLMArea(area);
  });
};

const sendLLMMessage = (message: string, author: string) =>
  WA.chat.sendChatMessage(message, { author, scope: "local" });

let hasBeenIntroduced = false;

const handleAngelInteraction = (area: LLMArea) => {
  console.log("entered", area.name);
  if (!hasBeenIntroduced) {
    sendLLMMessage(`Welcome to the Oracle, ${WA.player.name}!`, "Angel");
    sendLLMMessage(
      `Ask the Gods a question and let your fate be realized.`,
      "Angel"
    );
    hasBeenIntroduced = true;
  }

  WA.ui.displayPlayerMessage({
    message: "Start Trial of the Gods",
    callback: () => startTrial(),
  });
};

const handleCommonLLMArea = (area: LLMArea) => {
  console.log("entered", area.name);
};

function startTrial() {
  showModal();
}
function showModal() {
  WA.ui.modal.openModal({
    src: "http://localhost:3000/templates/question.html",
    title: "Type question here",
    position: "center",
    allowApi: true,
    allow: null,
  });
}
