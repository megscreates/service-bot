const { App } = require('@slack/bolt');
const { materials, getMaterialsByCategory, getCategories } = require('./materials.js');

// Initialize the app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

// Listen for the /materials command
app.command('/materials', async ({ ack, body, client }) => {
  await ack();

  try {
    // Get materials by category
    const materialsByCategory = getMaterialsByCategory();
    const categories = getCategories();
    
    // Create blocks for the modal
    let blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Select Materials",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Select the materials you used for this job:"
        }
      },
      {
        type: "divider"
      }
    ];
    
    // Add each category and its materials
    categories.forEach(category => {
      // Add category header
      blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: category,
          emoji: true
        }
      });
      
      // Add materials as checkboxes
      materialsByCategory[category].forEach(material => {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${material.label}* (${material.unit})`
          },
          accessory: {
            type: "checkboxes",
            action_id: `material_${material.id}`,
            options: [
              {
                text: {
                  type: "plain_text",
                  text: "Select",
                  emoji: true
                },
                value: material.id
              }
            ]
          }
        });
      });
      
      blocks.push({
        type: "divider"
      });
    });
    
    // Open the modal
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "materials_selection",
        title: {
          type: "plain_text",
          text: "Material Selection",
          emoji: true
        },
        submit: {
          type: "plain_text",
          text: "Next",
          emoji: true
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true
        },
        blocks: blocks
      }
    });
  } catch (error) {
    console.error(error);
  }
});

// Handle the material selection submission
app.view('materials_selection', async ({ ack, body, view, client }) => {
  await ack();
  
  // Extract selected material IDs
  const selectedMaterials = [];
  for (const blockId in view.state.values) {
    for (const actionId in view.state.values[blockId]) {
      if (actionId.startsWith('material_')) {
        const selection = view.state.values[blockId][actionId];
        if (selection.selected_options && selection.selected_options.length > 0) {
          selectedMaterials.push(selection.selected_options[0].value);
        }
      }
    }
  }
  
  // If no materials selected, send a message
  if (selectedMaterials.length === 0) {
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: "You didn't select any materials."
      });
      return;
    } catch (error) {
      console.error(error);
    }
  }
  
  // Create blocks for quantity input modal
  const quantityBlocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Enter Quantities",
        emoji: true
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Please enter the quantities for each selected material:"
      }
    },
    {
      type: "divider"
    }
  ];
  
  // Add input fields for each selected material
  selectedMaterials.forEach(materialId => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      quantityBlocks.push({
        type: "input",
        block_id: `quantity_${materialId}`,
        element: {
          type: "plain_text_input",
          action_id: "quantity_input",
          placeholder: {
            type: "plain_text",
            text: `Enter quantity (${material.unit})`,
            emoji: true
          }
        },
        label: {
          type: "plain_text",
          text: material.label,
          emoji: true
        }
      });
    }
  });
  
  // Open the quantity input modal
  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "materials_view_submission",
        title: {
          type: "plain_text",
          text: "Enter Quantities",
          emoji: true
        },
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true
        },
        blocks: quantityBlocks,
        private_metadata: JSON.stringify({ selectedMaterials })
      }
    });
  } catch (error) {
    console.error(error);
  }
});

// Handle the quantity input submission
app.view('materials_view_submission', async ({ ack, body, view, client }) => {
  await ack();
  
  // Get the selected materials from private_metadata
  const { selectedMaterials } = JSON.parse(view.private_metadata);
  
  // Gather quantities
  const materialsWithQuantities = [];
  selectedMaterials.forEach(materialId => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      const quantityValue = view.state.values[`quantity_${materialId}`].quantity_input.value || "0";
      materialsWithQuantities.push({
        id: material.id,
        label: material.label,
        unit: material.unit,
        quantity: quantityValue
      });
    }
  });
  
  // Format the response message
  let messageText = "*Materials and Quantities:*\n\n";
  materialsWithQuantities.forEach(material => {
    messageText += `• ${material.label}: ${material.quantity} ${material.unit}\n`;
  });
  
  // Send the response
  try {
    await client.chat.postMessage({
      channel: body.user.id,
      text: messageText,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: messageText
          }
        }
      ]
    });
    
    console.log("Form submission complete with data:", JSON.stringify(materialsWithQuantities));
  } catch (error) {
    console.error(error);
  }
});

// Start the app
(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running!');
})();
