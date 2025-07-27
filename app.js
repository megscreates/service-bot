const { App } = require('@slack/bolt');
const { getMaterialsByCategory, getMaterial, getCategories } = require('./materials');

// Initialize your app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Command to open materials modal
app.command('/materials', async ({ ack, body, client }) => {
  await ack();
  
  try {
    // Open the materials selection modal
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildMaterialSelectionView()
    });
  } catch (error) {
    console.error(error);
  }
});

// Build the view with category-based material selection
function buildMaterialSelectionView() {
  const categories = getMaterialsByCategory();
  const blocks = [];
  
  // For each category, add a header and multi-select
  Object.keys(categories).forEach(category => {
    // Add category header
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: category
      }
    });
    
    // Create category ID for block_id (lowercase, no spaces)
    const categoryId = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Add multi-select for this category
    blocks.push({
      type: "input",
      block_id: `${categoryId}_select`,
      optional: true,
      label: {
        type: "plain_text",
        text: `Select ${category.toLowerCase()}`
      },
      element: {
        type: "multi_static_select",
        action_id: `${categoryId}_select_action`,
        placeholder: {
          type: "plain_text",
          text: `Select items...`
        },
        options: categories[category].map(item => ({
          text: {
            type: "plain_text",
            text: item.label
          },
          value: item.id
        }))
      }
    });
    
    // Add divider between categories (except after the last one)
    blocks.push({
      type: "divider"
    });
  });
  
  return {
    type: "modal",
    callback_id: "materials_select_modal",
    title: {
      type: "plain_text",
      text: "Materials Used"
    },
    submit: {
      type: "plain_text",
      text: "Next"
    },
    close: {
      type: "plain_text",
      text: "Cancel"
    },
    blocks: blocks
  };
}

// Handle submission of the materials selection modal
app.view('materials_select_modal', async ({ ack, body, view, client }) => {
  await ack();
  
  try {
    // Extract selected material IDs from all categories
    const selectedMaterialIds = [];
    const categories = getMaterialsByCategory();
    
    Object.keys(categories).forEach(category => {
      const categoryId = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const blockId = `${categoryId}_select`;
      
      // Check if this category block exists and has selections
      if (view.state.values[blockId] && 
          view.state.values[blockId][`${categoryId}_select_action`] &&
          view.state.values[blockId][`${categoryId}_select_action`].selected_options) {
        
        const selectedInCategory = view.state.values[blockId][`${categoryId}_select_action`].selected_options;
        selectedMaterialIds.push(...selectedInCategory.map(opt => opt.value));
      }
    });
    
    if (selectedMaterialIds.length === 0) {
      // No materials selected, show an error
      await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          type: "modal",
          title: {
            type: "plain_text",
            text: "Error"
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Please select at least one material."
              }
            }
          ]
        }
      });
      return;
    }
    
    // Open the quantity collection modal for selected materials
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildQuantityCollectionView(selectedMaterialIds)
    });
  } catch (error) {
    console.error(error);
  }
});

// Build the quantity collection view
function buildQuantityCollectionView(materialIds) {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Enter quantities for selected materials:*"
      }
    },
    {
      type: "divider"
    }
  ];
  
  // Create input fields for each selected material
  materialIds.forEach(materialId => {
    const material = getMaterial(materialId);
    if (!material) return;
    
    blocks.push({
      type: "input",
      block_id: `quantity_${materialId}`,
      label: {
        type: "plain_text",
        text: `${material.label} (${material.unit})`,
        emoji: true
      },
      element: {
        type: "number_input",
        is_decimal_allowed: true,
        action_id: "quantity_value",
        initial_value: "1"
      }
    });
  });
  
  return {
    type: "modal",
    callback_id: "quantity_collection_modal",
    title: {
      type: "plain_text",
      text: "Enter Quantities"
    },
    submit: {
      type: "plain_text",
      text: "Review"
    },
    close: {
      type: "plain_text",
      text: "Back"
    },
    private_metadata: JSON.stringify({ materialIds }),
    blocks: blocks
  };
}

// Handle submission of the quantity collection modal
app.view('quantity_collection_modal', async ({ ack, body, view, client }) => {
  await ack();
  
  try {
    const { materialIds } = JSON.parse(view.private_metadata || '{}');
    const materialQuantities = [];
    
    // Extract quantities for each material
    materialIds.forEach(materialId => {
      const material = getMaterial(materialId);
      if (!material) return;
      
      const blockId = `quantity_${materialId}`;
      if (view.state.values[blockId] && view.state.values[blockId].quantity_value) {
        const quantity = parseFloat(view.state.values[blockId].quantity_value.value);
        materialQuantities.push({
          id: materialId,
          label: material.label,
          unit: material.unit,
          category: material.category,
          quantity
        });
      }
    });
    
    // Open the review modal
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildReviewView(materialQuantities)
    });
  } catch (error) {
    console.error(error);
  }
});

// Build the review view
function buildReviewView(materialQuantities) {
  // Group the materials by category for the review
  const categorizedMaterials = {};
  materialQuantities.forEach(material => {
    if (!categorizedMaterials[material.category]) {
      categorizedMaterials[material.category] = [];
    }
    categorizedMaterials[material.category].push(material);
  });

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Review Material Quantities:*"
      }
    },
    {
      type: "divider"
    }
  ];

  // Add each category and its materials
  Object.keys(categorizedMaterials).forEach(category => {
    // Add category header
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: category
      }
    });

    // Add each material in this category
    categorizedMaterials[category].forEach(material => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${material.label}:* ${material.quantity} ${material.unit}`
        }
      });
    });

    // Add divider between categories
    blocks.push({
      type: "divider"
    });
  });

  return {
    type: "modal",
    callback_id: "review_modal",
    title: {
      type: "plain_text",
      text: "Review Materials"
    },
    submit: {
      type: "plain_text",
      text: "Submit"
    },
    close: {
      type: "plain_text",
      text: "Back"
    },
    private_metadata: JSON.stringify({ materialQuantities }),
    blocks: blocks
  };
}

// Handle submission of the review modal
app.view('review_modal', async ({ ack, body, view, client }) => {
  await ack();
  
  try {
    const { materialQuantities } = JSON.parse(view.private_metadata || '{}');
    
    // Generate message to post in channel
    let messageText = "*Materials Used:*\n";
    
    // Group the materials by category for the message
    const categorizedMaterials = {};
    materialQuantities.forEach(material => {
      if (!categorizedMaterials[material.category]) {
        categorizedMaterials[material.category] = [];
      }
      categorizedMaterials[material.category].push(material);
    });
    
    Object.keys(categorizedMaterials).forEach(category => {
      messageText += `\n*${category}*\n`;
      
      categorizedMaterials[category].forEach(material => {
        messageText += `• ${material.label}: ${material.quantity} ${material.unit}\n`;
      });
    });
    
    // Post the message in the channel where the command was triggered
    await client.chat.postMessage({
      channel: body.user.id, // Send as DM to the user
      text: messageText
    });
    
    // Show confirmation modal
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: "modal",
        title: {
          type: "plain_text",
          text: "Success!"
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Your materials have been submitted successfully."
            }
          }
        ],
        close: {
          type: "plain_text",
          text: "Close"
        }
      }
    });
  } catch (error) {
    console.error(error);
  }
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
