const { App } = require('@slack/bolt');
const { materialCategories, getPluralLabel, getSingularLabel, getQuantityLabel } = require('./materials');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: !!process.env.SLACK_APP_TOKEN, // Render might use http instead
  appToken: process.env.SLACK_APP_TOKEN
});

// Helper: Get material info by id
function getMaterialById(id) {
  for (const category of materialCategories) {
    for (const material of category.items) {
      if (material.id === id) {
        return material;
      }
    }
  }
  return null;
}

// Helper: Format materials with filled circles and proper spacing
function formatMaterialsList(materials) {
  let materialText = '';
  
  materials.forEach((mat) => {
    // Use arrow instead of numbers
    const prefix = "»";
    
    const qty = parseInt(mat.qty, 10);
    materialText += `${prefix}   *${mat.label}* — ${mat.qty} ${getQuantityLabel(mat.unit, qty)}\n\n`;
  });
  
  return materialText;
}

// Add this near the top of your file, after initializing the app
app.error(async (error) => {
  console.error('Slack app error:', error);
});

// For your view submission handlers, wrap them with try/catch:
app.view('create_service_modal', async ({ ack, body, view, client }) => {
  try {
    // Your existing code here
    await ack();
    // Rest of the function...
  } catch (error) {
    console.error('Error in create_service_modal handler:', error);
    await ack(); // Still acknowledge to prevent timeout
  }
});

// -------- STEP 1: Job Channel Selection --------
app.command('/materials', async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "job_channel_select",
        title: { type: "plain_text", text: "Materials Used" },
        submit: { type: "plain_text", text: "Next" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "First, select the job channel where these materials were used:"
            }
          },
          {
            type: "input",
            block_id: "job_channel",
            element: {
              type: "channels_select",
              placeholder: {
                type: "plain_text",
                text: "Select a job channel",
                emoji: true
              },
              action_id: "job_channel_selected"
            },
            label: {
              type: "plain_text",
              text: "Job Channel",
              emoji: true
            }
          }
        ]
      }
    });
  } catch (err) {
    console.error(err);
  }
});

// -------- STEP 2: Materials Selection Modal (with categories) --------
app.view('job_channel_select', async ({ ack, body, view }) => {
  // Get the selected job channel
  const jobChannelId = view.state.values.job_channel.job_channel_selected.selected_channel;

  // Create blocks for each category
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Selected job: <#${jobChannelId}>`
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Select materials from each category as needed."
        }
      ]
    }
  ];

  // Add each category as a separate multi-select
  materialCategories.forEach((category, index) => {
    // Add a divider between categories
    if (index > 0) {
      blocks.push({
        type: "divider"
      });
    }

    // Add category header
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${category.name}*`
      }
    });

    // Add multi-select for this category
    blocks.push({
      type: "input",
      block_id: `category_${index}`,
      optional: true,
      label: {
        type: "plain_text",
        text: "Select materials",
        emoji: true
      },
      element: {
        type: "multi_static_select",
        action_id: `materials_${index}`,
        placeholder: {
          type: "plain_text",
          text: "Choose materials",
          emoji: true
        },
        options: category.items.map(item => ({
          text: {
            type: "plain_text",
            text: item.label,
            emoji: true
          },
          value: item.id
        }))
      }
    });
  });

  // Open materials selection modal
  await ack({
    response_action: "update",
    view: {
      type: "modal",
      callback_id: "materials_select_modal",
      private_metadata: JSON.stringify({ jobChannelId }),
      title: { type: "plain_text", text: "Materials Used" },
      submit: { type: "plain_text", text: "Next" },
      close: { type: "plain_text", text: "Cancel" },
      blocks: blocks
    }
  });
});

// -------- STEP 3: Quantity Entry Modal --------
app.view('materials_select_modal', async ({ ack, body, view }) => {
  // Get previous metadata
  const metadata = JSON.parse(view.private_metadata || '{}');
  const jobChannelId = metadata.jobChannelId;
  
  // Get selected material IDs from all categories
  const selectedMaterials = [];
  
  materialCategories.forEach((category, index) => {
    const categoryBlock = view.state.values[`category_${index}`];
    
    if (categoryBlock && categoryBlock[`materials_${index}`] && 
        categoryBlock[`materials_${index}`].selected_options) {
      categoryBlock[`materials_${index}`].selected_options.forEach(option => {
        selectedMaterials.push(option.value);
      });
    }
  });

  if (selectedMaterials.length === 0) {
    // Return error if no materials selected
    await ack({
      response_action: "errors",
      errors: {
        "category_0": "Please select at least one material"
      }
    });
    return;
  }
  
  // Add check for maximum items
  if (selectedMaterials.length > 20) {
    await ack({
      response_action: "errors",
      errors: {
        "category_0": "Please select no more than 20 materials"
      }
    });
    return;
  }

  // Build quantity entry blocks (one input per material)
  const quantityBlocks = selectedMaterials.map(id => {
    const mat = getMaterialById(id);
    if (!mat) return null;
    
    return {
      type: "input",
      block_id: `qty_${id}`,
      label: {
        type: "plain_text",
        text: `${mat.label}  -  per ${getSingularLabel(mat.unit)}`, // "Material Name - per Unit" format
        emoji: true
      },
      element: {
        type: "plain_text_input",
        action_id: "quantity_input",
        placeholder: {
          type: "plain_text",
          text: "Enter amount"
        }
      }
    };
  }).filter(block => block !== null);

  // Use response_action to update the view immediately
  await ack({
    response_action: "update",
    view: {
      type: "modal",
      callback_id: "quantity_entry_modal",
      private_metadata: JSON.stringify({ 
        selectedIds: selectedMaterials, 
        jobChannelId, 
        user: body.user.id 
      }),
      title: { type: "plain_text", text: "Enter Quantities" },
      submit: { type: "plain_text", text: "Review" },
      close: { type: "plain_text", text: "Back" },
      blocks: [
        {
          type: "section",
          text: { 
            type: "mrkdwn", 
            text: `*Job:* <#${jobChannelId}>\n\n*Enter the quantity used for each material:*` 
          }
        },
        ...quantityBlocks
      ]
    }
  });
});

// -------- STEP 4: Review Modal --------
app.view('quantity_entry_modal', async ({ ack, view }) => {
  // Validate and parse quantities
  const metadata = JSON.parse(view.private_metadata);
  const selectedIds = metadata.selectedIds;
  const jobChannelId = metadata.jobChannelId;
  const userId = metadata.user;
  const values = view.state.values;

  // Build material/quantity list and validate
  let hasError = false;
  let errorBlocks = {};
  const materialsWithQty = selectedIds.map(id => {
    const mat = getMaterialById(id);
    if (!mat) return null;
    
    const qtyBlock = values[`qty_${id}`];
    const qtyRaw = qtyBlock ? qtyBlock.quantity_input.value : null;
    const qty = parseInt(qtyRaw, 10);

    if (isNaN(qty) || qty < 1 || !/^\d+$/.test(qtyRaw)) {
      hasError = true;
      errorBlocks[`qty_${id}`] = "Enter a positive whole number (1+)";
    }

    return {
      id,
      label: mat.label,
      unit: mat.unit,
      qty: qtyRaw
    };
  }).filter(mat => mat !== null);

  if (hasError) {
    await ack({
      response_action: "errors",
      errors: errorBlocks
    });
    return;
  }

  // Build review blocks with filled circle format
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  
  // Format the materials with filled circles and proper spacing
  const formattedMaterials = formatMaterialsList(materialsWithQty);

  // Use response_action to update the view immediately
  await ack({
    response_action: "update",
    view: {
      type: "modal",
      callback_id: "review_modal",
      private_metadata: JSON.stringify({ 
        materialsWithQty, 
        userId, 
        dateStr, 
        jobChannelId 
      }),
      title: { type: "plain_text", text: "Review Submission" },
      submit: { type: "plain_text", text: "Submit" },
      close: { type: "plain_text", text: "Back" },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Materials List*"
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `*Job:* <#${jobChannelId}> • ${dateStr} • <@${userId}>`
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
            text: formattedMaterials
          }
        }
      ]
    }
  });
});

// -------- STEP 5: Submit and Post to Job Channel --------
app.view('review_modal', async ({ ack, body, view, client }) => {
  await ack();
  
  // Get the data from private_metadata
  const metadata = JSON.parse(view.private_metadata);
  const { materialsWithQty, userId, dateStr, jobChannelId } = metadata;

  // Format the materials list with the same helper function
  const formattedMaterials = formatMaterialsList(materialsWithQty);

  // Get job channel name for better display
  let channelName = "";
  try {
    const channelInfo = await client.conversations.info({ channel: jobChannelId });
    channelName = channelInfo.channel.name;
  } catch (error) {
    console.error("Couldn't get channel info:", error);
    channelName = jobChannelId;
  }

  // Post the formatted message to the job channel
  await client.chat.postMessage({
    channel: jobChannelId,
    blocks: [
      {
        type: "divider" // Added divider above the Materials List header
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Materials List*" 
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*Job:* <#${jobChannelId}> • ${dateStr} • <@${userId}>`
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
          text: formattedMaterials
        }
      },
      {
        type: "divider" // Added divider at the end
      },
      {
        type: "section", // Empty section for visual spacing
        text: {
          type: "mrkdwn",
          text: " " 
        }
      }
    ]
  });

  // Also confirm to the user in a DM (optional)
  await client.chat.postMessage({
    channel: userId,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `✅ Materials list submitted to <#${jobChannelId}>`
        }
      }
    ]
  });

  // Prepare data for Acumatica
  const acumaticaData = {
    jobChannel: channelName,
    jobChannelId,
    submittedBy: userId,
    date: dateStr,
    materials: materialsWithQty.map(mat => ({
      itemId: mat.id,
      description: mat.label,
      quantity: parseInt(mat.qty, 10),
      unit: mat.unit
    }))
  };

  // Later: Send to Acumatica
  console.log("Ready for Acumatica import:", acumaticaData);
});

// Start the app
(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Service Bot is running on port', process.env.PORT || 3000);
})();
