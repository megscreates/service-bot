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

// Command handler
app.command('/materials', async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        callback_id: "materials_modal",
        title: { type: "plain_text", text: "Materials Used" },
        submit: { type: "plain_text", text: "Submit" },
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

// Listen for modal updates (dynamic quantity fields)
app.action('selected_materials', async ({ ack, body, client }) => {
  await ack();

  const selectedIds = body.actions[0].selected_options.map(opt => opt.value);

  // Build blocks: select + quantity input for each material
  const blocks = [
    {
      type: "input",
      block_id: "materials_select",
      label: { type: "plain_text", text: "Select materials used" },
      element: {
        type: "multi_static_select",
        action_id: "selected_materials",
        placeholder: { type: "plain_text", text: "Choose materials" },
        options: materialOptions(),
        initial_options: materialOptions().filter(opt => selectedIds.includes(opt.value))
      }
    },
    ...selectedIds.map(id => {
      const mat = getMaterialById(id);
      return {
        type: "input",
        block_id: `qty_${id}`,
        label: {
          type: "plain_text",
          text: `How much ${mat.label}? (${getHumanLabel(mat.unit)})`
        },
        element: {
          type: "plain_text_input",
          action_id: "quantity_input",
          placeholder: { type: "plain_text", text: "Quantity (e.g. 2.5)" }
        }
      };
    })
  ];

  // Update the modal
  await client.views.update({
    view_id: body.view.id,
    hash: body.view.hash,
    view: {
      type: "modal",
      callback_id: "materials_modal",
      title: { type: "plain_text", text: "Materials Used" },
      submit: { type: "plain_text", text: "Submit" },
      close: { type: "plain_text", text: "Cancel" },
      blocks
    }
  });
});

// Modal submission handler
app.view('materials_modal', async ({ ack, body, view, client }) => {
  const values = view.state.values;
  const selected = values.materials_select.selected_materials.selected_options || [];

  // Collect material/quantity pairs and validate
  let hasError = false;
  let errorBlocks = {};

  const usedMaterials = selected.map(opt => {
    const id = opt.value;
    const mat = getMaterialById(id);
    const qtyBlock = values[`qty_${id}`];
    const qtyRaw = qtyBlock ? qtyBlock.quantity_input.value : null;
    const qty = parseFloat(qtyRaw);

    // Validation: min 0.5, max 999, positive, 2 decimals max
    if (
      isNaN(qty) ||
      qty < 0.5 ||
      qty > 999 ||
      !/^\d+(\.\d{1,2})?$/.test(qtyRaw)
    ) {
      hasError = true;
      errorBlocks[`qty_${id}`] = "Enter a number between 0.5 and 999 (up to 2 decimals).";
    }

    return {
      id,
      label: mat.label,
      unit: mat.unit,
      qty: qtyRaw
    };
  });

  // If any errors, respond with errors
  if (hasError) {
    await ack({
      response_action: "errors",
      errors: errorBlocks
    });
    return;
  }

  await ack();

  // Compose summary message
  const userTag = `<@${body.user.id}>`;
  const summary = usedMaterials
    .map(mat => `${mat.label} (${mat.qty} ${getHumanLabel(mat.unit)})`)
    .join(", ");

  const channel = body['channel']['id'] || view.private_metadata || null; // fallback if needed

  // Post to the channel where the command was issued
  await client.chat.postMessage({
    channel: body['channel']['id'] || body['view']['private_metadata'] || body['response_urls']?.[0]?.channel_id,
    text: `${userTag} used: ${summary}`
  });
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Service Bot is running!');
})();
