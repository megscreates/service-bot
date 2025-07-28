const { App } = require('@slack/bolt');
const { materialCategories, getPluralLabel, getSingularLabel, getQuantityLabel } = require('./materials');

// Initialize your app with just what we need
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

// Add detailed error handling
app.error(async (error) => {
  console.error('SLACK APP ERROR:', error);
});

// Helper functions
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

function formatMaterialsList(materials) {
  let materialText = '';
  
  materials.forEach((mat) => {
    const prefix = "»";
    const qty = parseInt(mat.qty, 10);
    materialText += `${prefix}   *${mat.label}* — ${mat.qty} ${getQuantityLabel(mat.unit, qty)}\n\n`;
  });
  
  return materialText;
}

// -------- STEP 1: Job Channel Selection --------
app.command('/materials', async ({ ack, body, client }) => {
  try {
    console.log('Materials command triggered by user:', body.user_id);
    await ack();
    
    console.log('Opening job channel selection modal');
    const result = await client.views.open({
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
    console.log('Job channel selection modal opened with view ID:', result.view.id);
  } catch (err) {
    console.error('Error opening job channel selection modal:', err);
  }
});

// -------- STEP 2: Handle the channel selection --------
// SUPER SIMPLIFIED version that just acknowledges and does nothing else
app.view('job_channel_select', async ({ ack, body, view, client }) => {
  try {
    console.log('Channel selection view received, immediately acknowledging');
    // Just acknowledge and don't try to update view or open another modal
    await ack();
    console.log('Channel selection acknowledged successfully');
    
    // Get the selected job channel
    const jobChannelId = view.state.values.job_channel.job_channel_selected.selected_channel;
    console.log('Selected job channel:', jobChannelId);
    
    // Now send a direct message to the user instead of trying to open another modal
    console.log('Sending DM to user as confirmation');
    await client.chat.postMessage({
      channel: body.user.id,
      text: `You selected channel <#${jobChannelId}>. This is a test message to verify functionality.`
    });
    console.log('DM sent successfully');
    
  } catch (error) {
    console.error('Error in job_channel_select handler:', error);
    // Try to notify the user about the error
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `❌ Sorry, there was an error: ${error.message}`
      });
    } catch (dmError) {
      console.error('Error sending error notification:', dmError);
    }
  }
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log(`⚡️ Service Bot is running on port ${process.env.PORT || 3000}`);
  } catch (error) {
    console.error('Failed to start app:', error);
  }
})();
