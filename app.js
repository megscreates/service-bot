const { App } = require('@slack/bolt');
const { materialCategories, getPluralLabel, getSingularLabel, getQuantityLabel } = require('./materials');

// Initialize the app with what we need
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: !!process.env.SLACK_APP_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  // Add these for more reliable socket connections:
  socketMode: {
    reconnectOnError: true,
    reconnect: true
  }
});

// Error logging
app.error(async (error) => {
  console.error('SLACK APP ERROR:', error);
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

// -------- STEP 1: Job Channel Selection --------
app.command('/materials', async ({ ack, body, client }) => {
  await ack();
  console.log('Materials command triggered by user:', body.user_id);

  try {
    console.log('Opening job channel selection modal');
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
    console.error('Error opening job channel selection modal:', err);
    
    // Try to notify the user about the error
    try {
      await client.chat.postMessage({
        channel: body.user_id,
        text: `Sorry, something went wrong. Please try again!`
      });
    } catch (dmError) {
      console.error('Error sending error notification:', dmError);
    }
  }
});

// -------- STEP 2: Materials Selection Modal (with categories) --------
app.view('job_channel_select', async ({ ack, body, view, client }) => {
  try {
    console.log('Processing channel selection from user:', body.user.id);
    
    // Get the selected job channel
    const jobChannelId = view.state.values.job_channel.job_channel_selected.selected_channel;
    console.log('Selected job channel:', jobChannelId);
    
    if (!jobChannelId) {
      // Missing channel selection - shouldn't happen but just in case
      await ack({
        response_action: "errors",
        errors: {
          "job_channel": "Please select a job channel"
        }
      });
      return;
    }
    
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

    // Use view update pattern here too for reliability
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
    
    console.log('Materials selection modal opened via view update');
  } catch (error) {
    console.error('Error updating to materials selection modal:', error);
    
    // Acknowledge with basic response to prevent timeouts
    await ack({
      response_action: "errors",
      errors: {
        "job_channel": "Something went wrong. Please try again."
      }
    });
    
    // Try to notify the user
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `Sorry, something went wrong when showing materials. Please try again!`
      });
    } catch (dmError) {
      console.error('Error sending error notification:', dmError);
    }
  }
});

// -------- STEP 3: Quantity Entry Modal --------
app.view('materials_select_modal', async ({ ack, body, view, client }) => {
  try {
    console.log('Processing materials selection from user:', body.user.id);
    
    // Get previous metadata
    const metadata = JSON.parse(view.private_metadata || '{}');
    const jobChannelId = metadata.jobChannelId;
    console.log('Job channel from metadata:', jobChannelId);
    
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
    
    console.log(`Selected ${selectedMaterials.length} materials`);

    if (selectedMaterials.length === 0) {
      // No materials selected - error
      await ack({
        response_action: "errors",
        errors: {
          "category_0": "Please select at least one material"
        }
      });
      return;
    }
    
    // Add check for maximum items - keeping to 20 for now
    if (selectedMaterials.length > 20) {
      // Too many materials - error
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
          text: `${mat.label}  -  per ${getSingularLabel(mat.unit)}`,
          emoji: true
        },
        element: {
          type: "plain_text_input",
          action_id: "quantity_input",
          initial_value: "1", // Default to 1 for convenience
          placeholder: {
            type: "plain_text",
            text: "Enter amount"
          }
        }
      };
    }).filter(block => block !== null);
    
    // KEY CHANGE: Update the current view instead of opening a new modal
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
        close: { type: "plain_text", text: "Cancel" },
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
    
    console.log('Quantity entry modal opened via view update');
  } catch (error) {
    console.error('Error updating to quantity entry modal:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    
    // Acknowledge with basic response to prevent timeouts
    await ack({
      response_action: "errors",
      errors: {
        "category_0": "Something went wrong. Please try again."
      }
    });
    
    // Try to notify the user
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `Sorry, something went wrong when handling materials. Please try again!`
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
    }
  }
});

// -------- STEP 4: Review Modal --------
app.view('quantity_entry_modal', async ({ ack, view, body, client }) => {
  try {
    console.log('Processing quantities from user:', body.user.id);
    
    // Validate and parse quantities
    const metadata = JSON.parse(view.private_metadata);
    const selectedIds = metadata.selectedIds;
    const jobChannelId = metadata.jobChannelId;
    const userId = metadata.user;
    const values = view.state.values;
    
    console.log(`Processing ${selectedIds.length} materials with quantities`);

    // Build material/quantity list and validate
    let hasError = false;
    const errorBlocks = {};
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
      // Return validation errors
      console.log('Validation errors in quantities');
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
    
    console.log('Updating view for review');

    // Update the current view
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
        close: { type: "plain_text", text: "Cancel" },
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
    
    console.log('Review modal opened via view update');
  } catch (error) {
    console.error('Error updating to review modal:', error);
    
    // Acknowledge with basic response to prevent timeouts
    await ack({
      response_action: "errors",
      errors: {
        "qty_": "Something went wrong. Please try again."
      }
    });
    
    // Try to notify the user
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `Sorry, something went wrong when processing quantities. Please try again!`
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
    }
  }
});

// -------- STEP 5: Submit and Post to Job Channel --------
app.view('review_modal', async ({ ack, body, view, client }) => {
  await ack();
  console.log('Review submission acknowledged successfully');
  
  try {
    console.log('Processing review submission from user:', body.user.id);
    
    // Get the data from private_metadata
    const metadata = JSON.parse(view.private_metadata);
    const { materialsWithQty, userId, dateStr, jobChannelId } = metadata;
    
    console.log(`Posting ${materialsWithQty.length} materials to channel ${jobChannelId}`);

    // Format the materials list with the same helper function
    const formattedMaterials = formatMaterialsList(materialsWithQty);

    // Get job channel name for better display
    let channelName = "";
    try {
      const channelInfo = await client.conversations.info({ channel: jobChannelId });
      channelName = channelInfo.channel.name;
      console.log('Retrieved channel name:', channelName);
    } catch (error) {
      console.error("Couldn't get channel info:", error);
      channelName = jobChannelId;
    }

    // Post the formatted message to the job channel
    console.log('Posting message to channel:', jobChannelId);
    await client.chat.postMessage({
      channel: jobChannelId,
      text: `Materials List for ${channelName} submitted by <@${userId}>`,
      blocks: [
        {
          type: "divider"
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
          type: "divider"
        }
      ]
    });
    console.log('Message posted to channel successfully');

    // Confirm to the user in a DM
    console.log('Sending confirmation to user:', userId);
    await client.chat.postMessage({
      channel: userId,
      text: `Materials list submitted to ${channelName}`,
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
    console.log('Confirmation sent to user');

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
  } catch (error) {
    console.error('Error processing review submission:', error);
    
    // Try to notify the user about the error
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `Sorry, there was an error submitting your materials list. Please try again!`
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
    }
  }
});

// Start the app
(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Service Bot is running on port', process.env.PORT || 3000);
  } catch (error) {
    console.error('Failed to start app:', error);
  }
})();
