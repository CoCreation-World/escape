/// <reference types="@workadventure/iframe-api-typings" />
/// <reference types="vite/client" />
import { bootstrapExtra } from "@workadventure/scripting-api-extra";
import { subscribeToLLMAreas } from "./features/llm-areas/llm-areas";
import { levelUp } from "@workadventure/quests";
import { checkPlayerMaterial, mySound, playRandomSound } from "./footstep";

WA.onInit().then(() => {
  var lavaSFX = WA.sound.loadSound("./lava-cave.wav");
var config = {
    volume : 0.25,
    loop : true,
    rate : 1,
    detune : 1,
    delay : 0,
    seek : 0,
    mute : false
}
lavaSFX.play(config);
})

console.log("Script started successfully");

// Waiting for the API to be ready
WA.onInit()
  .then(() => {
    console.log("Scripting API ready");
    console.log("Player tags: ", WA.player.tags);

    subscribeToLLMAreas();

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra()
      .then(() => {
        console.log("Scripting API Extra ready");
      })
      .catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));

  WA.onInit().then(async () => {
    WA.player.onPlayerMove(async ({ x, y, moving }) => {
      const material = await checkPlayerMaterial({ x, y });
      console.log(material);
  
      if (!material) {
        return mySound?.stop();
      }
  
      if (!moving && !material) {
        return mySound?.stop();
      } else {
        mySound?.stop();
        return playRandomSound(material);
      }
    });
  });

  const fields = "abcdefghijklmnopqrstuvwxy".split("");

  fields.forEach((field) => {
    const nextFields = fields.filter((f) => f !== field);
    nextFields.forEach((nextField) => {
      const areaName = `${field}2${nextField}`;
      WA.room.area.onEnter(areaName).subscribe(async () => {
        const area = await WA.room.area.get(nextField);
        if (area) {
          const { x, y, width, height } = area;
          const randomX = x + Math.random() * width;
          const randomY = y + Math.random() * height;
          WA.player.teleport(randomX, randomY);
          console.log(`Player jumped from ${field} to ${nextField} at coordinates (${randomX}, ${randomY})`);
        } else {
          console.error(`Area ${nextField} not found`);
        }
      });
    });
  });
let jumpingJacksPopup: any;
let hasShownPopup = false;


WA.room.area.onEnter('start_jumpingjack').subscribe( () => {
  if (!hasShownPopup) {
    jumpingJacksPopup = WA.ui.openPopup('popup_jumpingjacks', 'Welcome to the Jumping Jack Challenge!\n In this game, you need to cross the map from the bottom right to the top left.\nThe coins on the floor indicate how far you will jump when stepping on the directional arrows.\nBe careful, the floor is lava \n Good luck!', [{
      label: 'Close',
      className: 'primary',
      callback: (popup) => {
        // Close the popup when the "Close" button is pressed.
        popup.close();
      }
    }]);
    hasShownPopup = true;
  }
});
WA.room.area.onLeave('start_jumpingjack').subscribe( () => {
  if (jumpingJacksPopup) {
    jumpingJacksPopup.close();
  }
});
WA.room.area.onEnter('y2x').subscribe(async () => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Wait for half a second
  WA.controls.disableWheelZoom();
  const playerPosition = await WA.player.getPosition();
  WA.camera.set(playerPosition.x, playerPosition.y, 300, 300, false, true);
  });
let jumpCount = 0;
WA.room.area.onEnter('x').subscribe(async () => {
WA.ui.actionBar.addButton({
  id: 'reset',
  type: 'action',
  imageSrc: 'https://minio-production-fa1d.up.railway.app/typebot/public/workspaces/clwxv3blz001hp28kvtibhtth/typebots/cm0v10et3000ahfv7f1qc2wju/blocks/xjb2tkpg6p8vz8rgfbf0wfxe?v=1729075857883',
  toolTip: 'return to start',
  callback: async () => {
    const area = await WA.room.area.get('y');
    if (area) {
      const { x, y, width, height } = area;
      const randomX = x + Math.random() * width;
      const randomY = y + Math.random() * height;
      WA.player.teleport(randomX, randomY);
      console.log(`Player teleported back to area 'y' at coordinates (${randomX}, ${randomY})`);
    } else {
      console.error(`Area 'y' not found`);
    }
  }
})})
fields.forEach((field) => {
  const nextFields = fields.filter((f) => f !== field);
  nextFields.forEach((nextField) => {
    const areaName = `${field}2${nextField}`;
    WA.room.area.onEnter(areaName).subscribe(async () => {
      const area = await WA.room.area.get(nextField);
      if (area) {
        const { x, y, width, height } = area;
        const randomX = x + Math.random() * width;
        const randomY = y + Math.random() * height;
        WA.player.teleport(randomX, randomY);
        jumpCount++;
        console.log(`Player jumped from ${field} to ${nextField} at coordinates (${randomX}, ${randomY}). Jump count: ${jumpCount}`);
      } else {
        console.error(`Area ${nextField} not found`);
      }
    });
  });
});
WA.room.area.onEnter('jumping_finish').subscribe(async () => {
  const hasSolved = WA.player.state.hasSolved;
  if (hasSolved) {
    console.log('Player has already solved the Jumping Jack Challenge. No EXP awarded.');
    return;
  }

  let exp = 0;
  if (jumpCount <= 8) {
    exp = 1519;
  } else {
    const excessJumps = jumpCount - 8;
    exp = Math.max(0, 1519 * (1 - (excessJumps / 100))); // Reduce EXP in percentage relation
  }

  levelUp("JUMPING", exp);
  console.log(`Player finished the Jumping Jack Challenge with ${jumpCount} jumps and earned ${exp} EXP`);

  await WA.player.state.saveVariable('hasSolved', true, { persist: true, scope: "world" }); // Set the persistent variable
  jumpCount = 0; // Reset jump count for next game
});

WA.room.area.onEnter('jumping_finish').subscribe(() => {
    WA.chat.sendChatMessage('Congratulations, you solved the puzzle. \n Check out the Leaderboard to see who else solved the puzzle. \n Click on the logo on the bottom to open the menu and navigate to "Quests" \n\nLeave the puzzle by entering the mouth next to you.', { scope: 'local', author: 'System' });
});
WA.onInit().then(() => {
WA.room.area.onEnter('exit1').subscribe( () => {WA.nav.goToRoom("/")});

WA.room.area.onEnter('exit2').subscribe( () => {WA.nav.goToRoom("/")});
})