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

// Helper: Format materials with filled circles and proper spacing
function formatMaterialsList(materials) {
  const numberEmojis = ['❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽', '❾'];
  let materialText = '';
  
  materials.forEach((mat, index) => {
    const numberEmoji = numberEmojis[index % numberEmojis.length];
    materialText += `${numberEmoji}   *${mat.label}* — ${mat.qty} ${getHumanLabel(mat.unit)}\n\n`;
  });
  
  return materialText;
}

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

// -------- STEP 2: Materials Selection Modal --------
app.view('job_channel_select', async ({ ack, body, view }) => {
  // Get the selected job channel
  const jobChannelId = view.state.values.job_channel.job_channel_selected.selected_channel;

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
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Selected job: <#${jobChannelId}>`
          }
        },
        {
          type: "input",
          block_id: "materials_select",
          label: { type: "plain_text", text: "Select materials used" },
          element: {
            type: "multi_static_select",
            action_id: "selected_materials",
            placeholder: { type: "plain_text", text: "Choose materials" },
            options: materialOptions()
          }
        }
      ]
    }
  });
});

// -------- STEP 3: Quantity Entry Modal --------
app.view('materials_select_modal', async ({ ack, body, view }) => {
  // Get previous metadata
  const metadata = JSON.parse(view.private_metadata || '{}');
  const jobChannelId = metadata.jobChannelId;
  
  // Get selected material IDs
  const selected = view.state.values.materials_select.selected_materials.selected_options || [];
  const selectedIds = selected.map(opt => opt.value);

  if (selectedIds.length === 0) {
    // You could return errors here if you wanted to validate selection
    await ack();
    return;
  }

  // Build quantity entry blocks (one input per material)
  const quantityBlocks = selectedIds.map(id => {
    const mat = getMaterialById(id);
    return {
      type: "input",
      block_id: `qty_${id}`,
      label: {
        type: "plain_text",
        text: `${mat.label} (${getHumanLabel(mat.unit)})`
      },
      element: {
        type: "plain_text_input",
        action_id: "quantity_input",
        placeholder: { type: "plain_text", text: "Quantity (whole number)" }
      }
    };
  });

  // Use response_action to update the view immediately
  await ack({
    response_action: "update",
    view: {
      type: "modal",
      callback_id: "quantity_entry_modal",
      private_metadata: JSON.stringify({ 
        selectedIds, 
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
  });

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
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Service Bot is running!');
})();
