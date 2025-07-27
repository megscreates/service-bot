const { App } = require('@slack/bolt');
const { materialCategories, getHumanLabel } = require('./materials');

// Flatten all materials into one big list for the MVP
const allMaterials = materialCategories.flatMap(cat => cat.items).slice(0, 50); // Limit to 50 for now

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: !!process.env.SLACK_APP_TOKEN, // Render might use http instead
  appToken: process.env.SLACK_APP_TOKEN
});

// Helper: Build Block Kit options for the select menu
function materialOptions() {
  return allMaterials.map(mat => ({
    text: {
      type: "plain_text",
      text: mat.label,
      emoji: true
    },
    value: mat.id
  }));
}

// Helper: Get material info by id
function getMaterialById(id) {
  return allMaterials.find(mat => mat.id === id);
}

// Open materials modal
app.command('/materials', async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "dynamic_materials_modal",
        title: { type: "plain_text", text: "Materials Used" },
        submit: { type: "plain_text", text: "Review" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "section",
            text: { 
              type: "mrkdwn", 
              text: "*Select materials and enter quantities*" 
            }
          },
          {
            type: "actions",
            block_id: "add_material_btn",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Add Material",
                  emoji: true
                },
                style: "primary",
                action_id: "add_material_row"
              }
            ]
          },
          // First material row
          {
            type: "section",
            block_id: "material_row_1",
            text: {
              type: "mrkdwn",
              text: "*Material #1*"
            }
          },
          {
            type: "actions",
            block_id: "material_select_1",
            elements: [
              {
                type: "static_select",
                placeholder: {
                  type: "plain_text",
                  text: "Select material",
                  emoji: true
                },
                options: materialOptions(),
                action_id: "material_selected"
              }
            ]
          }
        ]
      }
    });
  } catch (err) {
    console.error(err);
  }
});

// Handle material selection
app.action('material_selected', async ({ ack, body, client }) => {
  await ack();

  // Get the selected material
  const selectedOption = body.actions[0].selected_option;
  const materialId = selectedOption.value;
  const material = getMaterialById(materialId);
  
  // Get the row number from the block_id (material_select_1, material_select_2, etc)
  const rowNum = body.actions[0].block_id.split('_').pop();
  
  // Check if quantity block already exists
  const quantityBlockId = `material_qty_${rowNum}`;
  const hasQuantityBlock = body.view.blocks.some(block => block.block_id === quantityBlockId);
  
  if (!hasQuantityBlock) {
    // Create a new blocks array with the quantity input added
    const updatedBlocks = [...body.view.blocks];
    
    // Find the index of the current material selection block
    const currentBlockIndex = updatedBlocks.findIndex(block => 
      block.block_id === `material_select_${rowNum}`
    );
    
    // Insert quantity input right after the material selection
    updatedBlocks.splice(currentBlockIndex + 1, 0, {
      type: "input",
      block_id: quantityBlockId,
      label: {
        type: "plain_text",
        text: `Quantity (${getHumanLabel(material.unit)})`,
        emoji: true
      },
      element: {
        type: "plain_text_input",
        action_id: "quantity_value",
        placeholder: {
          type: "plain_text",
          text: "Enter amount"
        },
        initial_value: "1"
      }
    });
    
    // Update the view with the new blocks
    await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: {
        type: "modal",
        callback_id: "dynamic_materials_modal",
        title: { type: "plain_text", text: "Materials Used" },
        submit: { type: "plain_text", text: "Review" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: updatedBlocks
      }
    });
  }
});

// Handle adding more material rows
app.action('add_material_row', async ({ ack, body, client }) => {
  await ack();
  
  // Figure out the next row number
  const blocks = body.view.blocks;
  let maxRowNum = 0;
  
  blocks.forEach(block => {
    if (block.block_id && block.block_id.startsWith('material_row_')) {
      const rowNum = parseInt(block.block_id.split('_').pop(), 10);
      if (rowNum > maxRowNum) maxRowNum = rowNum;
    }
  });
  
  const newRowNum = maxRowNum + 1;
  
  // Add a divider and new material row
  const updatedBlocks = [...blocks];
  
  updatedBlocks.push(
    {
      type: "divider"
    },
    {
      type: "section",
      block_id: `material_row_${newRowNum}`,
      text: {
        type: "mrkdwn",
        text: `*Material #${newRowNum}*`
      }
    },
    {
      type: "actions",
      block_id: `material_select_${newRowNum}`,
      elements: [
        {
          type: "static_select",
          placeholder: {
            type: "plain_text",
            text: "Select material",
            emoji: true
          },
          options: materialOptions(),
          action_id: "material_selected"
        }
      ]
    }
  );
  
  await client.views.update({
    view_id: body.view.id,
    hash: body.view.hash,
    view: {
      type: "modal",
      callback_id: "dynamic_materials_modal",
      title: { type: "plain_text", text: "Materials Used" },
      submit: { type: "plain_text", text: "Review" },
      close: { type: "plain_text", text: "Cancel" },
      blocks: updatedBlocks
    }
  });
});

// Handle the review submission
app.view('dynamic_materials_modal', async ({ ack, body, view, client }) => {
  // Collect all the materials and quantities
  const blocks = view.blocks;
  const materialsData = [];
  
  // Process the blocks to extract material and quantity pairs
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    if (block.block_id && block.block_id.startsWith('material_select_')) {
      const rowNum = block.block_id.split('_').pop();
      const materialBlock = block;
      const quantityBlock = blocks.find(b => b.block_id === `material_qty_${rowNum}`);
      
      // Only process if we have both material and quantity
      if (materialBlock && quantityBlock) {
        // Get the selected material info
        const materialId = materialBlock.elements[0].selected_option?.value;
        
        if (materialId) {
          const material = getMaterialById(materialId);
          const quantityValue = view.state.values[`material_qty_${rowNum}`].quantity_value.value;
          
          materialsData.push({
            id: materialId,
            label: material.label,
            unit: material.unit,
            qty: quantityValue
          });
        }
      }
    }
  }
  
  // Build review blocks
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  
  const reviewBlocks = [
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Please review your submission:*" }
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `*User:* <@${body.user.id}>` },
        { type: "mrkdwn", text: `*Date:* ${dateStr}` }
      ]
    },
    ...materialsData.map(mat => ({
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Material:*\n${mat.label}` },
        { type: "mrkdwn", text: `*Quantity:*\n${mat.qty} ${getHumanLabel(mat.unit)}` }
      ]
    }))
  ];
  
  // Update to review view
  await ack({
    response_action: "update",
    view: {
      type: "modal",
      callback_id: "review_submission",
      private_metadata: JSON.stringify({ materialsData, userId: body.user.id, dateStr }),
      title: { type: "plain_text", text: "Review Submission" },
      submit: { type: "plain_text", text: "Submit" },
      close: { type: "plain_text", text: "Back" },
      blocks: reviewBlocks
    }
  });
});

// Final submission handling
app.view('review_submission', async ({ ack, body, view, client }) => {
  await ack();
  
  // Get the data from private_metadata
  const metadata = JSON.parse(view.private_metadata);
  const { materialsData, userId, dateStr } = metadata;

  // Create the nicely formatted materials list with circle numbers
  const numberEmojis = ['❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽', '❾'];
  
  // Build the materials text with spacing and numbered circles
  let materialsText = '';
  materialsData.forEach((mat, index) => {
    const numberEmoji = numberEmojis[index % numberEmojis.length];
    materialsText += `${numberEmoji}   *${mat.label}* — ${mat.qty} ${getHumanLabel(mat.unit)}\n\n`;
  });

  // Post the beautifully formatted message back to the user
  await client.chat.postMessage({
    channel: body.user.id,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Materials List",
          emoji: true
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${dateStr} • <@${userId}>`
          }
        ]
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: materialsText
        }
      }
    ]
  });

  // Later: Send to Acumatica or other systems
  console.log(`Material submission from ${userId}:`);
  console.log(materialsData);
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Service Bot is running!');
})();
