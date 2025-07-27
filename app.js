require('dotenv').config();
const { App } = require("@slack/bolt");
const { materialCategories, getHumanLabel } = require("./materials.js");

// ========== CONFIG ==========
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// ========== HELPERS ==========

// Generate Slack options for a given category
function getOptionsForCategory(category) {
  return category.items.map(item => ({
    text: { type: "plain_text", text: item.label },
    value: item.id
  }));
}

// Get item by ID
function getItemById(id) {
  for (let cat of materialCategories) {
    for (let item of cat.items) {
      if (item.id === id) return { ...item, category: cat.name };
    }
  }
  return null;
}

// ========== /materials COMMAND ==========

app.command("/materials", async ({ ack, body, client }) => {
  await ack();

  // Build modal with multi-select for each category
  const blocks = [];
  materialCategories.forEach(cat => {
    blocks.push(
      {
        type: "section",
        text: { type: "mrkdwn", text: `*${cat.name}*` }
      },
      {
        type: "input",
        block_id: `cat_${cat.name}`,
        label: { type: "plain_text", text: "Select materials:" },
        element: {
          type: "multi_static_select",
          action_id: "material_select",
          placeholder: { type: "plain_text", text: "Choose..." },
          options: getOptionsForCategory(cat)
        },
        optional: true
      }
    );
  });

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      callback_id: "materials_select",
      title: { type: "plain_text", text: "Materials Used" },
      submit: { type: "plain_text", text: "Next" },
      close: { type: "plain_text", text: "Cancel" },
      blocks
    }
  });
});

// ========== MATERIALS SELECTED: QUANTITY MODAL ==========

app.view("materials_select", async ({ ack, body, view, client }) => {
  await ack();

  // Gather selected item IDs
  let selectedIds = [];
  for (let key in view.state.values) {
    const block = view.state.values[key];
    if (block.material_select && block.material_select.selected_options) {
      selectedIds = selectedIds.concat(
        block.material_select.selected_options.map(opt => opt.value)
      );
    }
  }
  // Remove duplicates (just in case)
  selectedIds = [...new Set(selectedIds)];

  // Build quantity input modal
  const blocks = selectedIds.map(id => {
    const item = getItemById(id);
    return {
      type: "input",
      block_id: `qty_${id}`,
      label: {
        type: "plain_text",
        text: `${item.label} → ${getHumanLabel(item.unit)}`
      },
      element: {
        type: "plain_text_input",
        action_id: "quantity",
        placeholder: {
          type: "plain_text",
          text: `How many ${getHumanLabel(item.unit)}?`
        }
      }
    };
  });

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      callback_id: "materials_quantity",
      title: { type: "plain_text", text: "Enter Quantities" },
      submit: { type: "plain_text", text: "Review" },
      close: { type: "plain_text", text: "Back" },
      private_metadata: JSON.stringify({ selectedIds }),
      blocks
    }
  });
});

// ========== QUANTITY MODAL: REVIEW & CONFIRM ==========

app.view("materials_quantity", async ({ ack, body, view, client }) => {
  await ack();

  const { selectedIds } = JSON.parse(view.private_metadata);
  const entries = selectedIds.map(id => {
    const item = getItemById(id);
    const qty =
      view.state.values[`qty_${id}`].quantity.value;
    return {
      ...item,
      quantity: qty
    };
  });

  // Build confirmation/review modal
  const reviewBlocks = [
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Review & Confirm Materials Used*" }
    },
    { type: "divider" },
    ...entries.map(entry => ({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${entry.label}*: ${entry.quantity} ${getHumanLabel(entry.unit)}`
      }
    }))
  ];

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      callback_id: "materials_review",
      title: { type: "plain_text", text: "Review & Confirm" },
      submit: { type: "plain_text", text: "Confirm" },
      close: { type: "plain_text", text: "Back" },
      private_metadata: JSON.stringify({ entries }),
      blocks: reviewBlocks
    }
  });
});

// ========== FINAL CONFIRM: LOG OR DM ==========

app.view("materials_review", async ({ ack, body, view, client }) => {
  await ack();

  const { entries } = JSON.parse(view.private_metadata);

  // Simple: DM user with their materials log (replace with Google Sheets logic later)
  const userId = body.user.id;
  const lines = entries.map(
    entry =>
      `• *${entry.label}*: ${entry.quantity} ${getHumanLabel(entry.unit)}`
  );
  await client.chat.postMessage({
    channel: userId,
    text: `:white_check_mark: *Logged Materials Used:*\n${lines.join("\n")}`
  });

  // TODO: Post to channel & log to Google Sheets here!
});

// ========== START APP ==========

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Service Hub app is running!");
})();
