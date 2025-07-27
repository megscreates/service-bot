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

// -------- STEP 1: Material Selection Modal with Submit --------
app.command('/materials', async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "materials_select_modal",
        title: { type: "plain_text", text: "Materials Used" },
        submit: { type: "plain_text", text: "Next" }, // submit is required if you have input blocks!
        close: { type: "plain_text", text: "Cancel" },
        blocks: [
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
  } catch (err) {
    console.error(err);
  }
});

// -------- STEP 2: Quantity Entry Modal (swap modal on submit) --------
app.view('materials_select_modal', async ({ ack, body, view, client }) => {
  await ack();

  // Get selected material IDs
  const selected = view.state.values.materials_select.selected_materials.selected_options || [];
  const selectedIds = selected.map(opt => opt.value);

  if (selectedIds.length === 0) {
    // Optionally: show an error, but for now just return (Slack doesn't support error on multi_static_select input)
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

  await client.views.update({
    view_id: view.id,
    hash: view.hash,
    view: {
      type: "modal",
      callback_id: "quantity_entry_modal",
      private_metadata: JSON.stringify({ selectedIds, user: body.user.id }),
      title: { type: "plain_text", text: "Enter Quantities" },
      submit: { type: "plain_text", text: "Review" },
      close: { type: "plain_text", text: "Back" },
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: "*Enter the quantity used for each material:*" }
        },
        ...quantityBlocks
      ]
    }
  });
});

// -------- STEP 3: Review Modal (swap modal on submit) --------
app.view('quantity_entry_modal', async ({ ack, body, view, client }) => {
  // Validate and parse quantities
  const metadata = JSON.parse(view.private_metadata);
  const selectedIds = metadata.selectedIds;
  const userId = metadata.user;
  const values = view.state.values;

  let hasError = false;
  let errorBlocks = {};
  const materialsWithQty = selectedIds.map(id => {
    const mat = getMaterialById(id);
    const qtyBlock = values[`qty_${id}`];
    const qtyRaw = qtyBlock ? qtyBlock.quantity_input.value : null;
    const qty = parseInt(qtyRaw, 10);

    if (
      isNaN(qty) ||
      qty < 1 ||
      !/^\d+$/.test(qtyRaw)
    ) {
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
  } else {
    await ack();
  }

  // Review blocks
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
        { type: "mrkdwn", text: `*User:* <@${userId}>` },
        { type: "mrkdwn", text: `*Date:* ${dateStr}` }
      ]
    },
    ...materialsWithQty.map(mat => ({
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Material:*\n${mat.label}` },
        { type: "mrkdwn", text: `*Quantity:*\n${mat.qty}` }
      ]
    }))
  ];

  await client.views.update({
    view_id: view.id,
    hash: view.hash,
    view: {
      type: "modal",
      callback_id: "review_modal",
      private_metadata: JSON.stringify({ materialsWithQty, userId, dateStr }),
      title: { type: "plain_text", text: "Review Submission" },
      submit: { type: "plain_text", text: "Submit" },
      close: { type: "plain_text", text: "Back" },
      blocks: reviewBlocks
    }
  });
});

// -------- STEP 4: Success Message --------
app.view('review_modal', async ({ ack, body, view, client }) => {
  await ack();

  // Show success message (ephemeral for now)
  await client.chat.postEphemeral({
    channel: body.user.id,
    user: body.user.id,
    text: "✅ Materials submitted successfully!"
  });
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Service Bot is running!');
})();
