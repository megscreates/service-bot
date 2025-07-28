const { App } = require('@slack/bolt');
const express = require('express');
const { materialCategories, getPluralLabel, getSingularLabel, getQuantityLabel } = require('./materials');

// Create Express app for handling requests
const expressApp = express();

// Initialize your Bolt app with both Socket Mode and HTTP
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  customRoutes: [
    {
      path: '/health',
      method: ['GET'],
      handler: (req, res) => {
        res.writeHead(200);
        res.end('Health check OK');
      },
    },
  ]
});

// Global error handler with better logging
app.error(async (error) => {
  console.error('SLACK APP ERROR:', JSON.stringify({
    name: error.name,
    message: error.message,
    code: error.code,
    stack: error.stack
  }));
});

// Helper functions (unchanged)
function getMaterialById(id) { /* your existing code */ }
function formatMaterialsList(materials) { /* your existing code */ }

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

// -------- STEP 2: Materials Selection Modal (with categories) --------
app.view('job_channel_select', async ({ ack, body, view, client }) => {
  // Acknowledge immediately to prevent timeouts
  await ack();
  console.log('Channel selection acknowledged');
  
  try {
    console.log('Job channel selected by user:', body.user.id);
    
    // Get the selected job channel
    const jobChannelId = view.state.values.job_channel.job_channel_selected.selected_channel;
    console.log('Selected job channel:', jobChannelId);
    
    // Create simpler blocks for testing
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Selected job: <#${jobChannelId}>\n\nTesting channel selection only.`
        }
      }
    ];

    // Use a separate API call to open a new modal instead of response_action
    console.log('Opening materials modal for testing');
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "materials_test_modal",
        title: { type: "plain_text", text: "Materials Test" },
        submit: { type: "plain_text", text: "Submit" },
        close: { type: "plain_text", text: "Cancel" },
        blocks: blocks
      }
    });
    
    console.log('Materials test modal opened successfully');
  } catch (error) {
    console.error('Error opening test modal:', error);
    console.error(JSON.stringify(error));
    
    // Try to notify the user
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: `❌ Sorry, there was an error processing your selection: ${error.message}`
      });
    } catch (notifyError) {
      console.error('Error sending error notification:', notifyError);
    }
  }
});

// Simple handler for test modal
app.view('materials_test_modal', async ({ ack, body, view }) => {
  try {
    console.log('Test modal submitted');
    await ack();
    console.log('Test modal acknowledged');
  } catch (error) {
    console.error('Error in test modal:', error);
  }
});

// Start the app
(async () => {
  try {
    // Start listening on a specific port
    expressApp.get('/ping', (req, res) => {
      res.send('pong');
    });
    
    expressApp.listen(process.env.PORT || 3000, () => {
      console.log(`Express server listening on port ${process.env.PORT || 3000}`);
    });
    
    // Start the Bolt app
    await app.start();
    console.log('⚡️ Service Bot is running!');
  } catch (error) {
    console.error('Failed to start app:', error);
  }
})();
